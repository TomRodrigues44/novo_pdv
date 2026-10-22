import { sql } from '../../../utils/db';
import { sendCashRegisterCloseEmail } from '../../../lib/email';

function getCategory(description: string) {
  if (description.startsWith('Taxa Entrega')) return 'taxa_entrega';
  if (description.startsWith('iFood')) return 'ifood';
  if (description.startsWith('Brigadeiros')) return 'brigadeiros';
  return 'outros';
}

function extractPerson(description: string, prefix: string) {
  return description.replace(new RegExp(`^${prefix}\\s*(?:-|:)?\\s*`, 'i'), '').trim();
}

async function buildEmailData(register: any) {
  const salesRows = await sql`
    SELECT s.id, s.total_amount, sp.payment_type, sp.amount
    FROM sales s
    LEFT JOIN sale_payments sp ON sp.sale_id = s.id
    WHERE s.created_at >= ${register.opened_at}
      AND s.created_at <= ${register.closed_at}
      AND s.status != 'cancelled'
      AND s.xml_status != 'cancelled'
  `;

  const saleMap = new Map<string, any>();
  for (const row of salesRows) {
    if (!saleMap.has(row.id)) {
      saleMap.set(row.id, { total: Number(row.total_amount || 0), cash: 0, debit: 0, credit: 0, pix: 0 });
    }
    const sale = saleMap.get(row.id);
    const type = String(row.payment_type || '').toLowerCase();
    if (['cash', 'debit', 'credit', 'pix'].includes(type)) {
      sale[type] += Number(row.amount || 0);
    }
  }

  let salesTotal = 0;
  const salesByPayment = { cash: 0, debit: 0, credit: 0, pix: 0 };
  for (const sale of saleMap.values()) {
    salesTotal += sale.total;
    const nonCash = sale.debit + sale.credit + sale.pix;
    salesByPayment.cash += Math.min(sale.cash, Math.max(sale.total - nonCash, 0));
    salesByPayment.debit += sale.debit;
    salesByPayment.credit += sale.credit;
    salesByPayment.pix += sale.pix;
  }

  const transactions = await sql`
    SELECT * FROM cash_transactions
    WHERE cash_register_id = ${register.id}
    ORDER BY created_at DESC
  `;

  const withdrawals = transactions.filter((t: any) => t.type === 'withdrawal');
  const vouchers = transactions.filter((t: any) => t.type === 'voucher');
  const additions = transactions.filter((t: any) => t.type === 'addition');

  const totalsByCategory: any = { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 };
  const motoboyMap: Record<string, any> = {};

  for (const transaction of withdrawals) {
    const description = String(transaction.description || '');
    const amount = Number(transaction.amount || 0);
    totalsByCategory[getCategory(description)] += amount;

    let name = '';
    let kind: 'delivery' | 'ifood' | null = null;
    if (description.startsWith('Taxa Entrega')) {
      name = extractPerson(description, 'Taxa Entrega');
      kind = 'delivery';
    } else if (description.startsWith('iFood')) {
      name = extractPerson(description, 'iFood');
      kind = 'ifood';
    }

    if (kind && name && name.toLowerCase() !== 'desconhecido') {
      if (!motoboyMap[name]) {
        motoboyMap[name] = { name, delivery: 0, ifood: 0, total: 0, deliveryCount: 0, ifoodCount: 0, totalCount: 0 };
      }
      motoboyMap[name][kind] += amount;
      motoboyMap[name].total += amount;
      motoboyMap[name][kind === 'delivery' ? 'deliveryCount' : 'ifoodCount'] += 1;
      motoboyMap[name].totalCount += 1;
    }
  }

  const totalSangrias = Object.values(totalsByCategory).reduce((sum: number, value: any) => sum + Number(value || 0), 0);
  const voucherTotal = vouchers.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  const additionTotal = additions.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  const openingAmount = Number(register.opening_amount || 0);
  const valorInformado = Number(register.closing_amount || 0);
  const expectedAmount = Number(register.expected_amount || 0);
  const difference = Number(register.difference ?? (valorInformado - expectedAmount));

  let changeCounts = register.change_counts || {};
  if (typeof changeCounts === 'string') {
    try { changeCounts = JSON.parse(changeCounts); } catch { changeCounts = {}; }
  }

  const changeNeeded = Boolean(register.change_needed);
  const changeTotal = Number(register.change_total || 0);
  const envelopeTotal = Number(register.envelope_total || 0);

  const companyConfigResult = await sql`
    SELECT identificacao_loja
    FROM company_fiscal_config
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return {
    openingAmount,
    salesTotal,
    calculatedClosingCash: salesTotal - totalSangrias,
    salesByPayment,
    totalsByCategory,
    totalSangrias,
    motoboys: Object.values(motoboyMap).sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt-BR')),
    vouchers: vouchers.map((t: any) => ({ description: t.description, amount: Number(t.amount || 0) })),
    voucherTotal,
    additions: additions.map((t: any) => ({ description: t.description, amount: Number(t.amount || 0) })),
    additionTotal,
    valorInformado,
    expectedAmount,
    difference,
    closedAt: register.closed_at,
    notes: register.notes,
    identificacaoLoja: companyConfigResult[0]?.identificacao_loja || null,
    changeNeeded,
    changeCounts,
    changeTotal,
    envelopeTotal,
  };
}

export default defineEventHandler(async () => {
  // Se o processo caiu durante um envio, libera novamente após 5 minutos.
  await sql`
    UPDATE cash_registers
    SET email_status = 'pending'
    WHERE email_status = 'sending'
      AND email_last_attempt_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes'
  `;

  const claimed = await sql.transaction(async (tx) => {
    const rows = await tx.query(`
      SELECT *
      FROM cash_registers
      WHERE status = 'closed'
        AND email_status = 'pending'
        AND COALESCE(email_attempts, 0) < 20
        AND (email_last_attempt_at IS NULL OR email_last_attempt_at < CURRENT_TIMESTAMP - INTERVAL '1 minute')
      ORDER BY closed_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `);

    if (rows.length === 0) return null;
    const register = rows[0];

    await tx.query(`
      UPDATE cash_registers
      SET email_status = 'sending',
          email_attempts = COALESCE(email_attempts, 0) + 1,
          email_last_attempt_at = CURRENT_TIMESTAMP,
          email_last_error = NULL
      WHERE id = $1
    `, [register.id]);

    return register;
  });

  if (!claimed) {
    return { success: true, processed: false, message: 'Nenhum e-mail pendente' };
  }

  try {
    const emailData = await buildEmailData(claimed);
    const result = await sendCashRegisterCloseEmail(emailData);

    if (!result.success) {
      await sql`
        UPDATE cash_registers
        SET email_status = 'pending',
            email_last_error = ${result.error || 'Erro ao enviar e-mail'}
        WHERE id = ${claimed.id}
      `;
      return { success: false, processed: true, id: claimed.id, error: result.error };
    }

    await sql`
      UPDATE cash_registers
      SET email_status = 'sent',
          email_sent_at = CURRENT_TIMESTAMP,
          email_last_error = NULL
      WHERE id = ${claimed.id}
    `;

    return { success: true, processed: true, id: claimed.id, message: 'E-mail pendente enviado' };
  } catch (error: any) {
    await sql`
      UPDATE cash_registers
      SET email_status = 'pending',
          email_last_error = ${error?.message || 'Erro inesperado no reenvio'}
      WHERE id = ${claimed.id}
    `;

    console.error('Erro ao reenviar e-mail pendente:', error);
    return { success: false, processed: true, id: claimed.id, error: error?.message || 'Erro inesperado' };
  }
});

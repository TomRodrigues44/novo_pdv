import { sql } from '../../../../utils/db';
import { sendCashRegisterCloseEmail } from '../../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do caixa é obrigatório',
      });
    }

    // Buscar dados do caixa fechado
    const registerResult = await sql`
      SELECT * FROM cash_registers
      WHERE id = ${id} AND status = 'closed'
      LIMIT 1
    `;

    if (registerResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Caixa fechado não encontrado',
      });
    }

    const register = registerResult[0];

    // Buscar vendas para este caixa
    const salesAndPayments = await sql`
      SELECT
        s.id,
        s.total_amount,
        s.status,
        s.xml_status,
        sp.payment_type,
        sp.amount
      FROM sales s
      LEFT JOIN sale_payments sp ON s.id = sp.sale_id
      WHERE s.created_at >= ${register.opened_at}
        AND s.status != 'cancelled'
        AND s.xml_status != 'cancelled'
    `;

    let salesTotal = 0;
    const salesByPayment: Record<string, number> = {
      cash: 0,
      debit: 0,
      credit: 0,
      pix: 0,
    };
    const processedSales = new Set();

    salesAndPayments.forEach(row => {
      if (!processedSales.has(row.id)) {
        salesTotal += parseFloat(row.total_amount);
        processedSales.add(row.id);
      }
      if (row.payment_type && row.amount) {
        const type = row.payment_type.toLowerCase();
        if (salesByPayment[type] !== undefined) {
          salesByPayment[type] += parseFloat(row.amount);
        }
      }
    });

    // Buscar transações para este caixa
    const transactionsResult = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      ORDER BY created_at DESC
    `;

    const transactions = transactionsResult;

    let withdrawals = 0;
    let additions = 0;
    let vouchers = 0;

    const vouchersList: Array<{ description: string; amount: number }> = [];
    const additionsList: Array<{ description: string; amount: number }> = [];

    const totalsByCategory = {
      taxa_entrega: 0,
      ifood: 0,
      brigadeiros: 0,
      outros: 0,
    };

    transactions.forEach((trans: any) => {
      const total = parseFloat(trans.amount);
      const desc = trans.description || '';

      if (trans.type === 'withdrawal') {
        withdrawals += total;

        if (desc.startsWith('Taxa Entrega')) {
          totalsByCategory.taxa_entrega += total;
        } else if (desc.startsWith('iFood')) {
          totalsByCategory.ifood += total;
        } else if (desc.startsWith('Brigadeiros')) {
          totalsByCategory.brigadeiros += total;
        } else {
          totalsByCategory.outros += total;
        }
      } else if (trans.type === 'addition') {
        additions += total;
        additionsList.push({ description: desc, amount: total });
      } else if (trans.type === 'voucher') {
        vouchers += total;
        vouchersList.push({ description: desc, amount: total });
      }
    });

    const totalSangrias = totalsByCategory.taxa_entrega + totalsByCategory.ifood + totalsByCategory.brigadeiros + totalsByCategory.outros;
    const openingAmount = parseFloat(register.opening_amount);
    const calculatedClosingCash = salesTotal - totalSangrias;
    const valorInformado = parseFloat(register.closing_amount) || 0;
    const expectedAmount = parseFloat(register.expected_amount) || (openingAmount + salesByPayment.cash + additions - totalSangrias - vouchers);
    const difference = parseFloat(register.difference) || (valorInformado - expectedAmount);

    const emailData = {
      openingAmount,
      salesTotal,
      calculatedClosingCash,
      salesByPayment,
      totalsByCategory,
      totalSangrias,
      vouchers: vouchersList,
      voucherTotal: vouchers,
      additions: additionsList,
      additionTotal: additions,
      valorInformado,
      expectedAmount,
      difference,
      closedAt: register.closed_at,
      notes: register.notes,
    };

    const result = await sendCashRegisterCloseEmail(emailData);

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Erro ao enviar e-mail',
      });
    }

    return {
      success: true,
      message: 'E-mail de fechamento reenviado com sucesso!',
    };
  } catch (error: any) {
    console.error('Error sending cash register close email:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao enviar e-mail de fechamento',
    });
  }
});
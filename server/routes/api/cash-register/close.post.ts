import { sql } from '../../../utils/db';
import { sendCashRegisterCloseEmail } from '../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    const { closingAmount, notes } = await readBody(event);
    
    // Buscar caixa aberto
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum caixa aberto encontrado'
      });
    }
    
    const register = openRegister[0];

    const sales = await sql`
      SELECT
        s.id,
        s.total_amount,
        COALESCE(SUM(sp.amount) FILTER (WHERE sp.payment_type = 'cash'), 0) AS cash_paid,
        COALESCE(SUM(sp.amount) FILTER (WHERE sp.payment_type <> 'cash'), 0) AS non_cash_paid
      FROM sales s
      LEFT JOIN sale_payments sp ON sp.sale_id = s.id
      WHERE s.created_at >= ${register.opened_at}
        AND s.status != 'cancelled'
        AND s.xml_status != 'cancelled'
      GROUP BY s.id, s.total_amount
    `;

    let salesTotal = 0;
    let cashSales = 0;

    sales.forEach((sale) => {
      const total = parseFloat(sale.total_amount);
      const cashPaid = parseFloat(sale.cash_paid);
      const nonCashPaid = parseFloat(sale.non_cash_paid);
      const netCash = Math.min(cashPaid, Math.max(total - nonCashPaid, 0));

      salesTotal += total;
      cashSales += netCash;
    });
    
    // Calcular transações para este caixa
    const transactionsResult = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      ORDER BY created_at DESC
    `;
    
    const transactions = transactionsResult;
    
    let withdrawals = 0;  // Sangrias
    let additions = 0;   // Adições
    let vouchers = 0;    // Vales
    
    const vouchersList: Array<{ description: string; amount: number }> = [];
    const additionsList: Array<{ description: string; amount: number }> = [];
    
    const totalsByCategory = {
      taxa_entrega: 0,
      ifood: 0,
      brigadeiros: 0,
      outros: 0,
    };
    
    transactions.forEach((trans) => {
      const total = parseFloat(trans.amount);
      const desc = trans.description || '';
      
      if (trans.type === 'withdrawal') {
        withdrawals += total;
        
        // Categorizar sangria
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
    
    // Fechamento Caixa (Calc) = Total Vendas - Total Sangrias
    const calculatedClosingCash = salesTotal - totalSangrias;
    
    // VALOR INFORMADO = Valor Contado (o que o operador digitou)
    const valorInformado = parseFloat(closingAmount) || 0;
    
    // VALOR ESPERADO = Abertura + Vendas em Dinheiro + Adições - Sangrias - Vales
    const expectedAmount = openingAmount + cashSales + additions - totalSangrias - vouchers;
    
    // Diferença = Valor Informado - Valor Esperado
    const difference = valorInformado - expectedAmount;
    
    // Atualizar caixa
    await sql`
      UPDATE cash_registers
      SET
        closed_at = CURRENT_TIMESTAMP,
        closing_amount = ${closingAmount},
        expected_amount = ${expectedAmount},
        difference = ${difference},
        status = 'closed',
        notes = ${notes || null}
      WHERE id = ${register.id}
    `;
    
    const result = { 
      success: true, 
      salesTotal,
      cashSales,
      closingCash: calculatedClosingCash,
      expectedCashAmount: expectedAmount,
      expectedTotalAmount: openingAmount + salesTotal + additions - totalSangrias - vouchers,
      withdrawals: totalSangrias,
      additions,
      vouchers,
      difference
    };

    // Enviar e-mail de forma assíncrona (não bloquear a resposta)
    const emailData = {
      openingAmount,
      salesTotal,
      calculatedClosingCash,
      salesByPayment: {
        cash: register.salesByPayment?.cash || 0,
        debit: register.salesByPayment?.debit || 0,
        credit: register.salesByPayment?.credit || 0,
        pix: register.salesByPayment?.pix || 0,
      },
      totalsByCategory,
      totalSangrias,
      vouchers: vouchersList,
      voucherTotal: vouchers,
      additions: additionsList,
      additionTotal: additions,
      valorInformado,
      expectedAmount,
      difference,
      closedAt: new Date().toISOString(),
      notes,
    };

    // Disparar e-mail em background
    sendCashRegisterCloseEmail(emailData).catch((err) => {
      console.error('Erro ao enviar e-mail (background):', err);
    });

    return result;
  } catch (error) {
    console.error('Error closing cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error closing cash register',
    });
  }
});
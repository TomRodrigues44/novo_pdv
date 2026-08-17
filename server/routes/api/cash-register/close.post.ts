import { sql } from '../../../utils/db';
import { sendCashRegisterReport, createTransporter, getEmailConfig } from '../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    const { closingAmount, notes, sendEmail = false } = await readBody(event);
    
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
    
    // Calcular transações (sangrias/adições/vales)
    const transactionsResult = await sql`
      SELECT type, COALESCE(SUM(amount), 0) as total
      FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      GROUP BY type
    `;
    
    let withdrawals = 0;  // Sangrias
    let additions = 0;   // Adições
    let vouchers = 0;    // Vales
    
    transactionsResult.forEach((trans) => {
      const total = parseFloat(trans.total);
      if (trans.type === 'withdrawal') {
        withdrawals += total;
      } else if (trans.type === 'addition') {
        additions += total;
      } else if (trans.type === 'voucher') {
        vouchers += total;
      }
    });
    
    const openingAmount = parseFloat(register.opening_amount);
    
    // Fechamento do Caixa = Total Vendas - Apenas Sangrias (Vales não entram aqui)
    const closingCash = salesTotal - withdrawals;
    
    // Valor esperado em dinheiro = Abertura + Vendas em Dinheiro + Adições - Sangrias - Vales
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals - vouchers;
    
    // Valor esperado total = Abertura + Todas as Vendas + Adições - Sangrias - Vales
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals - vouchers;
    
    const difference = closingAmount - expectedCashAmount;
    
    // Atualizar caixa
    await sql`
      UPDATE cash_registers
      SET
        closed_at = CURRENT_TIMESTAMP,
        closing_amount = ${closingAmount},
        expected_amount = ${expectedCashAmount},
        difference = ${difference},
        status = 'closed',
        notes = ${notes || null}
      WHERE id = ${register.id}
    `;
    
    // Gerar HTML do relatório para e-mail
    const reportHtml = generateReportHtml({
      openingAmount,
      salesTotal,
      closingCash,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      vouchers,
      difference,
      closingAmount,
      cashSales,
      salesByPayment: {
        cash: cashSales,
        debit: 0,
        credit: 0,
        pix: 0,
      },
      transactions: transactionsResult,
      closedAt: new Date().toISOString(),
    });
    
    // Enviar e-mail se solicitado
    let emailSent = false;
    if (sendEmail) {
      try {
        const emailConfig = await getEmailConfig();
        if (emailConfig) {
          await createTransporter(emailConfig);
          emailSent = await sendCashRegisterReport(
            { ...register, opening_amount: openingAmount, closing_amount: closingAmount },
            { salesTotal, closingCash, expectedCashAmount, expectedTotalAmount, withdrawals, additions, vouchers, difference, cashSales },
            reportHtml
          );
        }
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError);
        // Não falhar o fechamento se o e-mail falhar
      }
    }
    
    return { 
      success: true, 
      salesTotal,
      cashSales,
      closingCash,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      vouchers,
      difference,
      emailSent,
    };
  } catch (error) {
    console.error('Error closing cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error closing cash register',
    });
  }
});

function generateReportHtml(data: any): string {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('pt-BR');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Fechamento de Caixa</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
        .header h1 { color: #f59e0b; margin: 0; }
        .section { margin-bottom: 20px; }
        .section h2 { background-color: #f59e0b; color: white; padding: 8px 12px; border-radius: 4px; font-size: 16px; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ccc; }
        .row.bold { font-weight: bold; font-size: 16px; }
        .total { font-size: 18px; font-weight: bold; color: #f59e0b; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
        .difference-positive { color: #10b981; }
        .difference-negative { color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>EMPÓRIO DAS COXINHAS</h1>
        <p>Relatório de Fechamento de Caixa</p>
        <p>Data: ${formatDateTime(data.closedAt)}</p>
      </div>

      <div class="section">
        <h2>Resumo do Caixa</h2>
        <div class="row"><span>Abertura:</span><span class="bold">${formatCurrency(data.openingAmount)}</span></div>
        <div class="row"><span>Total Vendas:</span><span class="bold">${formatCurrency(data.salesTotal)}</span></div>
        <div class="row"><span>Fechamento Caixa (Calc):</span><span class="bold">${formatCurrency(data.closingCash)}</span></div>
      </div>

      <div class="section">
        <h2>Vendas por Forma</h2>
        <div class="row"><span>Dinheiro:</span><span>${formatCurrency(data.salesByPayment.cash)}</span></div>
        <div class="row"><span>Débito:</span><span>${formatCurrency(data.salesByPayment.debit)}</span></div>
        <div class="row"><span>Crédito:</span><span>${formatCurrency(data.salesByPayment.credit)}</span></div>
        <div class="row"><span>Pix:</span><span>${formatCurrency(data.salesByPayment.pix)}</span></div>
      </div>

      <div class="section">
        <h2>Sangrias</h2>
        <div class="row"><span>Total Sangrias:</span><span class="bold" style="color: #ef4444;">-${formatCurrency(data.withdrawals)}</span></div>
      </div>

      <div class="section">
        <h2>Vales</h2>
        <div class="row"><span>Total Vales:</span><span class="bold" style="color: #f59e0b;">-${formatCurrency(data.vouchers)}</span></div>
      </div>

      <div class="section">
        <h2>Adições</h2>
        <div class="row"><span>Total Adições:</span><span class="bold" style="color: #10b981;">+${formatCurrency(data.additions)}</span></div>
      </div>

      <div class="section">
        <h2>Conferência</h2>
        <div class="row"><span>Valor Informado (Contado):</span><span class="bold">${formatCurrency(data.closingAmount)}</span></div>
        <div class="row"><span>Valor Esperado:</span><span class="bold">${formatCurrency(data.expectedCashAmount)}</span></div>
        <div class="row total"><span>DIFERENÇA:</span><span class="${data.difference >= 0 ? 'difference-positive' : 'difference-negative'}">${formatCurrency(data.difference)}</span></div>
        <div class="row">
          <span>Status:</span>
          <span class="bold">
            ${data.difference > 0 ? 'Sobrou dinheiro' : data.difference < 0 ? 'Faltou dinheiro' : 'Caixa fechou exato'}
          </span>
        </div>
      </div>

      <div class="footer">
        <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
        <p>Empório das Coxinhas</p>
      </div>
    </body>
    </html>
  `;
}
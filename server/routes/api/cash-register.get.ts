import { sql } from '../../lib/db';

export default defineEventHandler(async () => {
  try {
    // Buscar caixa aberto
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    
    let currentRegister = null;
    let salesTotal = 0;
    let salesByPayment = {
      cash: 0,
      debit: 0,
      credit: 0,
      pix: 0,
    };
    
    if (openRegister.length > 0) {
      currentRegister = openRegister[0];
      
      // Buscar todas as vendas do período
      const sales = await sql`
        SELECT * FROM sales
        WHERE created_at >= ${currentRegister.opened_at}
      `;
      
      // Calcular totais por forma de pagamento a partir do JSON
      sales.forEach((sale) => {
        const total = parseFloat(sale.total_amount);
        salesTotal += total;
        
        // Se tiver o campo payments (JSON), usar ele
        if (sale.payments && Array.isArray(sale.payments)) {
          sale.payments.forEach((payment) => {
            const amount = parseFloat(payment.amount);
            const change = parseFloat(payment.change || 0);
            
            // Valor líquido = valor recebido - troco
            const netAmount = amount - change;
            
            if (salesByPayment[payment.type] !== undefined) {
              salesByPayment[payment.type] += netAmount;
            }
          });
        } else {
          // Fallback para o campo payment_method antigo (string)
          // Tenta identificar a forma pelo texto
          const method = sale.payment_method.toLowerCase();
          if (method.includes('dinheiro') || method.includes('cash')) {
            salesByPayment.cash += total;
          } else if (method.includes('débito') || method.includes('debit')) {
            salesByPayment.debit += total;
          } else if (method.includes('crédito') || method.includes('credit')) {
            salesByPayment.credit += total;
          } else if (method.includes('pix')) {
            salesByPayment.pix += total;
          } else {
            // Se não conseguir identificar, assume dinheiro
            salesByPayment.cash += total;
          }
        }
      });
      
      // Buscar transações (sangrias/adições)
      const transactionsResult = await sql`
        SELECT * FROM cash_transactions
        WHERE cash_register_id = ${currentRegister.id}
        ORDER BY created_at DESC
      `;
      
      currentRegister = {
        ...currentRegister,
        salesTotal,
        salesByPayment,
        transactions: transactionsResult,
      };
    }
    
    // Buscar histórico dos últimos 10 fechamentos
    const history = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;
    
    return {
      current: currentRegister,
      history
    };
  } catch (error) {
    console.error('Error fetching cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching cash register',
    });
  }
});
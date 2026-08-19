import { sql } from '../../utils/db';

async function getRegisterDetails(register: any) {
  // Buscar vendas e pagamentos para este caixa
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
  
    // Agregar por venda: total, cash pago e pagamentos não-cash por tipo
    const saleAggregates = new Map<string, {
      total: number;
      cash: number;
      paymentsByType: Record<string, number>;
    }>();
  
    salesAndPayments.forEach(row => {
      const total = parseFloat(row.total_amount);
      if (!saleAggregates.has(row.id)) {
        saleAggregates.set(row.id, {
          total,
          cash: 0,
          paymentsByType: { cash: 0, debit: 0, credit: 0, pix: 0 },
        });
      }
  
      const agg = saleAggregates.get(row.id)!;
      if (row.payment_type && row.amount) {
        const type = row.payment_type.toLowerCase();
        const amount = parseFloat(row.amount);
        if (type === 'cash') {
          agg.cash += amount;
          agg.paymentsByType.cash += amount;
        } else if (agg.paymentsByType[type] !== undefined) {
          agg.paymentsByType[type] += amount;
        }
      }
    });
  
    // Calcular totais e vendas líquidas por forma de pagamento
    saleAggregates.forEach(agg => {
      salesTotal += agg.total;
  
      // Venda líquida em dinheiro: mínimo do cash recebido ou (total - pagamentos não-cash)
      // Isso garante que apenas o valor do produto seja contado, não o troco
      const nonCashTotal = Object.values(agg.paymentsByType)
        .filter((_type: string, i: number) => i > 0) // exclui 'cash' (índice 0)
        .reduce((sum: number, amount: number) => sum + amount, 0);
  
      const netCash = Math.min(agg.cash, Math.max(agg.total - nonCashTotal, 0));
      salesByPayment.cash += netCash;
  
      // Outras formas de pagamento: somar o valor total (não envolvem troco)
      salesByPayment.debit += agg.paymentsByType.debit || 0;
      salesByPayment.credit += agg.paymentsByType.credit || 0;
      salesByPayment.pix += agg.paymentsByType.pix || 0;
    });

  // Buscar transações para este caixa
  const transactionsResult = await sql`
    SELECT * FROM cash_transactions
    WHERE cash_register_id = ${register.id}
    ORDER BY created_at DESC
  `;

  return {
    ...register,
    salesTotal,
    salesByPayment,
    transactions: transactionsResult,
  };
}

export default defineEventHandler(async () => {
  try {
    const openRegisterResult = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;

    if (openRegisterResult.length === 0) {
      const historyRaw = await sql`
        SELECT * FROM cash_registers
        WHERE status = 'closed'
        ORDER BY closed_at DESC
        LIMIT 10
      `;
      
      // Buscar detalhes para cada registro histórico
      const history = await Promise.all(
        historyRaw.map(register => getRegisterDetails(register))
      );
      
      return { current: null, history };
    }

    const currentRegister = openRegisterResult[0];

    const currentDetails = await getRegisterDetails(currentRegister);

    const historyRaw = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;
    
    // Buscar detalhes para cada registro histórico
    const history = await Promise.all(
      historyRaw.map(register => getRegisterDetails(register))
    );

    return {
      current: currentDetails,
      history
    };

  } catch (error: any) {
    console.error('Error fetching cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error fetching cash register',
    });
  }
});
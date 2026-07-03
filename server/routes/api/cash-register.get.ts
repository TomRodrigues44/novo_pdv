export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    
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
      
      // Calcular total de vendas por forma de pagamento
      const salesResult = await sql`
        SELECT 
          payment_method,
          COALESCE(SUM(total_amount), 0) as total
        FROM sales
        WHERE created_at >= ${currentRegister.opened_at}
        GROUP BY payment_method
      `;
      
      salesResult.forEach((sale: any) => {
        const total = parseFloat(sale.total);
        salesTotal += total;
        
        if (salesByPayment[sale.payment_method as keyof typeof salesByPayment] !== undefined) {
          salesByPayment[sale.payment_method as keyof typeof salesByPayment] = total;
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
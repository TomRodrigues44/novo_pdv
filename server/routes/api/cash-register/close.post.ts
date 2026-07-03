export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
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
        statusMessage: 'Nenhum caixa aberto encontrado',
      });
    }
    
    const register = openRegister[0];
    
    // Calcular total de vendas por forma de pagamento
    const salesResult = await sql`
      SELECT 
        payment_method,
        COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE created_at >= ${register.opened_at}
      GROUP BY payment_method
    `;
    
    let salesTotal = 0;
    let cashSales = 0;
    
    salesResult.forEach((sale: any) => {
      const total = parseFloat(sale.total);
      salesTotal += total;
      
      if (sale.payment_method === 'cash') {
        cashSales += total;
      }
    });
    
    // Calcular transações (sangrias/adições)
    const transactionsResult = await sql`
      SELECT type, COALESCE(SUM(amount), 0) as total
      FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      GROUP BY type
    `;
    
    let withdrawals = 0; // Sangrias
    let additions = 0; // Adições
    
    transactionsResult.forEach((trans: any) => {
      const total = parseFloat(trans.total);
      if (trans.type === 'withdrawal') {
        withdrawals += total;
      } else if (trans.type === 'addition') {
        additions += total;
      }
    });
    
    // Calcular valores
    const openingAmount = parseFloat(register.opening_amount);
    
    // Valor esperado em dinheiro = Abertura + Vendas em Dinheiro + Adições - Sangrias
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals;
    
    // Valor esperado total = Abertura + Todas as Vendas + Adições - Sangrias
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals;
    
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
    
    return { 
      success: true, 
      salesTotal,
      cashSales,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      difference
    };
  } catch (error) {
    console.error('Error closing cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error closing cash register',
    });
  }
});
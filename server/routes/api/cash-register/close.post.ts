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
    
    // Calcular total de vendas
    const salesResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE created_at >= ${register.opened_at}
    `;
    const salesTotal = parseFloat(salesResult[0].total);
    
    // Calcular valores
    const openingAmount = parseFloat(register.opening_amount);
    const expectedAmount = openingAmount + salesTotal;
    const difference = closingAmount - expectedAmount;
    
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
    
    return { 
      success: true, 
      salesTotal,
      expectedAmount,
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
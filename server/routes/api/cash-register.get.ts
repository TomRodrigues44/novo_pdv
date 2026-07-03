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
    
    if (openRegister.length > 0) {
      currentRegister = openRegister[0];
      
      // Calcular total de vendas desde a abertura
      const salesResult = await sql`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM sales
        WHERE created_at >= ${currentRegister.opened_at}
      `;
      salesTotal = parseFloat(salesResult[0].total);
    }
    
    // Buscar histórico dos últimos 10 fechamentos
    const history = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;
    
    return {
      current: currentRegister ? { ...currentRegister, salesTotal } : null,
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
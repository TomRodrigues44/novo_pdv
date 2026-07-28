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
    
    if (openRegister.length === 0) {
      return { transactions: [] };
    }
    
    const cashRegisterId = openRegister[0].id;
    
    // Buscar transações
    const transactions = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${cashRegisterId}
      ORDER BY created_at DESC
    `;
    
    return { transactions };
  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching cash transactions',
    });
  }
});
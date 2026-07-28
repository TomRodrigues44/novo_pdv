export default defineEventHandler(async () => {
  console.log('=== /api/cash-transactions.get.ts START ===');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    console.log('Importing @neondatabase/serverless...');
    const { neon } = await import('@neondatabase/serverless');
    console.log('Import successful');
    
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('DATABASE_URL is not set');
      throw new Error('DATABASE_URL is not set');
    }
    
    console.log('Creating sql client...');
    const sql = neon(dbUrl);
    console.log('sql client created');
    
    // Buscar caixa aberto
    console.log('Fetching open register...');
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    console.log('Open register found:', openRegister.length > 0);
    
    if (openRegister.length === 0) {
      console.log('No open register, returning empty transactions');
      return { transactions: [] };
    }
    
    const cashRegisterId = openRegister[0].id;
    console.log('Cash register ID:', cashRegisterId);
    
    // Buscar transações
    console.log('Fetching transactions...');
    const transactions = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${cashRegisterId}
      ORDER BY created_at DESC
    `;
    console.log('Transactions fetched:', transactions.length);
    
    console.log('=== /api/cash-transactions.get.ts END ===');
    
    return { transactions };
  } catch (error) {
    console.error('Error in /api/cash-transactions.get.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching cash transactions',
    });
  }
});
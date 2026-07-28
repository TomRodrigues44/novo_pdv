export default defineEventHandler(async (event) => {
  console.log('=== /api/cash-transactions.post.ts START ===');
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
    
    const { type, amount, description } = await readBody(event);
    console.log('Transaction type:', type, 'amount:', amount);
    
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
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum caixa aberto encontrado',
      });
    }
    
    const cashRegisterId = openRegister[0].id;
    const id = `trans-${Date.now()}`;
    console.log('Creating transaction with ID:', id);
    
    await sql`
      INSERT INTO cash_transactions (id, cash_register_id, type, amount, description)
      VALUES (${id}, ${cashRegisterId}, ${type}, ${amount}, ${description || null})
    `;
    console.log('Transaction created successfully');
    
    console.log('=== /api/cash-transactions.post.ts END ===');
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in /api/cash-transactions.post.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating cash transaction',
    });
  }
});
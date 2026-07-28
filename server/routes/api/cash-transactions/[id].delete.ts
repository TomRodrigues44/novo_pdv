export default defineEventHandler(async (event) => {
  console.log('=== /api/cash-transactions/[id].delete.ts START ===');
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
    
    const id = getRouterParam(event, 'id');
    console.log('Deleting transaction with ID:', id);
    
    const result = await sql`
      DELETE FROM cash_transactions
      WHERE id = ${id}
      RETURNING *
    `;
    console.log('Delete result:', result.length);
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    console.log('=== /api/cash-transactions/[id].delete.ts END ===');
    
    return { success: true };
  } catch (error) {
    console.error('Error in /api/cash-transactions/[id].delete.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting transaction',
    });
  }
});
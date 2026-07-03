export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const id = getRouterParam(event, 'id');
    
    // Remover referência nas vendas
    await sql`UPDATE sales SET customer_id = NULL WHERE customer_id = ${id}`;
    
    // Deletar cliente
    const result = await sql`
      DELETE FROM customers
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting customer',
    });
  }
});
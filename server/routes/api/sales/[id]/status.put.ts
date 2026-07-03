export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const id = getRouterParam(event, 'id');
    const { status } = await readBody(event);
    
    // Validar status
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status',
      });
    }
    
    // Verificar se a coluna status existe, se não, criar
    try {
      await sql`
        ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
      `;
    } catch (e) {
      // Ignorar erro se a coluna já existe
    }
    
    // Atualizar status
    const result = await sql`
      UPDATE sales
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sale not found',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating sale status:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating sale status',
    });
  }
});
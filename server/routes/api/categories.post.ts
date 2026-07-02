export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const category = await readBody(event);
    
    const result = await sql`
      INSERT INTO categories (id, name, icon, active)
      VALUES (${category.id}, ${category.name}, ${category.icon}, ${category.active ?? true})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating category:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating category',
    });
  }
});
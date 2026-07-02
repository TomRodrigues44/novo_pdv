import { defineHandler } from 'nitro';

export default defineHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const products = await sql`
      SELECT * FROM products
      ORDER BY name ASC
    `;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching products',
    });
  }
});
export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const products = await sql`
      SELECT * FROM products
      ORDER BY 
        CASE category
          WHEN 'salgados' THEN 1
          WHEN 'bolos' THEN 2
          WHEN 'brigadeiros' THEN 3
          WHEN 'bebidas' THEN 4
          WHEN 'combos' THEN 5
          WHEN 'diversos' THEN 6
          ELSE 7
        END ASC,
        name ASC
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
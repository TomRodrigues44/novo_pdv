export default defineEventHandler(async () => {
  console.log('=== /api/categories.get.ts START ===');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 20));
  
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
    
    console.log('Executing query...');
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY 
        CASE id
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
    console.log('Query successful, returned', categories.length, 'categories');
    
    return categories;
  } catch (error) {
    console.error('Error in /api/categories.get.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching categories',
    });
  }
});
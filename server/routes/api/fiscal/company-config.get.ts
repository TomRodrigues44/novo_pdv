export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const configs = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    return configs[0] || null;
  } catch (error) {
    console.error('Error fetching company config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching company config',
    });
  }
});
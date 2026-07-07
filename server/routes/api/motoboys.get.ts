export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const motoboys = await sql`
      SELECT * FROM motoboys
      ORDER BY name ASC
    `;
    return motoboys;
  } catch (error) {
    console.error('Error fetching motoboys:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching motoboys',
    });
  }
});
export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const motoboy = await readBody(event);
    
    const result = await sql`
      INSERT INTO motoboys (id, name, phone)
      VALUES (${motoboy.id}, ${motoboy.name}, ${motoboy.phone || null})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating motoboy:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating motoboy',
    });
  }
});
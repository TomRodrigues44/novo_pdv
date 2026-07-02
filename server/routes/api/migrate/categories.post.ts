export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const categories = await readBody(event);
    
    if (!Array.isArray(categories)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid data format',
      });
    }

    let migrated = 0;
    for (const cat of categories) {
      await sql`
        INSERT INTO categories (id, name, icon, active)
        VALUES (${cat.id}, ${cat.name}, ${cat.icon}, ${cat.active ?? true})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          active = EXCLUDED.active
      `;
      migrated++;
    }

    return { success: true, count: migrated };
  } catch (error) {
    console.error('Error migrating categories:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error migrating categories',
    });
  }
});
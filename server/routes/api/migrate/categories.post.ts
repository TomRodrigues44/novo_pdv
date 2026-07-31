import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const categories = await readBody(event);
    
    if (!Array.isArray(categories)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid data format',
      });
    }

    let migrated = 0;
    for (const cat of categories) {
      await sql()`
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
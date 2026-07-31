import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
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
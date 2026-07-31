import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const category = await readBody(event);
    
    const result = await sql`
          UPDATE categories
          SET
            name = ${category.name},
            icon = ${category.icon},
            active = ${category.active ?? true}
          WHERE id = ${id}
          RETURNING *
        `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating category:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating category',
    });
  }
});
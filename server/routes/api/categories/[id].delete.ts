import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    // Deletar produtos dessa categoria primeiro
        await sql`DELETE FROM products WHERE category = ${id}`;
    
    // Deletar a categoria
        const result = await sql`
          DELETE FROM categories
          WHERE id = ${id}
          RETURNING *
        `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting category',
    });
  }
});
import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    const result = await sql`
      DELETE FROM contingency_notes
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nota em contingência não encontrada'
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting contingency note:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting contingency note',
    });
  }
});
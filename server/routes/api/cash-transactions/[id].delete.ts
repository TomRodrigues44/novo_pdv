import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    const result = await sql()`
      DELETE FROM cash_transactions
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting transaction',
    });
  }
});
import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const motoboy = await readBody(event);
    
    const result = await sql`
          UPDATE motoboys
          SET
            name = ${motoboy.name},
            phone = ${motoboy.phone || null}
          WHERE id = ${id}
          RETURNING *
        `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motoboy not found',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating motoboy:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating motoboy',
    });
  }
});
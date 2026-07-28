import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const motoboy = await readBody(event);
    
    const result = await sql()`
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
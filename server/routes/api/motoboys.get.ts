import { sql } from '../../../lib/db';

export default defineEventHandler(async () => {
  try {const motoboys = await sql`
      SELECT * FROM motoboys
      ORDER BY name ASC
    `;
    return motoboys;
  } catch (error) {
    console.error('Error fetching motoboys:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching motoboys',
    });
  }
});
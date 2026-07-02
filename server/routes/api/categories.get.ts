import { defineHandler } from 'nitro';
import { sql } from '../lib/db';

export default defineHandler(async () => {
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching categories',
    });
  }
});
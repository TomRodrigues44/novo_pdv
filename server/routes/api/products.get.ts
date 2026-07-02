import { defineHandler } from 'nitro';
import { sql } from '../lib/db';

export default defineHandler(async () => {
  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY name ASC
    `;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching products',
    });
  }
});
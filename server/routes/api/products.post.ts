import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const product = await readBody(event);
    
    const result = await sql`
          INSERT INTO products (
            id, name, description, price, category, category_name,
            image, available, stock, fiscal
          )
          VALUES (
            ${product.id},
            ${product.name},
            ${product.description || null},
            ${product.price},
            ${product.category},
            ${null},
            ${product.image},
            ${product.available ?? true},
            ${product.stock ?? 0},
            ${product.fiscal ? JSON.stringify(product.fiscal) : null}::jsonb
          )
          RETURNING *
        `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating product:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating product',
    });
  }
});
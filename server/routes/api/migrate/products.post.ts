import { defineHandler } from 'nitro';
import { sql } from '../../lib/db';

export default defineHandler(async (event) => {
  try {
    const products = await readBody(event);
    
    if (!Array.isArray(products)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid data format',
      });
    }

    let migrated = 0;
    for (const prod of products) {
      await sql`
        INSERT INTO products (
          id, name, description, price, category, category_name,
          image, available, stock, fiscal
        )
        VALUES (
          ${prod.id},
          ${prod.name},
          ${prod.description || null},
          ${prod.price},
          ${prod.category},
          ${null},
          ${prod.image},
          ${prod.available ?? true},
          ${prod.stock ?? 0},
          ${prod.fiscal ? JSON.stringify(prod.fiscal) : null}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          available = EXCLUDED.available,
          stock = EXCLUDED.stock,
          fiscal = EXCLUDED.fiscal,
          updated_at = CURRENT_TIMESTAMP
      `;
      migrated++;
    }

    return { success: true, count: migrated };
  } catch (error) {
    console.error('Error migrating products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error migrating products',
    });
  }
});
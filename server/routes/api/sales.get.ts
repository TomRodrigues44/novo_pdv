import { defineHandler } from 'nitro';
import { sql } from '../../lib/db';

export default defineHandler(async () => {
  try {
    const sales = await sql`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'product_name', si.product_name,
            'quantity', si.quantity,
            'price', si.price,
            'flavors', si.flavors
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    return sales;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching sales',
    });
  }
});
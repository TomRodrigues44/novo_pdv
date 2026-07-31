import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {const sales = await sql`
        SELECT
          s.*,
          c.name as customer_name,
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
        LEFT JOIN customers c ON s.customer_id = c.id
        GROUP BY s.id, c.name
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
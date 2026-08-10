import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {const customers = await sql`
        SELECT
          c.*,
          COALESCE(SUM(CASE WHEN s.status != 'cancelled' AND s.xml_status != 'cancelled' THEN s.total_amount ELSE 0 END), 0) as total_spent,
          COUNT(CASE WHEN s.status != 'cancelled' AND s.xml_status != 'cancelled' THEN s.id ELSE NULL END) as total_orders
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching customers',
    });
  }
});
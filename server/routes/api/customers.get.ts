import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {const customers = await sql`
        SELECT
          c.*,
          COUNT(s.id) as total_orders
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
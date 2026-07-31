import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const customer = await readBody(event);
    
    const result = await sql`
          UPDATE customers
          SET
            name = ${customer.name},
            phone = ${customer.phone || null},
            address = ${customer.address || null},
            email = ${customer.email || null},
            points = ${customer.points || 0},
            total_spent = ${customer.total_spent || 0},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating customer:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating customer',
    });
  }
});
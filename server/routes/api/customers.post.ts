import { sql } from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const customer = await readBody(event);
    
    const result = await sql`
          INSERT INTO customers (id, name, phone, address, email, points, total_spent)
          VALUES (
            ${customer.id},
            ${customer.name},
            ${customer.phone || null},
            ${customer.address || null},
            ${customer.email || null},
            ${customer.points || 0},
            ${customer.total_spent || 0}
          )
          RETURNING *
        `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating customer:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating customer',
    });
  }
});
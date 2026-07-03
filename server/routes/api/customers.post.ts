export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
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
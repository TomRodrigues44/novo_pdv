export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const customers = await sql`
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
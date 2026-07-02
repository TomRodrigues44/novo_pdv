export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const id = getRouterParam(event, 'id');
    const product = await readBody(event);
    
    const result = await sql`
      UPDATE products
      SET 
        name = ${product.name},
        description = ${product.description || null},
        price = ${product.price},
        category = ${product.category},
        image = ${product.image},
        available = ${product.available ?? true},
        stock = ${product.stock ?? 0},
        fiscal = ${product.fiscal ? JSON.stringify(product.fiscal) : null}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error updating product:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating product',
    });
  }
});
export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const id = getRouterParam(event, 'id');
    const updates = await readBody(event);
    
    // Construir a query dinamicamente com apenas os campos fornecidos
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push('name = $1');
      updateValues.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1));
      updateValues.push(updates.description);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = $' + (updateValues.length + 1));
      updateValues.push(updates.price);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = $' + (updateValues.length + 1));
      updateValues.push(updates.category);
    }
    if (updates.image !== undefined) {
      updateFields.push('image = $' + (updateValues.length + 1));
      updateValues.push(updates.image);
    }
    if (updates.available !== undefined) {
      updateFields.push('available = $' + (updateValues.length + 1));
      updateValues.push(updates.available);
    }
    if (updates.stock !== undefined) {
      updateFields.push('stock = $' + (updateValues.length + 1));
      updateValues.push(updates.stock);
    }
    if (updates.fiscal !== undefined) {
      updateFields.push('fiscal = $' + (updateValues.length + 1));
      updateValues.push(JSON.stringify(updates.fiscal));
    }
    
    // Adicionar updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Adicionar o ID ao final dos valores
    updateValues.push(id);
    
    // Construir a query SQL
    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING *
    `;
    
    const result = await sql(query, ...updateValues);
    
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
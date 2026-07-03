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
    let paramIndex = 1;
    
    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(updates.name);
      paramIndex++;
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(updates.description);
      paramIndex++;
    }
    if (updates.price !== undefined) {
      updateFields.push(`price = $${paramIndex}`);
      updateValues.push(updates.price);
      paramIndex++;
    }
    if (updates.category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      updateValues.push(updates.category);
      paramIndex++;
    }
    if (updates.image !== undefined) {
      updateFields.push(`image = $${paramIndex}`);
      updateValues.push(updates.image);
      paramIndex++;
    }
    if (updates.available !== undefined) {
      updateFields.push(`available = $${paramIndex}`);
      updateValues.push(updates.available);
      paramIndex++;
    }
    if (updates.stock !== undefined) {
      updateFields.push(`stock = $${paramIndex}`);
      updateValues.push(updates.stock);
      paramIndex++;
    }
    if (updates.fiscal !== undefined) {
      updateFields.push(`fiscal = $${paramIndex}`);
      updateValues.push(JSON.stringify(updates.fiscal));
      paramIndex++;
    }
    
    // Adicionar updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Adicionar o ID ao final dos valores
    updateValues.push(id);
    
    // Construir a query SQL
    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    console.log('Update query:', query);
    console.log('Update values:', updateValues);
    
    // Usar sql.query() passando um array de valores
    const result = await sql.query(query, updateValues);
    
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
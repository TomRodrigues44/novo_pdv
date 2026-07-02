export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const saleData = await readBody(event);
    
    // Criar a venda
    const saleResult = await sql`
      INSERT INTO sales (total_amount, payment_method, freight, created_at)
      VALUES (
        ${saleData.total}, 
        ${saleData.payments?.[0]?.type || 'cash'}, 
        ${saleData.freight || 0}, 
        ${saleData.date || new Date().toISOString()}
      )
      RETURNING id
    `;
    
    const saleId = saleResult[0].id;
    
    // Criar os itens da venda
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (
            ${saleId},
            ${item.id},
            ${item.name},
            ${item.quantity},
            ${item.price},
            ${item.flavors ? JSON.stringify(item.flavors) : null}::jsonb
          )
        `;
        
        // Atualizar estoque
        await sql`
          UPDATE products
          SET stock = stock - ${item.quantity},
              available = (stock - ${item.quantity}) > 0
          WHERE id = ${item.id}
        `;
      }
    }
    
    return { success: true, id: saleId };
  } catch (error) {
    console.error('Error creating sale:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating sale',
    });
  }
});
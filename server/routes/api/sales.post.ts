export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const saleData = await readBody(event);
    
    // Garantir que os valores sejam números
    const total = parseFloat(String(saleData.total || 0));
    const freight = parseFloat(String(saleData.freight || 0));
    const paymentMethod = saleData.payments?.[0]?.type || 'cash';
    const createdAt = saleData.date || new Date().toISOString();
    
    console.log('Creating sale:', { total, freight, paymentMethod, itemsCount: saleData.items?.length });
    
    // Criar a venda
    const saleResult = await sql`
      INSERT INTO sales (total_amount, payment_method, freight, created_at)
      VALUES (
        ${total}, 
        ${paymentMethod}, 
        ${freight}, 
        ${createdAt}
      )
      RETURNING id
    `;
    
    const saleId = saleResult[0].id;
    console.log('Sale created with ID:', saleId);
    
    // Criar os itens da venda
    if (saleData.items && Array.isArray(saleData.items)) {
      for (const item of saleData.items) {
        const itemPrice = parseFloat(String(item.price || 0));
        const itemQuantity = parseInt(String(item.quantity || 0));
        
        console.log('Adding sale item:', {
          saleId,
          productId: item.id,
          productName: item.name,
          quantity: itemQuantity,
          price: itemPrice,
          flavors: item.flavors
        });
        
        // Converter flavors para array de texto se existir
        const flavorsArray = item.flavors && Array.isArray(item.flavors) ? item.flavors : null;
        
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (
            ${saleId},
            ${item.id},
            ${item.name},
            ${itemQuantity},
            ${itemPrice},
            ${flavorsArray}::text[]
          )
        `;
        
        // Atualizar estoque
        await sql`
          UPDATE products
          SET stock = stock - ${itemQuantity},
              available = (stock - ${itemQuantity}) > 0
          WHERE id = ${item.id}
        `;
      }
    }
    
    console.log('Sale completed successfully');
    return { success: true, id: saleId };
  } catch (error) {
    console.error('Error creating sale:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating sale',
    });
  }
});
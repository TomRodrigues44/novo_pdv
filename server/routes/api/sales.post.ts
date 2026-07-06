export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const saleData = await readBody(event);
    
    const total = parseFloat(String(saleData.total || 0));
    const freight = parseFloat(String(saleData.freight || 0));
    const payments = saleData.payments || [];
    const createdAt = saleData.date || new Date().toISOString();
    const customerId = saleData.customerId || null;
    
    // Criar resumo das formas de pagamento para o campo payment_method
    const paymentMethodSummary = payments
      .map((p: any) => {
        switch (p.type) {
          case 'debit': return 'Débito';
          case 'credit': return 'Crédito';
          case 'pix': return 'Pix';
          case 'cash': return 'Dinheiro';
          default: return p.type;
        }
      })
      .join(', ') || 'Dinheiro';
    
    console.log('Creating sale:', { total, freight, paymentMethodSummary, customerId, itemsCount: saleData.items?.length });
    
    // Criar a venda
    const saleResult = await sql`
      INSERT INTO sales (total_amount, payment_method, freight, created_at, customer_id, payments)
      VALUES (
        ${total}, 
        ${paymentMethodSummary}, 
        ${freight}, 
        ${createdAt},
        ${customerId},
        ${JSON.stringify(payments)}::jsonb
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
    
    // Atualizar pontos e total gasto do cliente
    if (customerId) {
      const pointsEarned = Math.floor(total);
      await sql`
        UPDATE customers
        SET 
          points = points + ${pointsEarned},
          total_spent = total_spent + ${total},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${customerId}
      `;
      console.log(`Updated customer ${customerId}: +${pointsEarned} points, +${total} total spent`);
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
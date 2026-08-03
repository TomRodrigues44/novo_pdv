import { sql } from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { items, total, payments, customerId, freight, type } = body;

    if (!items || !total) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Itens e total são obrigatórios',
      });
    }

    // 1. Create the sale and get the ID
    const saleResult = await sql`
      INSERT INTO sales (total_amount, customer_id, freight, status)
      VALUES (${total}, ${customerId}, ${freight}, ${type})
      RETURNING id;
    `;
    const saleId = saleResult[0].id;

    // 2. Store sale items
    if (items.length > 0) {
      const saleItems = items.map((item: any) => ({
        sale_id: saleId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        flavors: item.flavors ? JSON.stringify(item.flavors) : null,
      }));
      await sql`INSERT INTO sale_items ${sql(saleItems, 'sale_id', 'product_id', 'product_name', 'quantity', 'price', 'flavors')}`;
    }

    // 3. Store payment methods
    if (payments && payments.length > 0) {
      const salePayments = payments.map((p: any) => ({
        sale_id: saleId,
        payment_type: p.type,
        amount: p.amount,
      }));
      await sql`INSERT INTO sale_payments ${sql(salePayments, 'sale_id', 'payment_type', 'amount')}`;
    }

    // 4. Update stock
    for (const item of items) {
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.id};
      `;
    }

    return { id: saleId, message: 'Venda registrada com sucesso' };

  } catch (error: any) {
    console.error('Error creating sale:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error creating sale',
    });
  }
});
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

    // 2. Store sale items one by one
    if (items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
          VALUES (
            ${saleId},
            ${item.id},
            ${item.name},
            ${item.quantity},
            ${item.price},
            ${item.flavors ? JSON.stringify(item.flavors) : null}
          );
        `;
      }
    }

    // 3. Store payment methods one by one
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await sql`
          INSERT INTO sale_payments (sale_id, payment_type, amount)
          VALUES (${saleId}, ${p.type}, ${p.amount});
        `;
      }
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
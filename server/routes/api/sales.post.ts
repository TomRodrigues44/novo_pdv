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

    // 1. Calculate the next daily sale number
    const lastSaleNumberResult = await sql`
      SELECT MAX(daily_sale_number) as last_number
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE;
    `;
    
    const lastNumber = lastSaleNumberResult[0]?.last_number;
    const nextDailyNumber = lastNumber ? lastNumber + 1 : 100;

    // 2. Create the sale and get the ID
    const saleResult = await sql`
      INSERT INTO sales (total_amount, customer_id, freight, status, daily_sale_number)
      VALUES (${total}, ${customerId}, ${freight}, ${type}, ${nextDailyNumber})
      RETURNING id, daily_sale_number;
    `;
    const saleId = saleResult[0].id;
    const dailySaleNumber = saleResult[0].daily_sale_number;

    // 3. Store sale items
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
            ${Array.isArray(item.flavors) ? item.flavors : null}
          );
        `;
      }
    }

    // 4. Store payment methods
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await sql`
          INSERT INTO sale_payments (sale_id, payment_type, amount)
          VALUES (${saleId}, ${p.type}, ${p.amount});
        `;
      }
    }

    // 5. Update stock
    for (const item of items) {
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.id};
      `;
    }

    // 6. Atribuir pontos ao cliente (1 real = 1 ponto)
    if (customerId) {
      const pointsToAdd = Math.floor(parseFloat(String(total)) || 0);
      if (pointsToAdd > 0) {
        await sql`
          UPDATE customers
          SET points = COALESCE(points, 0) + ${pointsToAdd},
              total_spent = COALESCE(total_spent, 0) + ${parseFloat(String(total)) || 0}
          WHERE id = ${customerId};
        `;
      }
    }

    return { id: saleId, daily_sale_number: dailySaleNumber, message: 'Venda registrada com sucesso' };

  } catch (error: any) {
    console.error('Error creating sale:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error creating sale',
    });
  }
});
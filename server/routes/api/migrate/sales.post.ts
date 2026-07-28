import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const sales = await readBody(event);
    
    if (!Array.isArray(sales)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid data format',
      });
    }

    let migrated = 0;
    for (const sale of sales) {
      const saleResult = await sql()`
        INSERT INTO sales (total_amount, payment_method, freight, created_at)
        VALUES (
          ${sale.total}, 
          ${sale.payments?.[0]?.type || 'cash'}, 
          ${sale.freight || 0}, 
          ${sale.date}
        )
        RETURNING id
      `;

      const saleId = saleResult[0].id;

      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          await sql()`
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
        }
      }

      migrated++;
    }

    return { success: true, count: migrated };
  } catch (error) {
    console.error('Error migrating sales:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error migrating sales',
    });
  }
});
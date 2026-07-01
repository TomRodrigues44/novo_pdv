import { defineHandler } from 'nitro';
import { readBody } from 'nitro/h3';
import { sql } from '../../utils/db';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { items, paymentMethod } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Items are required');
  }

  if (!paymentMethod) {
    throw new Error('Payment method is required');
  }

  // Calculate total
  const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  // Create sale
  const [sale] = await sql`
    INSERT INTO sales (total_amount, payment_method)
    VALUES (${total}, ${paymentMethod})
    RETURNING id
  `;

  // Create sale items
  for (const item of items) {
    const subtotal = item.price * item.quantity;
    await sql`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
      VALUES (${sale.id}, ${item.id}, ${item.quantity}, ${item.price}, ${subtotal})
    `;
  }

  return { success: true, saleId: sale.id, total };
});
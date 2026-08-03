import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const sales = await sql`
      SELECT 
        s.id, 
        s.total_amount, 
        s.created_at, 
        s.customer_id,
        s.freight,
        s.status,
        s.xml_chave,
        s.xml_numero,
        s.xml_status,
        COALESCE(
          (SELECT json_agg(json_build_object('id', si.product_id, 'name', si.product_name, 'price', si.price, 'quantity', si.quantity))
           FROM sale_items si WHERE si.sale_id = s.id),
          '[]'::json
        ) as items,
        COALESCE(
          (SELECT json_agg(json_build_object('type', sp.payment_type, 'amount', sp.amount))
           FROM sale_payments sp WHERE sp.sale_id = s.id),
          '[]'::json
        ) as payments
      FROM sales s
      ORDER BY s.created_at DESC
      LIMIT 200;
    `;
    
    return sales;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching sales',
    });
  }
});
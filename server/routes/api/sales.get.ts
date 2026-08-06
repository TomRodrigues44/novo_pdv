import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const sales = await sql`
      SELECT 
        s.id, 
        s.total_amount, 
        s.created_at,
        s.customer_id,
        c.name AS customer_name,
        s.freight,
        s.status,
        s.daily_sale_number,
        s.xml_chave,
        s.xml_numero,
        s.xml_status,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM nfe n
            WHERE n.sale_id::text = s.id::text AND n.status = 'autorizada'
          ) THEN 'NFe'
          WHEN EXISTS (
            SELECT 1 FROM nfce n
            WHERE n.sale_id::text = s.id::text AND n.status = 'autorizada'
          ) THEN 'NFCe'
          ELSE NULL
        END AS fiscal_model,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'name', si.product_name,
            'product_name', si.product_name,
            'price', si.price,
            'quantity', si.quantity,
            'flavors', si.flavors
          ))
           FROM sale_items si WHERE si.sale_id = s.id),
          '[]'::json
        ) as items,
        COALESCE(
          (SELECT json_agg(json_build_object('type', sp.payment_type, 'amount', sp.amount))
           FROM sale_payments sp WHERE sp.sale_id = s.id),
          '[]'::json
        ) as payments
      FROM sales s
      LEFT JOIN customers c ON c.id = s.customer_id
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
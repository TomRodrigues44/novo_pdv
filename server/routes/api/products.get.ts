import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';

export default defineHandler(async () => {
  const products = await sql`
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.category_id,
      c.name as category_name,
      p.image_url,
      p.available,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY c.name, p.name
  `;
  return products;
});
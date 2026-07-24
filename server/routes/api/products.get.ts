import { defineEventHandler } from 'nitro';
import { sql } from '../../lib/db';

export default defineEventHandler(async () => {
  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY 
        CASE category
          WHEN 'salgados' THEN 1
          WHEN 'bolos' THEN 2
          WHEN 'brigadeiros' THEN 3
          WHEN 'bebidas' THEN 4
          WHEN 'combos' THEN 5
          WHEN 'diversos' THEN 6
          ELSE 7
        END ASC,
        CASE 
          WHEN category = 'salgados' THEN
            CASE name
              WHEN 'Cento - 100 unidades' THEN 1
              WHEN 'Meio Cento - 50 unidades' THEN 2
              WHEN 'Copo G - 30 unidades' THEN 3
              WHEN 'Copo M - 20 unidades' THEN 4
              WHEN 'Copo P - 10 unidades' THEN 5
              ELSE 6
            END
          WHEN category = 'bolos' THEN
            CASE name
              WHEN 'Bolo de Chocolate' THEN 1
              WHEN 'Bolo de Limão' THEN 2
              WHEN 'Bolo de Milho' THEN 3
              WHEN 'Bolo Romeu & Julieta' THEN 4
              WHEN 'Bolo de Café' THEN 5
              WHEN 'Bolo Mesclado' THEN 6
              ELSE 7
            END
          ELSE 0
        END ASC,
        name ASC
    `;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching products',
    });
  }
});
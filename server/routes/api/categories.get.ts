import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';

export default defineHandler(async () => {
  const categories = await sql`
    SELECT id, name, created_at
    FROM categories
    ORDER BY name
  `;
  return categories;
});
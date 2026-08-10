import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    // Garantir que a tabela existe
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    const result = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return { configured: false };
    }
    
    return { 
      configured: true,
      password: result[0].password 
    };
  } catch (error) {
    console.error('Error fetching cancel password:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching cancel password',
    });
  }
});
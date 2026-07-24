import { sql } from '../../lib/db';

export default defineEventHandler(async () => {
  try {
    const notes = await sql`
      SELECT * FROM contingency_notes
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;
    
    return notes;
  } catch (error) {
    console.error('Error fetching contingency notes:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching contingency notes',
    });
  }
});
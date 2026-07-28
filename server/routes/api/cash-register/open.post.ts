import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const { openingAmount, notes } = await readBody(event);
    
    // Verificar se já existe caixa aberto
    const existing = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      LIMIT 1
    `;
    
    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Já existe um caixa aberto',
      });
    }
    
    const id = `cash-${Date.now()}`;
    
    await sql`
      INSERT INTO cash_registers (id, opening_amount, status, notes)
      VALUES (${id}, ${openingAmount}, 'open', ${notes || null})
    `;
    
    return { success: true, id };
  } catch (error) {
    console.error('Error opening cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error opening cash register',
    });
  }
});
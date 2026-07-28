import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const { type, amount, description } = await readBody(event);
    
    // Buscar caixa aberto
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum caixa aberto encontrado',
      });
    }
    
    const cashRegisterId = openRegister[0].id;
    const id = `trans-${Date.now()}`;
    
    await sql`
      INSERT INTO cash_transactions (id, cash_register_id, type, amount, description)
      VALUES (${id}, ${cashRegisterId}, ${type}, ${amount}, ${description || null})
    `;
    
    return { success: true, id };
  } catch (error) {
    console.error('Error creating cash transaction:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating cash transaction',
    });
  }
});
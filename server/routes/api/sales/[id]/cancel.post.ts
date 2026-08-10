import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const { password } = await readBody(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da venda é obrigatório',
      });
    }
    
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Senha de cancelamento é obrigatória',
      });
    }
    
    // Garantir que a tabela existe
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Verificar se a senha de cancelamento está configurada
    const passwordResult = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (passwordResult.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento não configurada',
      });
    }
    
    // Validar a senha de cancelamento
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento inválida',
      });
    }
    
    // Verificar se a venda existe e buscar dados (incluindo customer_id e total_amount)
    const saleResult = await sql`
      SELECT id, total_amount, customer_id
      FROM sales
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (!saleResult.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Venda não encontrada'
      };
    }
    
    const amount = parseFloat(saleResult[0].total_amount) || 0;
    const customerId = saleResult[0].customer_id;
    
    // Cancelar a venda
    await sql`
      UPDATE sales
      SET status = 'cancelled',
          xml_status = 'cancelled'
      WHERE id = ${id}
    `;
    
    // Estornar pontos e total_spent do cliente
    if (customerId) {
      await sql`
        UPDATE customers
        SET points = COALESCE(points, 0) - ${amount},
            total_spent = COALESCE(total_spent, 0) - ${amount}
        WHERE id = ${customerId}
      `;
    }
    
    return { 
      success: true, 
      message: 'Venda cancelada com sucesso' 
    };
  } catch (error: any) {
    console.error('Error cancelling sale:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error cancelling sale'
    };
  }
});
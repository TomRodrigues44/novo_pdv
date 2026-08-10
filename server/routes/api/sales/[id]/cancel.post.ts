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
    
    // Verificar se a senha de cancelamento está configurada
    const passwordResult = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (passwordResult.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento não configurada. Configure uma senha de cancelamento primeiro.',
      });
    }
    
    // Validar a senha de cancelamento
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento inválida',
      });
    }
    
    // Verificar se a venda existe
    const saleResult = await sql`
      SELECT id, status, xml_status FROM sales
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (saleResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Venda não encontrada',
      });
    }
    
    // Cancelar a venda
    await sql`
      UPDATE sales
      SET status = 'cancelled',
          xml_status = 'cancelled'
      WHERE id = ${id}
    `;
    
    return { 
      success: true, 
      message: 'Venda cancelada com sucesso' 
    };
  } catch (error: any) {
    console.error('Error cancelling sale:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error cancelling sale',
    });
  }
});
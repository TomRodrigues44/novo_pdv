import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const { password } = await readBody(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da nota fiscal é obrigatório',
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
    
    // Verificar se a nota fiscal existe
    const nfeResult = await sql`
      SELECT id, status, sale_id FROM nfe
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const nfceResult = await sql`
      SELECT id, status, sale_id FROM nfce
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const fiscalNote = nfeResult.length > 0 ? nfeResult[0] : 
                       nfceResult.length > 0 ? nfceResult[0] : null;
    
    if (!fiscalNote) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nota fiscal não encontrada',
      });
    }
    
    // Atualizar status da nota fiscal para cancelada
    if (nfeResult.length > 0) {
      await sql`
        UPDATE nfe
        SET status = 'cancelada'
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE nfce
        SET status = 'cancelada'
        WHERE id = ${id}
      `;
    }
    
    // Atualizar status da venda associada
    if (fiscalNote.sale_id) {
      await sql`
        UPDATE sales
        SET xml_status = 'cancelled'
        WHERE id::text = ${String(fiscalNote.sale_id)}
      `;
    }
    
    return { 
      success: true, 
      message: 'Nota fiscal cancelada com sucesso' 
    };
  } catch (error: any) {
    console.error('Error cancelling fiscal note:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error cancelling fiscal note',
    });
  }
});
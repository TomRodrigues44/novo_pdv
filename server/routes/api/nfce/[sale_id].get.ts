import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const saleId = getRouterParam(event, 'sale_id');
    
    if (!saleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sale_id é obrigatório',
      });
    }
    
    const result = await sql`
          SELECT * FROM nfce
          WHERE sale_id = ${saleId}
          ORDER BY created_at DESC
          LIMIT 1
        `;
    
    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NFC-e não encontrada para esta venda',
      });
    }
    
    return result[0];
  } catch (error) {
    console.error('Error fetching NFC-e:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar NFC-e',
    });
  }
});
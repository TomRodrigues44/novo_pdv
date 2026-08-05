import { sql } from '../../../../utils/db';
import { createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID do certificado não fornecido',
    });
  }

  try {
    const result = await sql`
      UPDATE digital_certificates
      SET ativo = true
      WHERE id = ${id}
    `;

    if (result.rowCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Certificado não encontrado',
      });
    }

    return {
      message: 'Certificado ativado com sucesso',
    };
  } catch (error) {
    console.error('Error activating certificate:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao ativar certificado',
    });
  }
});
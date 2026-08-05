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
    await sql`
      UPDATE digital_certificates
      SET ativo = false
      WHERE id = ${id}
    `;

    return {
      message: 'Certificado excluído com sucesso',
    };
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao excluir certificado',
    });
  }
});
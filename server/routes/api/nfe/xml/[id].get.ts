import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da NF-e inválido',
    });
  }

  try {
    const result = await sql`
      SELECT numero, xml_envio
      FROM nfe
      WHERE id = ${id}
        AND status = 'autorizada'
      LIMIT 1
    `;

    if (result.length === 0 || !result[0].xml_envio) {
      throw createError({
        statusCode: 404,
        statusMessage: 'XML da NF-e não encontrado',
      });
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="nfe-${result[0].numero || id}.xml"`,
    });

    return result[0].xml_envio;
  } catch (error: any) {
    console.error('Error downloading NFe XML:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao baixar XML de NF-e',
    });
  }
});
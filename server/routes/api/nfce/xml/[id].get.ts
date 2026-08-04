import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da NFC-e inválido',
    });
  }

  try {
    const result = await sql`
      SELECT
        numero,
        COALESCE(NULLIF(xml_retorno, ''), xml_envio) AS xml_content
      FROM nfce
      WHERE id = ${id}
        AND status = 'autorizada'
      LIMIT 1
    `;

    if (result.length === 0 || !result[0].xml_content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'XML da NFC-e não encontrado',
      });
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="nfe-${result[0].numero || id}.xml"`,
    });

    return result[0].xml_content;
  } catch (error: any) {
    console.error('Error downloading NFC-e XML:', error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao baixar XML fiscal',
    });
  }
});

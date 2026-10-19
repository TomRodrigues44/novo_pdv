import { sql } from '../../../../utils/db';

function hasTag(xml: string, tag: string) {
  return new RegExp(`<(?:[\\w.-]+:)?${tag}\\b`, 'i').test(xml);
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da NFC-e inválido',
    });
  }

  try {
    // O relatório envia sales.id.
    // Primeiro procuramos a NFC-e vinculada à venda.
    let rows = await sql`
      SELECT
        id,
        sale_id,
        numero,
        chave_acesso,
        status,
        xml_retorno
      FROM nfce
      WHERE sale_id::text = ${String(id)}
        AND status IN ('autorizada', 'cancelada')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Compatibilidade com chamadas antigas que enviavam nfce.id.
    if (!rows?.length) {
      rows = await sql`
        SELECT
          id,
          sale_id,
          numero,
          chave_acesso,
          status,
          xml_retorno
        FROM nfce
        WHERE id::text = ${String(id)}
        LIMIT 1
      `;
    }

    if (!rows?.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NFC-e não encontrada para esta venda.',
      });
    }

    const nfce = rows[0];

    if (!['autorizada', 'cancelada'].includes(nfce.status)) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Somente NFC-e autorizada/cancelada pode ser exportada.',
      });
    }

    const xml = String(nfce.xml_retorno || '').trim();

    if (
      !xml ||
      !hasTag(xml, 'nfeProc') ||
      !hasTag(xml, 'NFe') ||
      !hasTag(xml, 'Signature') ||
      !hasTag(xml, 'protNFe')
    ) {
      throw createError({
        statusCode: 422,
        statusMessage:
          'Registro sem XML fiscal completo (nfeProc + NFe + Signature + protNFe). Nenhum XML artificial será gerado.',
      });
    }

    const chave = String(nfce.chave_acesso || '').replace(/\D/g, '');

    const filename =
      chave.length === 44
        ? `${chave}-procNFe.xml`
        : `NFCe-${nfce.numero || id}-procNFe.xml`;

    setResponseHeaders(event, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });

    return xml;
  } catch (error: any) {
    console.error('Error downloading NFCe XML:', error);

    if (error?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao baixar XML de NFC-e',
    });
  }
});
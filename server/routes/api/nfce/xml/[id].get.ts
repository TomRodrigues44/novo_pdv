import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da NFC-e não informado.' });

  const rows = await sql`
    SELECT id, numero, chave_acesso, status, xml_retorno
    FROM nfce WHERE id = ${id} LIMIT 1
  `;
  if (!rows?.length) throw createError({ statusCode: 404, statusMessage: 'NFC-e não encontrada.' });

  const nfce = rows[0];
  if (!['autorizada', 'cancelada'].includes(nfce.status)) {
    throw createError({ statusCode: 409, statusMessage: 'Somente NFC-e autorizada/cancelada pode ser exportada.' });
  }

  const xml = String(nfce.xml_retorno || '').trim();
  if (!xml.includes('<nfeProc') || !xml.includes('<Signature') || !xml.includes('<protNFe')) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Registro sem XML fiscal completo (nfeProc + Signature + protNFe). Nenhum XML artificial será gerado.',
    });
  }

  const chave = String(nfce.chave_acesso || '').replace(/\D/g, '');
  const filename = chave.length === 44 ? `${chave}-procNFe.xml` : `NFCe-${nfce.numero || id}-procNFe.xml`;
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`);
  setHeader(event, 'Cache-Control', 'no-store');
  return xml;
});

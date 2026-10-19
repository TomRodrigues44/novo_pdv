import { sql } from '../../../utils/db';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

function hasTag(xml: string, tag: string) {
  return new RegExp(`<(?:[\\w.-]+:)?${tag}\\b`, 'i').test(xml);
}

function isCompleteFiscalXml(value: unknown) {
  const xml = String(value || '').trim();
  return !!xml && hasTag(xml, 'nfeProc') && hasTag(xml, 'NFe') && hasTag(xml, 'Signature') && hasTag(xml, 'protNFe');
}

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function formatDateBR(value: unknown) {
  if (!value) return '';
  try { return new Date(String(value)).toLocaleString('pt-BR', { timeZone: 'America/Boa_Vista' }); }
  catch { return String(value); }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const inicio = String(query.inicio || '').trim();
  const fim = String(query.fim || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim)) {
    throw createError({ statusCode: 400, statusMessage: 'Informe inicio e fim no formato YYYY-MM-DD.' });
  }
  if (inicio > fim) throw createError({ statusCode: 400, statusMessage: 'A data inicial não pode ser posterior à data final.' });

  try {
    const nfceRows = await sql`
      SELECT id, sale_id, numero, serie, chave_acesso, protocolo, status, data_emissao, xml_retorno
      FROM nfce
      WHERE status IN ('autorizada', 'cancelada')
        AND data_emissao >= ${inicio}::date
        AND data_emissao < (${fim}::date + INTERVAL '1 day')
      ORDER BY data_emissao ASC, numero ASC
    `;
    const nfeRows = await sql`
      SELECT id, sale_id, numero, serie, chave_acesso, protocolo, status, data_emissao, xml_retorno
      FROM nfe
      WHERE status IN ('autorizada', 'cancelada')
        AND data_emissao >= ${inicio}::date
        AND data_emissao < (${fim}::date + INTERVAL '1 day')
      ORDER BY data_emissao ASC, numero ASC
    `;

    const completos: any[] = [];
    const pendentes: any[] = [];
    const processar = (rows: any[], tipo: 'NFCe' | 'NFe') => {
      for (const row of rows) {
        const xml = String(row.xml_retorno || '').trim();
        if (isCompleteFiscalXml(xml)) completos.push({ ...row, tipo, xml });
        else {
          const faltando: string[] = [];
          if (!hasTag(xml, 'nfeProc')) faltando.push('nfeProc');
          if (!hasTag(xml, 'NFe')) faltando.push('NFe');
          if (!hasTag(xml, 'Signature')) faltando.push('Signature');
          if (!hasTag(xml, 'protNFe')) faltando.push('protNFe');
          pendentes.push({ ...row, tipo, motivo: `XML incompleto. Ausente: ${faltando.join(', ') || 'estrutura fiscal completa'}` });
        }
      }
    };
    processar(nfceRows as any[], 'NFCe');
    processar(nfeRows as any[], 'NFe');

    if (!completos.length && !pendentes.length) throw createError({ statusCode: 404, statusMessage: 'Nenhuma NF-e/NFC-e autorizada ou cancelada encontrada no período.' });

    const configRows = await sql`
      SELECT razao_social, nome_fantasia, cnpj, identificacao_loja
      FROM company_fiscal_config ORDER BY created_at DESC LIMIT 1
    `;
    const empresa: any = configRows?.[0] || {};
    const resumo = [
      'EMPÓRIO DAS COXINHAS','EXPORTAÇÃO DE DOCUMENTOS FISCAIS','',
      `Período: ${inicio} até ${fim}`,
      `Loja: ${empresa.identificacao_loja || empresa.nome_fantasia || ''}`,
      `Razão Social: ${empresa.razao_social || ''}`,
      `CNPJ: ${empresa.cnpj || ''}`,'',
      `Total localizado: ${completos.length + pendentes.length}`,
      `XMLs fiscais completos exportados: ${completos.length}`,
      `XMLs pendentes/incompletos: ${pendentes.length}`,'',
      'Somente XMLs contendo nfeProc, NFe, Signature e protNFe foram exportados.',
      'Nenhum XML foi reconstruído, reassinado ou artificialmente gerado.',''
    ].join('\r\n');

    const header = ['Tipo','ID Fiscal','ID Venda','Numero','Serie','Chave de Acesso','Protocolo','Status','Data Emissao','Motivo'];
    const csv = [header.map(csvEscape).join(';'), ...pendentes.map((x) => [x.tipo,x.id,x.sale_id,x.numero,x.serie,x.chave_acesso,x.protocolo,x.status,formatDateBR(x.data_emissao),x.motivo].map(csvEscape).join(';'))].join('\r\n');

    const archive = archiver('zip', { zlib: { level: 9 } });
    const output = new PassThrough();
    archive.on('warning', (error) => console.warn('Aviso ao gerar ZIP fiscal:', error));
    archive.on('error', (error) => output.destroy(error));
    archive.pipe(output);

    for (const doc of completos) {
      const chave = String(doc.chave_acesso || '').replace(/\D/g, '');
      const filename = chave.length === 44 ? `${chave}-procNFe.xml` : `${doc.tipo}-${doc.numero || doc.id}-procNFe.xml`;
      archive.append(doc.xml, { name: `XML/${doc.tipo}/${filename}` });
    }
    archive.append(resumo, { name: 'RESUMO-EXPORTACAO.txt' });
    if (pendentes.length) archive.append('\uFEFF' + csv, { name: 'XML-PENDENTES.csv' });

    const a = inicio.replace(/-/g, '');
    const b = fim.replace(/-/g, '');
    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="XML-Fiscais-${a}-${b}.zip"`,
      'Cache-Control': 'no-store',
    });
    void archive.finalize();
    return sendStream(event, output);
  } catch (error: any) {
    console.error('Erro na exportação dos XMLs fiscais:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: `Erro ao gerar exportação dos XMLs fiscais: ${error?.message || String(error)}` });
  }
});

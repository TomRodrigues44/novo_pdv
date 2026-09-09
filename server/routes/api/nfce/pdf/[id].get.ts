import { sql } from '../../../../utils/db';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const decodeXml = (value = '') => value
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

const tag = (xml: string, name: string) => {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
};

const blocks = (xml: string, name: string) =>
  [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'gi'))].map((m) => m[1]);

const money = (value: string | number) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatKey = (key: string) => key.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();

const formatCpfCnpj = (value: string) => {
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return value;
};

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da NFC-e não informado.' });

  const rows = await sql`
    SELECT id, numero, serie, chave_acesso, protocolo, status, ambiente, xml_retorno
    FROM nfce
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows?.length) throw createError({ statusCode: 404, statusMessage: 'NFC-e não encontrada.' });
  const nfce = rows[0];

  if (!['autorizada', 'cancelada'].includes(String(nfce.status || '').toLowerCase())) {
    throw createError({ statusCode: 409, statusMessage: 'Somente NFC-e autorizada/cancelada pode gerar DANFE.' });
  }

  const xml = String(nfce.xml_retorno || '').trim();
  if (!xml.includes('<nfeProc') || !xml.includes('<Signature') || !xml.includes('<protNFe')) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Registro sem XML fiscal completo (nfeProc + Signature + protNFe). DANFE não será gerado.',
    });
  }

  const infNFe = tag(xml, 'infNFe') || xml;
  const emit = tag(infNFe, 'emit');
  const enderEmit = tag(emit, 'enderEmit');
  const dest = tag(infNFe, 'dest');
  const ide = tag(infNFe, 'ide');
  const total = tag(infNFe, 'ICMSTot');
  const prot = tag(xml, 'infProt');
  const supl = tag(xml, 'infNFeSupl');

  const chave = String(nfce.chave_acesso || tag(prot, 'chNFe') || '').replace(/\D/g, '');
  const numero = String(nfce.numero || tag(ide, 'nNF') || '');
  const serie = String(nfce.serie || tag(ide, 'serie') || '');
  const protocolo = String(nfce.protocolo || tag(prot, 'nProt') || '');
  const dhEmi = tag(ide, 'dhEmi');
  const tpAmb = tag(ide, 'tpAmb');
  const qrText = tag(supl, 'qrCode');
  const freight = Number(tag(total, 'vFrete') || 0);

  const emitterName = tag(emit, 'xNome') || 'EMITENTE';
  const emitterCnpj = tag(emit, 'CNPJ');
  const emitterAddress = [tag(enderEmit, 'xLgr'), tag(enderEmit, 'nro'), tag(enderEmit, 'xBairro')].filter(Boolean).join(', ');
  const emitterCity = [tag(enderEmit, 'xMun'), tag(enderEmit, 'UF')].filter(Boolean).join(' - ');

  const destName = tag(dest, 'xNome');
  const destDoc = tag(dest, 'CPF') || tag(dest, 'CNPJ');

  const items = blocks(infNFe, 'det').map((det) => {
    const prod = tag(det, 'prod');
    return {
      code: tag(prod, 'cProd'),
      name: tag(prod, 'xProd'),
      qty: tag(prod, 'qCom'),
      unit: tag(prod, 'uCom'),
      unitValue: tag(prod, 'vUnCom'),
      total: tag(prod, 'vProd'),
    };
  });

  const payments = blocks(infNFe, 'detPag').map((p) => ({
    type: tag(p, 'tPag'),
    value: tag(p, 'vPag'),
  }));
  const paymentNames: Record<string, string> = {
    '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartão de Crédito', '04': 'Cartão de Débito',
    '05': 'Crédito Loja', '10': 'Vale Alimentação', '11': 'Vale Refeição', '12': 'Vale Presente',
    '13': 'Vale Combustível', '15': 'Boleto', '16': 'Depósito Bancário', '17': 'PIX',
    '18': 'Transferência / Carteira Digital', '19': 'Programa de Fidelidade', '90': 'Sem pagamento', '99': 'Outros',
  };

  const doc = new PDFDocument({ size: 'A4', margin: 28, info: { Title: `DANFE NFC-e ${numero}` } });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const left = 28;
  const right = doc.page.width - 28;
  const contentWidth = right - left;
  const border = '#777777';
  const light = '#F3F3F3';

  const box = (x: number, y: number, w: number, h: number, fill?: string) => {
    if (fill) doc.save().fillColor(fill).rect(x, y, w, h).fill().restore();
    doc.strokeColor(border).lineWidth(0.6).rect(x, y, w, h).stroke();
  };
  const sectionTitle = (title: string, y: number) => {
    doc.save().fillColor(light).rect(left, y, contentWidth, 17).fill().restore();
    doc.strokeColor(border).lineWidth(0.6).rect(left, y, contentWidth, 17).stroke();
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8).text(title, left + 6, y + 5, { width: contentWidth - 12 });
    return y + 17;
  };
  const safeDate = (value: string) => {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('pt-BR');
  };

  let y = 28;

  // Cabeçalho do emitente
  box(left, y, contentWidth, 76);
  doc.font('Helvetica-Bold').fontSize(14).text(emitterName, left + 8, y + 9, { width: contentWidth - 16, align: 'center' });
  doc.font('Helvetica').fontSize(8.5).text(`CNPJ: ${formatCpfCnpj(emitterCnpj)}`, left + 8, y + 29, { width: contentWidth - 16, align: 'center' });
  if (emitterAddress) doc.text(emitterAddress, left + 8, y + 42, { width: contentWidth - 16, align: 'center' });
  if (emitterCity) doc.text(emitterCity, left + 8, y + 54, { width: contentWidth - 16, align: 'center' });
  y += 80;

  // Identificação do DANFE
  box(left, y, contentWidth, tpAmb === '2' || String(nfce.status).toLowerCase() === 'cancelada' ? 68 : 50);
  doc.font('Helvetica-Bold').fontSize(15).text('DANFE NFC-e', left + 8, y + 8, { width: contentWidth - 16, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).text('Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica', left + 8, y + 27, { width: contentWidth - 16, align: 'center' });
  let alertY = y + 42;
  if (tpAmb === '2') {
    doc.save().fillColor('#E9E9E9').rect(left + 8, alertY, contentWidth - 16, 17).fill().restore();
    doc.font('Helvetica-Bold').fontSize(9).text('AMBIENTE DE HOMOLOGAÇÃO — SEM VALOR FISCAL', left + 12, alertY + 4, { width: contentWidth - 24, align: 'center' });
    alertY += 20;
  }
  if (String(nfce.status).toLowerCase() === 'cancelada') {
    doc.font('Helvetica-Bold').fontSize(10).text('NFC-e CANCELADA', left + 8, alertY, { width: contentWidth - 16, align: 'center' });
  }
  y += tpAmb === '2' || String(nfce.status).toLowerCase() === 'cancelada' ? 72 : 54;

  // Número / série / emissão
  const col1 = contentWidth * 0.28;
  const col2 = contentWidth * 0.20;
  const col3 = contentWidth - col1 - col2;
  box(left, y, col1, 38, light); box(left + col1, y, col2, 38, light); box(left + col1 + col2, y, col3, 38, light);
  doc.font('Helvetica').fontSize(6.5).text('NFC-e Nº', left + 6, y + 5);
  doc.font('Helvetica-Bold').fontSize(10).text(numero || '-', left + 6, y + 17, { width: col1 - 12 });
  doc.font('Helvetica').fontSize(6.5).text('SÉRIE', left + col1 + 6, y + 5);
  doc.font('Helvetica-Bold').fontSize(10).text(serie || '-', left + col1 + 6, y + 17, { width: col2 - 12 });
  doc.font('Helvetica').fontSize(6.5).text('DATA/HORA DE EMISSÃO', left + col1 + col2 + 6, y + 5);
  doc.font('Helvetica-Bold').fontSize(9).text(safeDate(dhEmi), left + col1 + col2 + 6, y + 17, { width: col3 - 12 });
  y += 42;

  y = sectionTitle('CONSUMIDOR', y);
  const consumerLines: string[] = [];
  if (destName) consumerLines.push(`Nome: ${destName}`);
  if (destDoc) consumerLines.push(`${destDoc.length === 11 ? 'CPF' : 'CNPJ'}: ${formatCpfCnpj(destDoc)}`);
  if (!consumerLines.length) consumerLines.push('CONSUMIDOR NÃO IDENTIFICADO');
  const consumerH = Math.max(29, consumerLines.length * 12 + 10);
  box(left, y, contentWidth, consumerH);
  doc.font('Helvetica').fontSize(8).text(consumerLines.join('\n'), left + 6, y + 7, { width: contentWidth - 12, lineGap: 2 });
  y += consumerH + 4;

  // Tabela de itens
  y = sectionTitle('ITENS', y);
  const widths = [48, 245, 48, 35, 78, contentWidth - 454];
  const headers = ['CÓD.', 'DESCRIÇÃO', 'QTD.', 'UN', 'VL. UNIT.', 'TOTAL'];
  let x = left;
  headers.forEach((h, i) => {
    box(x, y, widths[i], 19, light);
    doc.font('Helvetica-Bold').fontSize(6.5).text(h, x + 3, y + 6, { width: widths[i] - 6, align: i >= 2 ? 'right' : 'left' });
    x += widths[i];
  });
  y += 19;

  items.forEach((item) => {
    const description = item.name || 'Produto';
    const rowH = Math.max(22, doc.heightOfString(description, { width: widths[1] - 6, font: 'Helvetica', size: 7 }) + 10);
    x = left;
    const values = [
      item.code || '-', description,
      Number(item.qty || 0).toLocaleString('pt-BR', { maximumFractionDigits: 4 }), item.unit || '',
      money(item.unitValue), money(item.total),
    ];
    values.forEach((v, i) => {
      box(x, y, widths[i], rowH);
      doc.font('Helvetica').fontSize(7).text(v, x + 3, y + 6, { width: widths[i] - 6, align: i >= 2 ? 'right' : 'left' });
      x += widths[i];
    });
    y += rowH;
  });
  y += 4;

  // Totais
  const totalsW = 220;
  const totalsX = right - totalsW;
  box(totalsX, y, totalsW, freight ? 58 : 42);
  doc.font('Helvetica').fontSize(8).text('Produtos', totalsX + 8, y + 7, { width: 105 });
  doc.text(money(tag(total, 'vProd')), totalsX + 115, y + 7, { width: 95, align: 'right' });
  let totalLineY = y + 20;
  if (freight) {
    doc.text('Frete', totalsX + 8, totalLineY, { width: 105 });
    doc.text(money(freight), totalsX + 115, totalLineY, { width: 95, align: 'right' });
    totalLineY += 14;
  }
  doc.font('Helvetica-Bold').fontSize(11).text('TOTAL NFC-e', totalsX + 8, totalLineY, { width: 105 });
  doc.text(money(tag(total, 'vNF')), totalsX + 115, totalLineY, { width: 95, align: 'right' });
  y += freight ? 62 : 46;

  if (payments.length) {
    y = sectionTitle('PAGAMENTO', y);
    const payH = Math.max(28, payments.length * 15 + 9);
    box(left, y, contentWidth, payH);
    let py = y + 7;
    payments.forEach((p) => {
      doc.font('Helvetica').fontSize(8).text(paymentNames[p.type] || `Forma ${p.type}`, left + 6, py, { width: contentWidth - 120 });
      doc.font('Helvetica-Bold').text(money(p.value), right - 106, py, { width: 100, align: 'right' });
      py += 15;
    });
    y += payH + 4;
  }

  // Chave e protocolo
  y = sectionTitle('DADOS FISCAIS / CONSULTA', y);
  box(left, y, contentWidth, 53);
  doc.font('Helvetica').fontSize(6.5).text('CHAVE DE ACESSO', left + 6, y + 6, { width: contentWidth - 12, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(8).text(formatKey(chave), left + 6, y + 17, { width: contentWidth - 12, align: 'center' });
  doc.font('Helvetica').fontSize(7).text(`Protocolo de autorização: ${protocolo || tag(prot, 'nProt') || '-'}`, left + 6, y + 34, { width: contentWidth - 12, align: 'center' });
  y += 57;

  if (qrText) {
    const qrBoxH = 164;
    box(left, y, contentWidth, qrBoxH);
    doc.font('Helvetica').fontSize(7).text('Consulte a NFC-e pela chave de acesso ou pelo QR Code.', left + 6, y + 8, { width: contentWidth - 12, align: 'center' });
    try {
      const dataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 220 });
      const image = Buffer.from(dataUrl.split(',')[1], 'base64');
      const qrSize = 112;
      const qrX = left + (contentWidth - qrSize) / 2;
      doc.image(image, qrX, y + 27, { width: qrSize });
    } catch (error) {
      console.error('Erro ao gerar QR Code do DANFE:', error);
    }
    doc.font('Helvetica').fontSize(6.2).text(formatKey(chave), left + 6, y + 143, { width: contentWidth - 12, align: 'center' });
    y += qrBoxH + 4;
  }

  doc.font('Helvetica').fontSize(6.5).text('DANFE NFC-e — Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica', left, y + 2, { width: contentWidth, align: 'center' });
  doc.end();
  const pdf = await done;

  const filename = chave.length === 44 ? `${chave}-danfe-nfce.pdf` : `NFCe-${numero || id}-DANFE.pdf`;
  setHeader(event, 'Content-Type', 'application/pdf');
  setHeader(event, 'Content-Disposition', `inline; filename="${filename}"`);
  setHeader(event, 'Content-Length', String(pdf.length));
  setHeader(event, 'Cache-Control', 'no-store');
  return pdf;
});

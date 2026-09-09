import { sql } from '../../../../utils/db';
import PDFDocument from 'pdfkit';
import path from 'node:path';
import fs from 'node:fs';


function parseCompetencia(value: unknown) {
  const competencia = String(value || '').trim();
  if (!/^\d{4}-\d{2}$/.test(competencia)) {
    throw createError({ statusCode: 400, statusMessage: 'Competência inválida. Utilize o formato AAAA-MM.' });
  }
  const [year, month] = competencia.split('-').map(Number);
  if (month < 1 || month > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Mês inválido.' });
  }
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    competencia,
    year,
    month,
    start: `${year}-${String(month).padStart(2, '0')}-01 00:00:00`,
    end: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`,
  };
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function buildReport(rows: any[]) {
  const sales = rows.map((row: any) => ({
    id: row.id,
    total: Number(row.total_amount || 0),
    status: String(row.status || ''),
    createdAt: row.created_at,
  }));

  const cancelled = sales.filter((sale) => sale.status === 'cancelled');
  const active = sales.filter((sale) => sale.status !== 'cancelled');
  const daily = new Map<string, { data: string; quantidade: number; bruto: number; canceladas: number; faturamento: number }>();

  for (const sale of sales) {
    const rawDate = String(sale.createdAt || '');
    const match = rawDate.match(/^(\d{4}-\d{2}-\d{2})/);
    const data = match?.[1] || new Date(sale.createdAt).toLocaleDateString('en-CA');
    const item = daily.get(data) || { data, quantidade: 0, bruto: 0, canceladas: 0, faturamento: 0 };
    item.quantidade += 1;
    item.bruto += sale.total;
    if (sale.status === 'cancelled') item.canceladas += sale.total;
    else item.faturamento += sale.total;
    daily.set(data, item);
  }

  return {
    totalRegistros: sales.length,
    vendasNaoCanceladas: active.length,
    vendasCanceladas: cancelled.length,
    valorBruto: money(sales.reduce((sum, sale) => sum + sale.total, 0)),
    valorCancelado: money(cancelled.reduce((sum, sale) => sum + sale.total, 0)),
    faturamentoConsiderado: money(active.reduce((sum, sale) => sum + sale.total, 0)),
    porDia: Array.from(daily.values()).sort((a, b) => a.data.localeCompare(b.data)).map((day) => ({
      ...day,
      bruto: money(day.bruto),
      canceladas: money(day.canceladas),
      faturamento: money(day.faturamento),
    })),
  };
}

const brl = (value: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value || 0));

const competenciaExtenso = (year: number, month: number) => {
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${meses[month - 1]} de ${year}`;
};


export default defineEventHandler(async (event) => {
  try {
    const { competencia, year, month, start, end } = parseCompetencia(getQuery(event).competencia);

    const rows = await sql`
      SELECT id, total_amount, status, created_at
      FROM sales
      WHERE created_at >= ${start}::timestamp
        AND created_at < ${end}::timestamp
      ORDER BY created_at ASC
    `;

    const configRows = await sql`
      SELECT *
      FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const config: any = configRows?.[0] || {};
    const identificacaoLoja = String(config.identificacao_loja || '').trim();
    const report = buildReport(Array.isArray(rows) ? rows : []);

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 26, right: 34, bottom: 34, left: 34 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    const finished = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const PAGE_W = 595.28;
    const LEFT = 34;
    const RIGHT = 34;
    const CONTENT_W = PAGE_W - LEFT - RIGHT;

    // Cores inspiradas na identidade visual do sistema.
    const ORANGE = '#ea580c';
    const ORANGE_DARK = '#9a3412';
    const ORANGE_LIGHT = '#fff7ed';
    const RED = '#dc2626';
    const RED_LIGHT = '#fef2f2';
    const GREEN = '#15803d';
    const GREEN_LIGHT = '#f0fdf4';
    const GRAY = '#475569';
    const LIGHT = '#f8fafc';
    const BORDER = '#d7dee8';
    const DARK = '#111827';

    const roundedBox = (
      x: number,
      y: number,
      w: number,
      h: number,
      fill: string,
      stroke = BORDER,
      radius = 7,
    ) => {
      doc.save();
      doc.roundedRect(x, y, w, h, radius).fillAndStroke(fill, stroke);
      doc.restore();
    };

    const formatCnpj = (value: unknown) => {
      const digits = String(value || '').replace(/\D/g, '');
      if (digits.length !== 14) return String(value || '').trim() || 'Não informado';
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    const formatCep = (value: unknown) => {
      const digits = String(value || '').replace(/\D/g, '');
      return digits.length === 8 ? digits.replace(/^(\d{5})(\d{3})$/, '$1-$2') : String(value || '').trim();
    };

    const drawListIcon = (x: number, y: number) => {
      doc.save().strokeColor(ORANGE).fillColor(ORANGE).lineWidth(1.5);
      [0, 7, 14].forEach((offset) => {
        doc.circle(x + 2, y + 2 + offset, 1.7).fill();
        doc.moveTo(x + 7, y + 2 + offset).lineTo(x + 19, y + 2 + offset).stroke();
      });
      doc.restore();
    };

    const drawCalendarIcon = (x: number, y: number) => {
      doc.save().strokeColor(ORANGE).lineWidth(1.35);
      doc.roundedRect(x, y + 3, 16, 14, 2).stroke();
      doc.moveTo(x, y + 7).lineTo(x + 16, y + 7).stroke();
      doc.moveTo(x + 4, y).lineTo(x + 4, y + 5).stroke();
      doc.moveTo(x + 12, y).lineTo(x + 12, y + 5).stroke();
      doc.restore();
    };

    const drawStoreIcon = (x: number, y: number) => {
      doc.save().strokeColor(ORANGE).lineWidth(1.5);
      doc.rect(x + 2, y + 8, 16, 11).stroke();
      doc.moveTo(x, y + 8).lineTo(x + 3, y + 2).lineTo(x + 17, y + 2).lineTo(x + 20, y + 8).stroke();
      doc.moveTo(x + 7, y + 19).lineTo(x + 7, y + 12).lineTo(x + 13, y + 12).lineTo(x + 13, y + 19).stroke();
      doc.restore();
    };

    const drawInfoIcon = (x: number, y: number) => {
      doc.save().fillColor('#f59e0b').circle(x + 8, y + 8, 8).fill();
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('i', x + 6.4, y + 2.6, { width: 4, align: 'center' });
      doc.restore();
    };

    const labelValue = (
      label: string,
      value: string,
      x: number,
      y: number,
      w: number,
      options?: { fill?: string; stroke?: string; valueColor?: string; sub?: string },
    ) => {
      roundedBox(x, y, w, 66, options?.fill || '#ffffff', options?.stroke || BORDER);
      doc.fillColor(GRAY).font('Helvetica-Bold').fontSize(7.5)
        .text(label, x + 10, y + 10, { width: w - 20 });
      doc.fillColor(options?.valueColor || DARK).font('Helvetica-Bold').fontSize(15)
        .text(value, x + 10, y + 27, { width: w - 20 });
      if (options?.sub) {
        doc.fillColor(GRAY).font('Helvetica').fontSize(6.8)
          .text(options.sub, x + 10, y + 50, { width: w - 20 });
      }
    };

    // -------------------------------------------------------------------------
    // CABEÇALHO — usa SOMENTE o arquivo original da marca, sem recriar a logo.
    // -------------------------------------------------------------------------
    const logoPath = path.resolve(process.cwd(), 'public', 'products', 'logo-emporio.jpg');
    const bannerY = 26;
    const bannerH = 94;

    roundedBox(LEFT, bannerY, CONTENT_W, bannerH, ORANGE_LIGHT, '#fed7aa', 9);

    if (fs.existsSync(logoPath)) {
      // "fit" preserva a proporção original; não há crop, distorção ou alteração da marca.
      doc.image(logoPath, LEFT + 18, bannerY + 10, {
        fit: [CONTENT_W - 36, 74],
        align: 'center',
        valign: 'center',
      });
    } else {
      doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(22)
        .text('EMPÓRIO DAS COXINHAS', LEFT, bannerY + 34, { width: CONTENT_W, align: 'center' });
    }

    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(17)
      .text('RELATÓRIO DE FATURAMENTO', LEFT, 136, { width: CONTENT_W, align: 'center' });
    doc.fillColor(GRAY).font('Helvetica').fontSize(10)
      .text(`Competência: ${competenciaExtenso(year, month)}`, LEFT, 159, { width: CONTENT_W, align: 'center' });

    if (identificacaoLoja) {
      doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(8.5)
        .text(identificacaoLoja, LEFT, 176, { width: CONTENT_W, align: 'center' });
    }

    doc.save().strokeColor(ORANGE).lineWidth(1.6)
      .moveTo(LEFT, 193).lineTo(PAGE_W - RIGHT, 193).stroke().restore();

    // -------------------------------------------------------------------------
    // INDICADORES
    // -------------------------------------------------------------------------
    const gap = 8;
    const cardW = (CONTENT_W - gap * 3) / 4;
    const cardY = 207;

    labelValue('REGISTROS', String(report.totalRegistros), LEFT, cardY, cardW, {
      fill: ORANGE_LIGHT,
      stroke: '#fdba74',
      sub: `${report.vendasNaoCanceladas} não cancelada(s)`,
    });
    labelValue('VALOR BRUTO', brl(report.valorBruto), LEFT + (cardW + gap), cardY, cardW, {
      fill: ORANGE_LIGHT,
      stroke: '#fdba74',
      sub: 'Todas as vendas',
    });
    labelValue('CANCELADAS', brl(report.valorCancelado), LEFT + (cardW + gap) * 2, cardY, cardW, {
      fill: RED_LIGHT,
      stroke: '#fecaca',
      valueColor: RED,
      sub: `${report.vendasCanceladas} venda(s)`,
    });
    labelValue('FATURAMENTO', brl(report.faturamentoConsiderado), LEFT + (cardW + gap) * 3, cardY, cardW, {
      fill: GREEN_LIGHT,
      stroke: '#bbf7d0',
      valueColor: GREEN,
      sub: 'Bruto menos canceladas',
    });

    // Ícones vetoriais simples — não dependem de fontes externas.
    const iconY = cardY + 11;
    const iconXs = [
      LEFT + cardW - 27,
      LEFT + (cardW + gap) + cardW - 27,
      LEFT + (cardW + gap) * 2 + cardW - 27,
      LEFT + (cardW + gap) * 3 + cardW - 27,
    ];

    // Registro: folha
    doc.save().strokeColor(ORANGE).lineWidth(1.8)
      .roundedRect(iconXs[0], iconY, 15, 19, 2).stroke()
      .moveTo(iconXs[0] + 4, iconY + 6).lineTo(iconXs[0] + 11, iconY + 6).stroke()
      .moveTo(iconXs[0] + 4, iconY + 10).lineTo(iconXs[0] + 11, iconY + 10).stroke()
      .moveTo(iconXs[0] + 4, iconY + 14).lineTo(iconXs[0] + 9, iconY + 14).stroke().restore();

    // Valor bruto: barras
    doc.save().fillColor(ORANGE)
      .rect(iconXs[1], iconY + 12, 4, 7).fill()
      .rect(iconXs[1] + 6, iconY + 7, 4, 12).fill()
      .rect(iconXs[1] + 12, iconY + 2, 4, 17).fill().restore();

    // Canceladas: círculo + X
    doc.save().strokeColor(RED).lineWidth(2)
      .circle(iconXs[2] + 8, iconY + 9, 8).stroke()
      .moveTo(iconXs[2] + 4, iconY + 5).lineTo(iconXs[2] + 12, iconY + 13).stroke()
      .moveTo(iconXs[2] + 12, iconY + 5).lineTo(iconXs[2] + 4, iconY + 13).stroke().restore();

    // Faturamento: moedas
    doc.save().strokeColor(GREEN).lineWidth(1.6)
      .ellipse(iconXs[3] + 8, iconY + 5, 8, 3).stroke()
      .ellipse(iconXs[3] + 8, iconY + 10, 8, 3).stroke()
      .ellipse(iconXs[3] + 8, iconY + 15, 8, 3).stroke().restore();

    // -------------------------------------------------------------------------
    // RESUMO + PERÍODO/UNIDADE
    // -------------------------------------------------------------------------
    const infoY = 289;
    const leftW = 280;
    const rightX = LEFT + leftW + 10;
    const rightW = CONTENT_W - leftW - 10;
    const infoH = 118;

    roundedBox(LEFT, infoY, leftW, 168, '#ffffff', '#fed7aa');
    drawListIcon(LEFT + 12, infoY + 15);
    doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(12)
      .text('Resumo', LEFT + 42, infoY + 12);

    const summaryRows = [
      ['Vendas não canceladas', String(report.vendasNaoCanceladas)],
      ['Vendas canceladas', String(report.vendasCanceladas)],
      ['Total de registros', String(report.totalRegistros)],
      ['Faturamento considerado', brl(report.faturamentoConsiderado)],
    ];

    let sy = infoY + 48;
    summaryRows.forEach(([label, value], index) => {
      doc.fillColor(GRAY).font(index === 3 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5)
        .text(label, LEFT + 12, sy, { width: 170 });
      doc.fillColor(index === 3 ? GREEN : DARK).font('Helvetica-Bold').fontSize(8.5)
        .text(value, LEFT + 185, sy, { width: leftW - 197, align: 'right' });
      if (index < summaryRows.length - 1) {
        doc.save().strokeColor('#e5e7eb').lineWidth(0.5)
          .moveTo(LEFT + 12, sy + 15).lineTo(LEFT + leftW - 12, sy + 15).stroke().restore();
      }
      sy += 27;
    });

    const lastDay = new Date(year, month, 0).getDate();
    const reportGeneratedAt = new Date();
    const generatedAtText = reportGeneratedAt.toLocaleString('pt-BR', {
      timeZone: 'America/Boa_Vista',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    roundedBox(rightX, infoY, rightW, 76, LIGHT, BORDER);
    drawCalendarIcon(rightX + 12, infoY + 7);
    doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(10)
      .text('Período', rightX + 37, infoY + 10);

    const periodRows = [
      ['Competência:', competenciaExtenso(year, month)],
      ['Data inicial:', `01/${String(month).padStart(2, '0')}/${year}`],
      ['Data final:', `${String(lastDay).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`],
      ['Emissão do relatório:', generatedAtText],
    ];

    let py = infoY + 34;
    periodRows.forEach(([label, value]) => {
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.8)
        .text(label, rightX + 12, py, { width: 78 });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(6.8)
        .text(value, rightX + 91, py, { width: rightW - 103 });
      py += 10;
    });

    roundedBox(rightX, infoY + 84, rightW, 84, LIGHT, BORDER);
    drawStoreIcon(rightX + 12, infoY + 92);
    doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(10)
      .text('Unidade', rightX + 38, infoY + 95);

    const cleanAddressPart = (value: unknown) =>
      String(value || '')
        .trim()
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .replace(/\s{2,}/g, ' ');

    const rawComplemento = cleanAddressPart(config.complemento);
    const complementoEhPlaceholder =
      !rawComplemento ||
      /apto.*bloco.*etc/i.test(rawComplemento) ||
      /apartamento.*bloco.*etc/i.test(rawComplemento) ||
      /complemento/i.test(rawComplemento);

    const enderecoCompleto = [
      cleanAddressPart(config.logradouro),
      cleanAddressPart(config.numero),
      complementoEhPlaceholder ? '' : rawComplemento,
      cleanAddressPart(config.bairro),
    ].filter(Boolean).join(', ');

    const cidadeUf = [
      config.municipio,
      config.uf,
    ].filter((value) => String(value || '').trim()).join(' - ');

    const unidadeRows = [
      ['Loja:', identificacaoLoja || String(config.nome_fantasia || '').trim() || 'Não informada'],
      ['CNPJ:', formatCnpj(config.cnpj)],
      ['Endereço:', enderecoCompleto || 'Não informado'],
      ['Cidade/UF:', cidadeUf || 'Não informado'],
    ];

    let uy = infoY + 121;
    unidadeRows.forEach(([label, value]) => {
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
        .text(label, rightX + 12, uy, { width: 55 });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(6.5)
        .text(String(value), rightX + 68, uy, { width: rightW - 80, height: 19 });
      uy += 13;
    });

    // -------------------------------------------------------------------------
    // FATURAMENTO DIÁRIO
    // -------------------------------------------------------------------------
    let tableY = 475;

    const drawTableTitle = (y: number) => {
      doc.save().roundedRect(LEFT, y, CONTENT_W, 27, 6).fill(ORANGE).restore();
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
        .text('Faturamento diário', LEFT + 12, y + 8);
      return y + 27;
    };

    const widths = [100, 70, 116, 116, 125];
    const headers = ['Data', 'Vendas', 'Valor bruto', 'Canceladas', 'Faturamento'];

    const drawTableHeader = (y: number) => {
      let x = LEFT;
      doc.font('Helvetica-Bold').fontSize(7.2);
      headers.forEach((header, i) => {
        doc.save().rect(x, y, widths[i], 22).fillAndStroke(ORANGE_LIGHT, '#fed7aa').restore();
        doc.fillColor(DARK).text(header, x + 6, y + 7, {
          width: widths[i] - 12,
          align: i === 0 ? 'left' : 'right',
        });
        x += widths[i];
      });
      return y + 22;
    };

    tableY = drawTableTitle(tableY);
    tableY = drawTableHeader(tableY);

    for (const day of report.porDia) {
      if (tableY > 716) {
        doc.addPage();
        tableY = 44;
        tableY = drawTableTitle(tableY);
        tableY = drawTableHeader(tableY);
      }

      const [yy, mm, dd] = day.data.split('-');
      const values = [
        `${dd}/${mm}/${yy}`,
        String(day.quantidade),
        brl(day.bruto),
        brl(day.canceladas),
        brl(day.faturamento),
      ];

      let x = LEFT;
      values.forEach((value, i) => {
        doc.save().rect(x, tableY, widths[i], 21).fillAndStroke('#ffffff', BORDER).restore();
        const valueColor = i === 3 ? RED : i === 4 ? GREEN : DARK;
        doc.fillColor(valueColor).font(i >= 3 ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.2)
          .text(value, x + 6, tableY + 6, {
            width: widths[i] - 12,
            align: i === 0 ? 'left' : 'right',
          });
        x += widths[i];
      });

      tableY += 21;
    }

    // Total do período.
    let x = LEFT;
    const totalValues = [
      'TOTAL DO PERÍODO',
      String(report.totalRegistros),
      brl(report.valorBruto),
      brl(report.valorCancelado),
      brl(report.faturamentoConsiderado),
    ];

    totalValues.forEach((value, i) => {
      doc.save().rect(x, tableY, widths[i], 23).fillAndStroke(ORANGE_LIGHT, '#fed7aa').restore();
      doc.fillColor(i === 3 ? RED : i === 4 ? GREEN : DARK)
        .font('Helvetica-Bold').fontSize(7.5)
        .text(value, x + 6, tableY + 7, {
          width: widths[i] - 12,
          align: i === 0 ? 'left' : 'right',
        });
      x += widths[i];
    });
    tableY += 23;

    // -------------------------------------------------------------------------
    // OBSERVAÇÃO
    // -------------------------------------------------------------------------
    if (tableY > 635) {
      doc.addPage();
      tableY = 50;
    } else {
      tableY += 16;
    }

    roundedBox(LEFT, tableY, CONTENT_W, 48, '#fffbeb', '#fbbf24');
    drawInfoIcon(LEFT + 12, tableY + 9);
    doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(9.5)
      .text('Observação', LEFT + 38, tableY + 10);
    doc.fillColor(GRAY).font('Helvetica').fontSize(7.4)
      .text(
        'Este relatório é gerado a partir das vendas registradas no PDV. Recomenda-se conferir os valores com os fechamentos de caixa e documentos fiscais antes da apuração contábil.',
        LEFT + 38,
        tableY + 25,
        { width: CONTENT_W - 50, align: 'justify' },
      );

    // -------------------------------------------------------------------------
    // RODAPÉ — sempre dentro da primeira página útil; evita página vazia.
    // -------------------------------------------------------------------------
    const footerTop = 700;
    const footerBottom = 782;

    const footerAddress = [
      cleanAddressPart(config.logradouro),
      cleanAddressPart(config.numero),
      complementoEhPlaceholder ? '' : rawComplemento,
      cleanAddressPart(config.bairro),
    ].filter(Boolean).join(', ');

    const footerCity = [
      config.municipio,
      config.uf,
    ].filter((value) => String(value || '').trim()).join(' - ');

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc.save().strokeColor(ORANGE).lineWidth(1.2)
        .moveTo(LEFT, footerTop).lineTo(PAGE_W - RIGHT, footerTop).stroke().restore();

      doc.fillColor(ORANGE_DARK).font('Helvetica-Bold').fontSize(8.2)
        .text('EMPÓRIO DAS COXINHAS', LEFT, footerTop + 9, { width: 205 });

      let footerY = footerTop + 20;
      if (config.cnpj) {
        doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
          .text(`CNPJ: ${formatCnpj(config.cnpj)}`, LEFT, footerY, { width: 235 });
        footerY += 10;
      }
      if (footerAddress) {
        doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
          .text(footerAddress, LEFT, footerY, { width: 245 });
        footerY += 10;
      }
      if (footerCity) {
        doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
          .text(footerCity, LEFT, footerY, { width: 245 });
      }

      doc.save().strokeColor('#fed7aa').lineWidth(0.8)
        .moveTo(300, footerTop + 10).lineTo(300, footerTop + 50).stroke().restore();

      // Slogan com tipografia serifada/itálica, mais elegante e distinta do texto técnico.
      doc.fillColor(ORANGE_DARK).font('Times-Italic').fontSize(11.5)
        .text('Aqui tem a melhor', 320, footerTop + 9, { width: 220, align: 'center' });
      doc.font('Times-BoldItalic').fontSize(15)
        .text('Coxinha da Cidade!', 320, footerTop + 24, { width: 220, align: 'center' });

      doc.save().strokeColor(ORANGE).lineWidth(1)
        .moveTo(LEFT, footerBottom - 12).lineTo(PAGE_W - RIGHT, footerBottom - 12).stroke().restore();

      doc.fillColor(GRAY).font('Helvetica').fontSize(6.3)
        .text('Central Fiscal — Relatório de Faturamento', LEFT, footerBottom - 5, { width: 250 })
        .text(`Página ${i + 1} de ${range.count}`, 430, footerBottom - 5, { width: 131, align: 'right' });
    }
    doc.end();
    const pdfBuffer = await finished;

    setHeader(event, 'Content-Type', 'application/pdf');
    setHeader(event, 'Content-Disposition', `inline; filename="faturamento-${competencia}.pdf"`);
    setHeader(event, 'Cache-Control', 'no-store');
    return pdfBuffer;
  } catch (error: any) {
    console.error('Erro ao gerar PDF de faturamento:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar PDF de faturamento.' });
  }
});

import { sql } from '../../../../utils/db';
import ExcelJS from 'exceljs';


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
      SELECT identificacao_loja
      FROM company_fiscal_config
      LIMIT 1
    `;

    const identificacaoLoja = String(configRows?.[0]?.identificacao_loja || '').trim();
    const report = buildReport(Array.isArray(rows) ? rows : []);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Empório das Coxinhas - Central Fiscal';
    workbook.created = new Date();

    const resumo = workbook.addWorksheet('Resumo');
    resumo.columns = [{ width: 34 }, { width: 24 }];
    resumo.addRow(['EMPÓRIO DAS COXINHAS']);
    resumo.addRow(['RELATÓRIO DE FATURAMENTO']);
    if (identificacaoLoja) resumo.addRow(['Unidade', identificacaoLoja]);
    resumo.addRow(['Competência', competenciaExtenso(year, month)]);
    resumo.addRow([]);
    resumo.addRow(['Indicador', 'Valor']);
    resumo.addRow(['Registros', report.totalRegistros]);
    resumo.addRow(['Vendas não canceladas', report.vendasNaoCanceladas]);
    resumo.addRow(['Vendas canceladas', report.vendasCanceladas]);
    resumo.addRow(['Valor bruto', report.valorBruto]);
    resumo.addRow(['Valor cancelado', report.valorCancelado]);
    resumo.addRow(['Faturamento considerado', report.faturamentoConsiderado]);
    resumo.addRow([]);
    resumo.addRow(['Critério', 'Valor bruto menos vendas com status cancelled']);

    resumo.getRow(1).font = { bold: true, size: 16 };
    resumo.getRow(2).font = { bold: true, size: 13 };
    resumo.eachRow((row) => {
      row.alignment = { vertical: 'middle' };
    });
    for (let row = 7; row <= 11; row++) {
      resumo.getCell(row, 2).numFmt = row >= 9 ? '"R$" #,##0.00' : '0';
    }

    const diario = workbook.addWorksheet('Faturamento Diário');
    diario.columns = [
      { header: 'Data', key: 'data', width: 16 },
      { header: 'Vendas', key: 'quantidade', width: 12 },
      { header: 'Valor bruto', key: 'bruto', width: 18 },
      { header: 'Canceladas', key: 'canceladas', width: 18 },
      { header: 'Faturamento', key: 'faturamento', width: 18 },
    ];
    diario.getRow(1).font = { bold: true };

    for (const day of report.porDia) {
      const [yy, mm, dd] = day.data.split('-').map(Number);
      diario.addRow({
        data: new Date(yy, mm - 1, dd),
        quantidade: day.quantidade,
        bruto: day.bruto,
        canceladas: day.canceladas,
        faturamento: day.faturamento,
      });
    }

    diario.getColumn('data').numFmt = 'dd/mm/yyyy';
    diario.getColumn('bruto').numFmt = '"R$" #,##0.00';
    diario.getColumn('canceladas').numFmt = '"R$" #,##0.00';
    diario.getColumn('faturamento').numFmt = '"R$" #,##0.00';
    diario.views = [{ state: 'frozen', ySplit: 1 }];
    diario.autoFilter = { from: 'A1', to: 'E1' };

    const buffer = await workbook.xlsx.writeBuffer();

    setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setHeader(event, 'Content-Disposition', `attachment; filename="faturamento-${competencia}.xlsx"`);
    setHeader(event, 'Cache-Control', 'no-store');
    return Buffer.from(buffer);
  } catch (error: any) {
    console.error('Erro ao gerar Excel de faturamento:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar Excel de faturamento.' });
  }
});

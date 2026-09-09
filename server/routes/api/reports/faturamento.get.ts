import { sql } from '../../../utils/db';

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
    start: `${year}-${String(month).padStart(2, '0')}-01 00:00:00`,
    end: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`,
  };
}

export default defineEventHandler(async (event) => {
  try {
    const { competencia, start, end } = parseCompetencia(getQuery(event).competencia);

    const rows = await sql`
      SELECT id, total_amount, status, created_at
      FROM sales
      WHERE created_at >= ${start}::timestamp
        AND created_at < ${end}::timestamp
      ORDER BY created_at ASC
    `;

    const sales = (Array.isArray(rows) ? rows : []).map((row: any) => ({
      id: row.id,
      total: Number(row.total_amount || 0),
      status: String(row.status || ''),
      createdAt: row.created_at,
    }));

    const cancelledSales = sales.filter((sale) => sale.status === 'cancelled');
    const activeSales = sales.filter((sale) => sale.status !== 'cancelled');

    const valorBruto = sales.reduce((sum, sale) => sum + sale.total, 0);
    const valorCancelado = cancelledSales.reduce((sum, sale) => sum + sale.total, 0);
    const faturamentoConsiderado = activeSales.reduce((sum, sale) => sum + sale.total, 0);

    const dailyMap = new Map<string, { data: string; quantidade: number; bruto: number; canceladas: number; faturamento: number }>();

    for (const sale of sales) {
      const rawDate = String(sale.createdAt || '');
      const match = rawDate.match(/^(\d{4}-\d{2}-\d{2})/);
      const data = match?.[1] || new Date(sale.createdAt).toLocaleDateString('en-CA');
      const current = dailyMap.get(data) || { data, quantidade: 0, bruto: 0, canceladas: 0, faturamento: 0 };

      current.quantidade += 1;
      current.bruto += sale.total;
      if (sale.status === 'cancelled') current.canceladas += sale.total;
      else current.faturamento += sale.total;
      dailyMap.set(data, current);
    }

    const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
    const porDia = Array.from(dailyMap.values()).sort((a, b) => a.data.localeCompare(b.data)).map((day) => ({
      ...day, bruto: money(day.bruto), canceladas: money(day.canceladas), faturamento: money(day.faturamento),
    }));

    setHeader(event, 'Cache-Control', 'no-store');
    return {
      competencia,
      totalRegistros: sales.length,
      vendasNaoCanceladas: activeSales.length,
      vendasCanceladas: cancelledSales.length,
      valorBruto: money(valorBruto),
      valorCancelado: money(valorCancelado),
      faturamentoConsiderado: money(faturamentoConsiderado),
      porDia,
    };
  } catch (error: any) {
    console.error('Erro ao gerar relatório de faturamento:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Erro ao gerar relatório de faturamento.' });
  }
});

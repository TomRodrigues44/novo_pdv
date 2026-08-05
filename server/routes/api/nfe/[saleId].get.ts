import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const saleId = getRouterParam(event, 'saleId');

    if (!saleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sale_id é obrigatório',
      });
    }

    const result = await sql`
      SELECT
        n.*,
        c.name AS customer_name,
        c.cpf_cnpj AS customer_cpf_cnpj,
        c.inscricao_estadual AS customer_ie,
        c.phone AS customer_phone,
        c.email AS customer_email,
        c.cep AS customer_cep,
        c.logradouro AS customer_logradouro,
        c.numero AS customer_numero,
        c.complemento AS customer_complemento,
        c.bairro AS customer_bairro,
        c.municipio AS customer_municipio,
        c.uf AS customer_uf
      FROM nfe n
      LEFT JOIN customers c ON c.id = n.customer_id
      WHERE n.sale_id = ${saleId}
      ORDER BY n.created_at DESC
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NF-e não encontrada para esta venda',
      });
    }

    const row = result[0];
    const items = Array.isArray(row.itens) ? row.itens
      : (typeof row.itens === 'string' ? (() => { try { return JSON.parse(row.itens); } catch { return []; } })() : []);
    const payments = Array.isArray(row.pagamentos) ? row.pagamentos
      : (typeof row.pagamentos === 'string' ? (() => { try { return JSON.parse(row.pagamentos); } catch { return []; } })() : []);

    const customer = {
      name: row.customer_name || row.destinatario?.name || '',
      cpf_cnpj: row.customer_cpf_cnpj || row.destinatario?.cpf_cnpj || '',
      inscricao_estadual: row.customer_ie || row.destinatario?.inscricao_estadual || '',
      phone: row.customer_phone || row.destinatario?.phone || '',
      email: row.customer_email || row.destinatario?.email || '',
      cep: row.customer_cep || row.destinatario?.cep || '',
      logradouro: row.customer_logradouro || row.destinatario?.logradouro || '',
      numero: row.customer_numero || row.destinatario?.numero || '',
      complemento: row.customer_complemento || row.destinatario?.complemento || '',
      bairro: row.customer_bairro || row.destinatario?.bairro || '',
      municipio: row.customer_municipio || row.destinatario?.municipio || '',
      uf: row.customer_uf || row.destinatario?.uf || '',
    };

    return {
      number: row.numero,
      series: row.serie,
      accessKey: row.chave_acesso,
      protocol: row.protocolo || '',
      status: row.status,
      environment: row.ambiente,
      consultationUrl: row.url_consulta || '',
      customer,
      items,
      payments,
      freight: Number(row.valor_frete) || 0,
      productsTotal: Number(row.valor_produtos) || 0,
      total: Number(row.valor_total) || 0,
    };
  } catch (error) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar NF-e',
    });
  }
});

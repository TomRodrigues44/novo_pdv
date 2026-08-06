import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const notes = await sql`
      SELECT
        n.id AS nfe_id,
        n.sale_id::text AS id,
        n.chave_acesso AS xml_chave,
        n.numero AS xml_numero,
        n.status AS xml_status,
        COALESCE(n.data_autorizacao, n.data_emissao, n.created_at) AS created_at,
        n.valor_total AS total_amount,
        c.name AS customer_name
      FROM nfe n
      LEFT JOIN customers c ON c.id = n.customer_id
      WHERE n.status = 'autorizada'
        AND NULLIF(n.xml_envio, '') IS NOT NULL
      ORDER BY COALESCE(n.data_autorizacao, n.data_emissao, n.created_at) DESC
    `;

    return notes;
  } catch (error) {
    console.error('Error fetching NFe XMLs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar XMLs de NF-e',
    });
  }
});
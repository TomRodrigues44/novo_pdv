import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const notas = await sql`
      SELECT
        n.id AS nfce_id,
        n.sale_id::text AS id,
        COALESCE(NULLIF(n.xml_retorno, ''), n.xml_envio) AS xml_content,
        n.chave_acesso AS xml_chave,
        n.numero AS xml_numero,
        n.status AS xml_status,
        COALESCE(n.data_emissao, n.created_at) AS created_at,
        COALESCE(s.total_amount, 0) AS total_amount,
        c.name AS customer_name
      FROM nfce n
      LEFT JOIN sales s ON s.id::text = n.sale_id::text
      LEFT JOIN customers c ON c.id = s.customer_id
      WHERE n.status = 'autorizada'
        AND COALESCE(NULLIF(n.xml_retorno, ''), NULLIF(n.xml_envio, '')) IS NOT NULL
      ORDER BY COALESCE(n.data_emissao, n.created_at) DESC
    `;

    return notas;
  } catch (error) {
    console.error('Error fetching NFC-e XMLs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar XMLs fiscais',
    });
  }
});

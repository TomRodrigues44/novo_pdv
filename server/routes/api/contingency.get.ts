import { ensureContingencySchema } from '../../lib/nfce/contingency';
import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    await ensureContingencySchema();

    return await sql`
      SELECT
        cn.id,
        cn.sale_id::text AS sale_id,
        cn.reason,
        COALESCE(cn.status, 'pending') AS status,
        COALESCE(cn.attempts, 0) AS attempts,
        cn.last_attempt_at,
        cn.resolved_at,
        cn.created_at,
        cn.updated_at,
        COALESCE(s.total_amount, 0) AS total_amount,
        c.name AS customer_name,
        COALESCE(
          NULLIF((cn.payload->>'numero')::text, '')::integer,
          (regexp_match(cn.xml_content, '<nNF>([0-9]+)</nNF>'))[1]::integer
        ) AS numero
      FROM contingency_notes cn
      LEFT JOIN sales s ON s.id::text = cn.sale_id::text
      LEFT JOIN customers c ON c.id = s.customer_id
      ORDER BY
        CASE WHEN COALESCE(cn.status, 'pending') = 'pending' THEN 0 ELSE 1 END,
        cn.created_at DESC
    `;
  } catch (error) {
    console.error('Error fetching contingency notes:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao carregar notas em contingência',
    });
  }
});

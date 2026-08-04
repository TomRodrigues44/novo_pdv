import { sql } from '../../utils/db';

export async function ensureContingencySchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS contingency_notes (
      id BIGSERIAL PRIMARY KEY,
      sale_id TEXT NOT NULL,
      xml_content TEXT NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      payload JSONB,
      last_attempt_at TIMESTAMP,
      resolved_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS sale_id TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS xml_content TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS reason TEXT`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS payload JSONB`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE contingency_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
}

interface ContingencyInput {
  saleId: string;
  xmlContent: string;
  reason: string;
  payload: Record<string, unknown>;
}

export async function saveContingencyNote(input: ContingencyInput) {
  await ensureContingencySchema();

  const existing = await sql`
    SELECT id
    FROM contingency_notes
    WHERE sale_id::text = ${input.saleId}
      AND COALESCE(status, 'pending') IN ('pending', 'processing')
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE contingency_notes
      SET xml_content = ${input.xmlContent},
          reason = ${input.reason},
          payload = ${JSON.stringify(input.payload)}::jsonb,
          status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }

  const inserted = await sql`
    INSERT INTO contingency_notes (
      sale_id, xml_content, reason, status, attempts, payload, created_at, updated_at
    ) VALUES (
      ${input.saleId}, ${input.xmlContent}, ${input.reason}, 'pending', 0,
      ${JSON.stringify(input.payload)}::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    RETURNING id
  `;

  return inserted[0].id;
}

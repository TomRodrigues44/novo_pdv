import { sql } from '../../utils/db';

export async function ensureCancelPasswordSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS cancel_password (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
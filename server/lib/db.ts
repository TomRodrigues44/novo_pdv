import { neon } from '@neondatabase/serverless';

let _client: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!_client) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is required but not set');
    }
    _client = neon(dbUrl);
  }
  return _client;
}
import { neon } from '@neondatabase/serverless';

let sqlCache: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!sqlCache) {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is required but not set');
    }
    
    sqlCache = neon(dbUrl);
  }
  
  return sqlCache;
}
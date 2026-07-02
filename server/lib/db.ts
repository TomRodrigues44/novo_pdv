import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON')));
  throw new Error('DATABASE_URL is required but not set');
}

console.log('DATABASE_URL is set:', dbUrl.substring(0, 20) + '...');

export const sql = neon(dbUrl);
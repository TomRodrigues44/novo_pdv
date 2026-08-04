import { Pool } from 'pg';

interface SqlClient {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  (): SqlClient;
  query(text: string, values?: any[]): Promise<any[]>;
}

type DatabaseGlobal = typeof globalThis & {
  __pdvPostgresPool?: Pool;
};

const databaseGlobal = globalThis as DatabaseGlobal;

function getConnectionString() {
  const connectionString = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('LOCAL_DATABASE_URL ou DATABASE_URL não está definida');
  }
  return connectionString;
}

function getPool() {
  if (!databaseGlobal.__pdvPostgresPool) {
    const connectionString = getConnectionString();
    databaseGlobal.__pdvPostgresPool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      enableChannelBinding: connectionString.includes('channel_binding=require'),
    });

    databaseGlobal.__pdvPostgresPool.on('error', (error) => {
      console.error('Erro inesperado no pool PostgreSQL:', error);
    });
  }

  return databaseGlobal.__pdvPostgresPool;
}

const executeQuery = async (text: string, values: any[] = []) => {
  const result = await getPool().query(text, values);
  return result.rows;
};

const sqlTag = ((strings?: TemplateStringsArray, ...values: any[]) => {
  if (!strings) {
    return sql;
  }

  let text = strings[0];
  for (let index = 0; index < values.length; index += 1) {
    text += `$${index + 1}${strings[index + 1]}`;
  }

  return executeQuery(text, values);
}) as SqlClient;

sqlTag.query = executeQuery;

export const sql = sqlTag;

export function getDatabaseTarget() {
  const url = new URL(getConnectionString());
  const host = url.hostname;
  return {
    host,
    port: url.port || '5432',
    database: url.pathname.replace(/^\//, ''),
    user: decodeURIComponent(url.username),
    isLocal: host === 'localhost' || host === '127.0.0.1' || host === '::1',
  };
}

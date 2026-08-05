import { Pool } from 'pg';

export interface SqlQueryClient {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
  (): SqlQueryClient;
  query(text: string, values?: any[]): Promise<any[]>;
}

interface SqlClient extends SqlQueryClient {
  transaction<T>(callback: (transaction: SqlQueryClient) => Promise<T>): Promise<T>;
}

type DatabaseGlobal = typeof globalThis & {
  __pdvPostgresPool?: Pool;
};

type QueryExecutor = (text: string, values?: any[]) => Promise<any[]>;

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

function createQueryClient(execute: QueryExecutor): SqlQueryClient {
  let queryClient: SqlQueryClient;

  queryClient = ((strings?: TemplateStringsArray, ...values: any[]) => {
    if (!strings) {
      return queryClient;
    }

    let text = strings[0];
    for (let index = 0; index < values.length; index += 1) {
      text += `$${index + 1}${strings[index + 1]}`;
    }

    return execute(text, values);
  }) as SqlQueryClient;

  queryClient.query = execute;
  return queryClient;
}

const executeQuery: QueryExecutor = async (text, values = []) => {
  const result = await getPool().query(text, values);
  return result.rows;
};

const sqlTag = createQueryClient(executeQuery) as SqlClient;

sqlTag.transaction = async <T>(callback: (transaction: SqlQueryClient) => Promise<T>) => {
  const client = await getPool().connect();
  const transaction = createQueryClient(async (text, values = []) => {
    const result = await client.query(text, values);
    return result.rows;
  });

  try {
    await client.query('BEGIN');
    const result = await callback(transaction);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

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

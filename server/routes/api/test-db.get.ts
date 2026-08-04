import { getDatabaseTarget, sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const target = getDatabaseTarget();
    const result = await sql`
      SELECT
        current_database() AS database,
        current_user AS user,
        version() AS version
    `;

    return {
      success: true,
      message: 'Conexão com PostgreSQL funcionando!',
      connection: {
        mode: target.isLocal ? 'local' : 'remote',
        host: target.host,
        port: target.port,
        database: target.database,
      },
      server: result[0],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao conectar com PostgreSQL',
    };
  }
});

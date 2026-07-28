import { sql } from '../../lib/db';

export default defineEventHandler(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return {
        success: false,
        error: 'DATABASE_URL não está definida',
        env: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON'))
      };
    }

    const result = await sql()`SELECT 1 as test`;
    
    return {
      success: true,
      message: 'Conexão com banco de dados funcionando!',
      testResult: result,
      dbUrlPrefix: dbUrl.substring(0, 20) + '...'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});
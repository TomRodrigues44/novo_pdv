import { sql } from '../../../utils/db';
import { ensureEmailSchema, createTransporter, testEmailConnection } from '../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    await ensureEmailSchema();
    const body = await readBody(event);
    
    const { host, port, user, pass, from_email, to_email, test_connection = false } = body;

    if (!host || !port || !user || !pass || !from_email || !to_email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Preencha todos os campos de configuração de e-mail',
      });
    }

    // Se for para testar a conexão
    if (test_connection) {
      const result = await testEmailConnection({
        host,
        port: parseInt(port),
        user,
        pass,
        from: from_email,
        to: to_email,
      });
      return result;
    }

    // Salvar configuração
    await sql`DELETE FROM email_config WHERE enabled = true`;

    const result = await sql`
      INSERT INTO email_config (id, host, port, user, pass, from_email, to_email, enabled)
      VALUES (${`email-${Date.now()}`}, ${host}, ${parseInt(port)}, ${user}, ${pass}, ${from_email}, ${to_email}, true)
      RETURNING id
    `;

    return { 
      success: true, 
      message: 'Configuração de e-mail salva com sucesso',
      id: result[0].id,
    };
  } catch (error: any) {
    console.error('Error saving email config:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error saving email config',
    });
  }
});
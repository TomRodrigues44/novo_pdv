import { testEmailConnection } from '../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { host, port, user, pass } = body;

    if (!host || !port || !user || !pass) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Preencha host, porta, usuário e senha',
      });
    }

    const result = await testEmailConnection({
      host,
      port: parseInt(port),
      user,
      pass,
      from: user,
      to: user,
    });

    return result;
  } catch (error: any) {
    console.error('Error testing email connection:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error testing email connection',
    });
  }
});
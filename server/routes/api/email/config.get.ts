import { ensureEmailSchema, getEmailConfig } from '../../../lib/email';

export default defineEventHandler(async () => {
  try {
    await ensureEmailSchema();
    const config = await getEmailConfig();
    if (!config) {
      return { configured: false };
    }
    // Não retornar a senha
    return {
      configured: true,
      host: config.host,
      port: config.port,
      user: config.user,
      from: config.from,
      to: config.to,
    };
  } catch (error) {
    console.error('Error fetching email config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching email config',
    });
  }
});
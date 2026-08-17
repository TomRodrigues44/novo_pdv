import { sendCashRegisterCloseEmail } from '../../../lib/email';

export default defineEventHandler(async (event) => {
  try {
    const data = await readBody(event);
    
    // Validar dados obrigatórios
    if (!data || typeof data !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados inválidos',
      });
    }

    // Enviar e-mail
    const result = await sendCashRegisterCloseEmail(data);
    
    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Erro ao enviar e-mail',
      });
    }

    return { 
      success: true, 
      message: 'E-mail enviado com sucesso' 
    };
  } catch (error: any) {
    console.error('Error sending cash register email:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao enviar e-mail',
    });
  }
});
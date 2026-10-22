import { sendCashRegisterCloseEmail } from '../../../lib/email';
import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const data = await readBody(event);

  if (!data || typeof data !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' });
  }

  const cashRegisterId = data.cashRegisterId ? String(data.cashRegisterId) : null;

  try {
    if (cashRegisterId) {
      await sql`
        UPDATE cash_registers
        SET email_attempts = COALESCE(email_attempts, 0) + 1,
            email_last_attempt_at = CURRENT_TIMESTAMP,
            email_last_error = NULL
        WHERE id = ${cashRegisterId}
      `;
    }

    const result = await sendCashRegisterCloseEmail(data);

    if (!result.success) {
      if (cashRegisterId) {
        await sql`
          UPDATE cash_registers
          SET email_status = 'pending',
              email_last_error = ${result.error || 'Erro ao enviar e-mail'}
          WHERE id = ${cashRegisterId}
        `;
      }

      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Erro ao enviar e-mail',
      });
    }

    if (cashRegisterId) {
      await sql`
        UPDATE cash_registers
        SET email_status = 'sent',
            email_sent_at = CURRENT_TIMESTAMP,
            email_last_error = NULL
        WHERE id = ${cashRegisterId}
      `;
    }

    return { success: true, message: 'E-mail enviado com sucesso' };
  } catch (error: any) {
    console.error('Error sending cash register email:', error);

    if (cashRegisterId && !error?.statusCode) {
      try {
        await sql`
          UPDATE cash_registers
          SET email_status = 'pending',
              email_last_error = ${error?.message || 'Erro inesperado ao enviar e-mail'}
          WHERE id = ${cashRegisterId}
        `;
      } catch (dbError) {
        console.error('Erro ao registrar falha de e-mail:', dbError);
      }
    }

    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Erro ao enviar e-mail',
    });
  }
});

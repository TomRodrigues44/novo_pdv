import { createTransporter } from '../../lib/email';

export default defineEventHandler(async () => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Teste" <${process.env.SMTP_FROM || process.env.SMTP_USER || ''}>`,
      to: process.env.CASH_REGISTER_EMAIL_TO || 'tom.santanna@gmail.com',
      subject: '🧪 Teste de Configuração - Empório das Coxinhas',
      html: `
        <h2>Teste de E-mail</h2>
        <p>Se você recebeu este e-mail, a configuração SMTP está funcionando corretamente!</p>
        <p><strong>De:</strong> ${process.env.SMTP_FROM || process.env.SMTP_USER || 'N/A'}</p>
        <p><strong>Para:</strong> ${process.env.CASH_REGISTER_EMAIL_TO || 'N/A'}</p>
        <p><strong>Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</p>
        <p><strong>Porta:</strong> ${process.env.SMTP_PORT || '587'}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Enviado automaticamente pelo sistema PDV</p>
      `,
    });

    return {
      success: true,
      message: 'E-mail de teste enviado com sucesso!',
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('❌ Erro ao testar SMTP:', error);
    
    return {
      success: false,
      error: error.message,
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? ' configurado' : 'NÃO configurado',
        pass: process.env.SMTP_PASS ? 'configurado' : 'NÃO configurado',
        from: process.env.SMTP_FROM || 'NÃO configurado',
      },
    };
  }
});
import { sql } from '../../utils/db';
import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
  try {
    const { closingAmount, notes } = await readBody(event);
    
    // ... existing code from previous step ...
    const { closingAmount: ca, notes: n, salesTotal, cashSales, closingCash, difference, expectedCashAmount } = closeResult;
    
    // Configurar transportador Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outros ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Conteúdo do email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'PDV Empório das Coxinhas <noreply@emporiodascoxinhas.com>',
      to: 'tom.santanna@gmail.com',
      subject: `Relatório de Fechamento de Caixa - ${new Date().toLocaleDateString('pt-BR')}`,
      html: `
        <h2>Relatório de Fechamento de Caixa</h2>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Abertura:</strong> R$ ${salesTotal ? (parseFloat(process.env.opening_amount) || 0).toFixed(2) : '0,00'}</p>
        <p><strong>Total Vendas:</strong> R$ ${salesTotal.toFixed(2)}</p>
        <p><strong>Fechamento Caixa (Calc):</strong> R$ ${closingCash.toFixed(2)}</p>
        <p><strong>Valor Contado:</strong> R$ ${(closingAmount || 0).toFixed(2)}</p>
        <p><strong>Diferença:</strong> R$ ${difference.toFixed(2)} ${difference >= 0 ? 'Sobrou' : 'Faltou'}</p>
        <hr />
        <p><strong>Detalhes:</strong></p>
        <ul>
          <li>Vendas Dinheiro: R$ ${cashSales.toFixed(2)}</li>
          <li>Vendas Débito/Crédito/Pix: ${Object.keys(cashSalesByPayment || {}).map(k => `${k}: R$ ${(cashSalesByPayment[k] || 0).toFixed(2)}`).join('<li>')}</li>
          <li>Sangrias totais: R$ ${(totalSangrias || 0).toFixed(2)}</li>
          <li>Vales totais: R$ ${(voucherTotal || 0).toFixed(2)}</li>
          <li>Adições totais: R$ ${(additionTotal || 0).toFixed(2)}</li>
        </ul>
        <p><small>Este é um relatório automático do sistema PDV Empório das Coxinhas.</small></p>
      `,
      text: `
        Relatório de Fechamento de Caixa
        Data: ${new Date().toLocaleString('pt-BR')}
        Abertura: R$ ${(parseFloat(process.env.opening_amount) || 0).toFixed(2)}
        Total Vendas: R$ ${salesTotal.toFixed(2)}
        Fechamento Caixa (Calc): R$ ${closingCash.toFixed(2)}
        Valor Contado: R$ ${(closingAmount || 0).toFixed(2)}
        Diferença: R$ ${difference.toFixed(2)} ${difference >= 0 ? 'Sobrou' : 'Faltou'}
        Vendas Dinheiro: R$ ${cashSales.toFixed(2)}
        Sangrias totais: R$ ${(totalSangrias || 0).toFixed(2)}
        Vales totais: R$ ${(voucherTotal || 0).toFixed(2)}
        Adições totais: R$ ${(additionTotal || 0).toFixed(2)}
        ---
        Este é um relatório automático do sistema PDV Empório das Coxinhas.
      `,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    return {
      ...closeResult,
      emailSent: true,
      emailMessage: 'Relatório enviado com sucesso para tom.santanna@gmail.com',
    };
  } catch (error: any) {
    console.error('Error sending email report:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error sending email report',
    });
  }
});
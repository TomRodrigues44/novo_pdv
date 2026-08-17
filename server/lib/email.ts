import nodemailer from 'nodemailer';
import { sql } from '../utils/db';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

let transporter: nodemailer.Transporter | null = null;

export async function ensureEmailSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS email_config (
      id TEXT PRIMARY KEY,
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      user TEXT NOT NULL,
      pass TEXT NOT NULL,
      from_email TEXT NOT NULL,
      to_email TEXT NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  await ensureEmailSchema();
  const result = await sql`
    SELECT host, port, user, pass, from_email, to_email
    FROM email_config
    WHERE enabled = true
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (result.length === 0) return null;
  return {
    host: result[0].host,
    port: result[0].port,
    user: result[0].user,
    pass: result[0].pass,
    from: result[0].from_email,
    to: result[0].to_email,
  };
}

export async function createTransporter(config: EmailConfig) {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  return transporter;
}

export async function sendCashRegisterReport(
  register: any,
  closeResult: any,
  htmlContent: string
): Promise<boolean> {
  try {
    const config = await getEmailConfig();
    if (!config || !transporter) {
      console.warn('Configuração de e-mail não encontrada ou transporter não inicializado');
      return false;
    }

    const mailOptions = {
      from: config.from,
      to: config.to,
      subject: `Relatório de Fechamento de Caixa - ${new Date().toLocaleString('pt-BR')}`,
      html: htmlContent,
      text: `Relatório de Fechamento de Caixa\n\nData: ${new Date().toLocaleString('pt-BR')}\n\nAbertura: R$ ${register.opening_amount}\nTotal Vendas: R$ ${closeResult.salesTotal}\nFechamento Caixa (Calc): R$ ${closeResult.closingCash}\nValor Informado (Contado): R$ ${register.closing_amount}\nValor Esperado: R$ ${closeResult.expectedCashAmount}\nDiferença: R$ ${closeResult.difference}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

export async function testEmailConnection(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  try {
    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await testTransporter.verify();
    return { success: true, message: 'Conexão com SMTP bem-sucedida!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Erro ao conectar com SMTP' };
  }
}
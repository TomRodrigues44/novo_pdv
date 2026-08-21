import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

interface CashRegisterReportData {
  openingAmount: number;
  salesTotal: number;
  calculatedClosingCash: number;
  salesByPayment: {
    cash: number;
    debit: number;
    credit: number;
    pix: number;
  };
  totalsByCategory: {
    taxa_entrega: number;
    ifood: number;
    brigadeiros: number;
    outros: number;
  };
  totalSangrias: number;
  vouchers: Array<{ description: string; amount: number }>;
  voucherTotal: number;
  additions: Array<{ description: string; amount: number }>;
  additionTotal: number;
  valorInformado: number;
  expectedAmount: number;
  difference: number;
  closedAt: string;
  notes?: string;
}

function getEmailConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  };
}

function createTransporter() {
  const config = getEmailConfig();
  
  if (!config.user || !config.pass) {
    throw new Error('Configurações de e-mail (SMTP_USER, SMTP_PASS) não definidas');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR');
}

function generateReportHtml(data: CashRegisterReportData): string {
  const {
    openingAmount, salesTotal, calculatedClosingCash, salesByPayment,
    totalsByCategory, totalSangrias, vouchers, voucherTotal,
    additions, additionTotal, valorInformado, expectedAmount, difference,
    closedAt, notes
  } = data;

  const safeNotes = notes?.trim();
  const statusText =
    difference > 0
      ? 'SOBROU DINHEIRO'
      : difference < 0
        ? 'FALTOU DINHEIRO'
        : 'CAIXA FECHOU EXATO';

  const statusColor =
    difference > 0 ? '#15803d' : difference < 0 ? '#b91c1c' : '#111827';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Fechamento de Caixa</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f3f4f6;">
        <tr>
          <td align="center" style="padding:24px 10px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
              style="width:100%;max-width:600px;background:#ffffff;border:1px solid #d1d5db;border-collapse:collapse;">

              <tr>
                <td align="center" style="padding:24px 24px 18px 24px;border-bottom:3px solid #111827;">
                  <div style="font-size:22px;line-height:28px;font-weight:800;color:#111827;">
                    EMPÓRIO DAS COXINHAS
                  </div>
                  <div style="font-size:14px;line-height:20px;font-weight:700;margin-top:6px;">
                    RELATÓRIO DE FECHAMENTO DE CAIXA
                  </div>
                  <div style="font-size:12px;line-height:18px;color:#4b5563;margin-top:6px;">
                    ${formatDateTime(closedAt)}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">
                    RESUMO DO CAIXA
                  </div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    <tr><td style="padding:4px 0;">Abertura</td><td align="right" style="padding:4px 0;font-weight:700;">${formatCurrency(openingAmount)}</td></tr>
                    <tr><td style="padding:4px 0;">Total de Vendas</td><td align="right" style="padding:4px 0;font-weight:700;">${formatCurrency(salesTotal)}</td></tr>
                    <tr><td style="padding:6px 0;font-weight:800;">Fechamento Calculado</td><td align="right" style="padding:6px 0;font-weight:800;">${formatCurrency(calculatedClosingCash)}</td></tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:18px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">
                    FORMAS DE PAGAMENTO
                  </div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    <tr><td style="padding:4px 0;">Dinheiro</td><td align="right" style="padding:4px 0;">${formatCurrency(salesByPayment.cash)}</td></tr>
                    <tr><td style="padding:4px 0;">Débito</td><td align="right" style="padding:4px 0;">${formatCurrency(salesByPayment.debit)}</td></tr>
                    <tr><td style="padding:4px 0;">Crédito</td><td align="right" style="padding:4px 0;">${formatCurrency(salesByPayment.credit)}</td></tr>
                    <tr><td style="padding:4px 0;">PIX</td><td align="right" style="padding:4px 0;">${formatCurrency(salesByPayment.pix)}</td></tr>
                    <tr>
                      <td style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">TOTAL VENDAS</td>
                      <td align="right" style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">${formatCurrency(salesTotal)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${totalSangrias > 0 ? `
              <tr>
                <td style="padding:18px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">SANGRIAS</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    ${totalsByCategory.taxa_entrega > 0 ? `<tr><td style="padding:4px 0;">Deliverys</td><td align="right" style="padding:4px 0;">-${formatCurrency(totalsByCategory.taxa_entrega)}</td></tr>` : ''}
                    ${totalsByCategory.ifood > 0 ? `<tr><td style="padding:4px 0;">iFood</td><td align="right" style="padding:4px 0;">-${formatCurrency(totalsByCategory.ifood)}</td></tr>` : ''}
                    ${totalsByCategory.brigadeiros > 0 ? `<tr><td style="padding:4px 0;">Brigadeiros</td><td align="right" style="padding:4px 0;">-${formatCurrency(totalsByCategory.brigadeiros)}</td></tr>` : ''}
                    ${totalsByCategory.outros > 0 ? `<tr><td style="padding:4px 0;">Outros</td><td align="right" style="padding:4px 0;">-${formatCurrency(totalsByCategory.outros)}</td></tr>` : ''}
                    <tr>
                      <td style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">TOTAL SANGRIAS</td>
                      <td align="right" style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">-${formatCurrency(totalSangrias)}</td>
                    </tr>
                  </table>
                </td>
              </tr>` : ''}

              ${voucherTotal > 0 ? `
              <tr>
                <td style="padding:18px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">VALES</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    ${vouchers.map(v => `<tr><td style="padding:4px 0;">${v.description || 'Sem descrição'}</td><td align="right" style="padding:4px 0;">-${formatCurrency(v.amount)}</td></tr>`).join('')}
                    <tr>
                      <td style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">TOTAL VALES</td>
                      <td align="right" style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">-${formatCurrency(voucherTotal)}</td>
                    </tr>
                  </table>
                </td>
              </tr>` : ''}

              ${additionTotal > 0 ? `
              <tr>
                <td style="padding:18px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">ADIÇÕES</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    ${additions.map(a => `<tr><td style="padding:4px 0;">${a.description || 'Sem descrição'}</td><td align="right" style="padding:4px 0;">+${formatCurrency(a.amount)}</td></tr>`).join('')}
                    <tr>
                      <td style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">TOTAL ADIÇÕES</td>
                      <td align="right" style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">+${formatCurrency(additionTotal)}</td>
                    </tr>
                  </table>
                </td>
              </tr>` : ''}

              <tr>
                <td style="padding:20px 24px 0 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">CONFERÊNCIA DO CAIXA</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    <tr><td style="padding:4px 0;">Valor contado</td><td align="right" style="padding:4px 0;font-weight:700;">${formatCurrency(valorInformado)}</td></tr>
                    <tr><td style="padding:4px 0;">Valor esperado</td><td align="right" style="padding:4px 0;font-weight:700;">${formatCurrency(expectedAmount)}</td></tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:16px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                    style="border-collapse:collapse;border-top:3px solid #111827;border-bottom:3px solid #111827;">
                    <tr>
                      <td align="center" style="padding:12px 8px 3px 8px;font-size:12px;font-weight:800;">DIFERENÇA DO CAIXA</td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:2px 8px;font-size:22px;line-height:28px;font-weight:900;color:${statusColor};">
                        ${formatCurrency(difference)}
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:3px 8px 12px 8px;font-size:13px;font-weight:900;color:${statusColor};">
                        ${statusText}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${safeNotes ? `
              <tr>
                <td style="padding:4px 24px 16px 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">OBSERVAÇÕES</div>
                  <div style="font-size:13px;line-height:19px;white-space:pre-wrap;">${safeNotes}</div>
                </td>
              </tr>` : ''}

              <tr>
                <td align="center" style="padding:20px 24px 24px 24px;border-top:2px dashed #111827;">
                  <div style="font-size:11px;font-weight:700;">*** OBRIGADO PELA PREFERÊNCIA ***</div>
                  <div style="font-size:12px;font-weight:800;margin-top:8px;">EMPÓRIO DAS COXINHAS</div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendCashRegisterCloseEmail(data: CashRegisterReportData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    
    const toEmail = process.env.CASH_REGISTER_EMAIL_TO || 'tom.santanna@gmail.com';
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || '';
    
    if (!fromEmail) {
      throw new Error('E-mail remetente (SMTP_FROM ou SMTP_USER) não configurado');
    }

    const html = generateReportHtml(data);
    
    const subject = `📊 Fechamento de Caixa - Loja 1 - Aparecida - ${formatDateTime(data.closedAt)}`;

    await transporter.sendMail({
      from: `"Empório das Coxinhas" <${fromEmail}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ E-mail de fechamento de caixa enviado para ${toEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail de fechamento:', error);
    return { success: false, error: error.message };
  }
}
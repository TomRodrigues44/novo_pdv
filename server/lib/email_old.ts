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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; color: #e67e22; }
        .header p { margin: 5px 0; font-size: 11px; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; font-size: 12px; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 11px; }
        .row.bold { font-weight: bold; }
        .row.green { color: #27ae60; }
        .row.red { color: #e74c3c; }
        .row.blue { color: #3498db; }
        .row.orange { color: #e67e22; }
        .row.amber { color: #f39c12; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .footer { text-align: center; font-size: 10px; color: #999; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; }
        .sub-row { margin-left: 15px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EMPÓRIO DAS COXINHAS</h1>
          <p>Relatório de Fechamento de Caixa</p>
          <p>${formatDateTime(closedAt)}</p>
        </div>

        <div class="section">
          <div class="section-title">RESUMO</div>
          <div class="row"><span>Abertura:</span><span>${formatCurrency(openingAmount)}</span></div>
          <div class="row"><span>Total Vendas:</span><span class="green">${formatCurrency(salesTotal)}</span></div>
          <div class="row bold"><span>Fechamento Caixa (Calc):</span><span class="blue">${formatCurrency(calculatedClosingCash)}</span></div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">VENDAS POR FORMA</div>
          <div class="row"><span>Dinheiro:</span><span class="green">${formatCurrency(salesByPayment.cash)}</span></div>
          <div class="row"><span>Débito:</span><span class="blue">${formatCurrency(salesByPayment.debit)}</span></div>
          <div class="row"><span>Crédito:</span><span class="purple">${formatCurrency(salesByPayment.credit)}</span></div>
          <div class="row"><span>Pix:</span><span class="teal">${formatCurrency(salesByPayment.pix)}</span></div>
        </div>

        <div class="divider"></div>

        ${totalSangrias > 0 ? `
        <div class="section">
          <div class="section-title">SANGRIAS: ${formatCurrency(totalSangrias)}</div>
          ${totalsByCategory.taxa_entrega > 0 ? `<div class="row sub-row"><span>Deliverys:</span><span class="orange">-${formatCurrency(totalsByCategory.taxa_entrega)}</span></div>` : ''}
          ${totalsByCategory.ifood > 0 ? `<div class="row sub-row"><span>Ifood:</span><span class="red">-${formatCurrency(totalsByCategory.ifood)}</span></div>` : ''}
          ${totalsByCategory.brigadeiros > 0 ? `<div class="row sub-row"><span>Brigadeiros:</span><span class="amber">-${formatCurrency(totalsByCategory.brigadeiros)}</span></div>` : ''}
          ${totalsByCategory.outros > 0 ? `<div class="row sub-row"><span>Outros:</span><span>-${formatCurrency(totalsByCategory.outros)}</span></div>` : ''}
        </div>
        <div class="divider"></div>
        ` : ''}

        ${voucherTotal > 0 ? `
        <div class="section">
          <div class="section-title">VALES: ${formatCurrency(voucherTotal)}</div>
          ${vouchers.map(v => `<div class="row sub-row"><span>${v.description}:</span><span class="amber">-${formatCurrency(v.amount)}</span></div>`).join('')}
        </div>
        <div class="divider"></div>
        ` : ''}

        ${additionTotal > 0 ? `
        <div class="section">
          <div class="section-title">ADIÇÕES: ${formatCurrency(additionTotal)}</div>
          ${additions.map(a => `<div class="row sub-row"><span>${a.description}:</span><span class="green">+${formatCurrency(a.amount)}</span></div>`).join('')}
        </div>
        <div class="divider"></div>
        ` : ''}

        <div class="section">
          <div class="section-title">CONFERÊNCIA</div>
          <div class="row"><span>Valor Informado (Contado):</span><span class="bold">${formatCurrency(valorInformado)}</span></div>
          <div class="row"><span>Valor Esperado:</span><span>${formatCurrency(expectedAmount)}</span></div>
          <div class="row bold ${difference >= 0 ? 'green' : 'red'}"><span>DIFERENÇA:</span><span>${formatCurrency(difference)}</span></div>
          <div class="row" style="font-size: 10px; color: ${difference > 0 ? '#27ae60' : difference < 0 ? '#e74c3c' : '#3498db'};">
            <span></span>
            <span>${difference > 0 ? 'Sobrou dinheiro' : difference < 0 ? 'Faltou dinheiro' : 'Caixa fechou exato'}</span>
          </div>
        </div>

        ${notes ? `
        <div class="divider"></div>
        <div class="section">
          <div class="section-title">OBSERVAÇÕES</div>
          <p style="font-size: 11px; white-space: pre-wrap;">${notes}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
          <p>Empório das Coxinhas</p>
          <p>Enviado automaticamente em ${formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
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
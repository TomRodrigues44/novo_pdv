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
  identificacaoLoja?: string;
  motoboys?: Array<{
    name: string;
    delivery: number;
    ifood: number;
    total: number;
    deliveryCount: number;
    ifoodCount: number;
    totalCount: number;
  }>;
  changeNeeded?: boolean;
  changeCounts?: Record<string | number, number>;
  changeTotal?: number;
  envelopeTotal?: number;
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

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateReportHtml(data: CashRegisterReportData): string {
  const {
    openingAmount, salesTotal, calculatedClosingCash, salesByPayment,
    totalsByCategory, totalSangrias, vouchers, voucherTotal,
    additions, additionTotal, valorInformado, expectedAmount, difference,
    closedAt, notes, identificacaoLoja, motoboys = [],
    changeNeeded = false, changeCounts = {}, changeTotal = 0,
    envelopeTotal = 0
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

  const denominations = [1, 2, 5, 10, 20, 50];
  const changeItems = denominations
    .map(denomination => ({
      denomination,
      quantity: Number(changeCounts?.[denomination] ?? changeCounts?.[String(denomination)] ?? 0),
    }))
    .filter(item => item.quantity > 0);

  const brigadeiroTotal = Number(totalsByCategory.brigadeiros || 0);

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
                  ${identificacaoLoja ? `
                  <div style="font-size:13px;line-height:19px;font-weight:800;margin-top:4px;">
                    ${escapeHtml(identificacaoLoja)}
                  </div>` : ''}
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
                    ${motoboys.map(m => `
                      ${m.delivery > 0 ? `<tr><td style="padding:4px 0;">(${m.deliveryCount}) Taxas ${escapeHtml(m.name)}</td><td align="right" style="padding:4px 0;">-${formatCurrency(m.delivery)}</td></tr>` : ''}
                      ${m.ifood > 0 ? `<tr><td style="padding:4px 0;">(${m.ifoodCount}) iFood ${escapeHtml(m.name)}</td><td align="right" style="padding:4px 0;">-${formatCurrency(m.ifood)}</td></tr>` : ''}
                      <tr><td style="padding:5px 0;font-weight:800;">(${m.totalCount}) Total Tx ${escapeHtml(m.name)}</td><td align="right" style="padding:5px 0;font-weight:800;">-${formatCurrency(m.total)}</td></tr>
                    `).join('')}
                    ${brigadeiroTotal > 0 ? `<tr><td style="padding:4px 0;">Brigadeiros Renata</td><td align="right" style="padding:4px 0;">-${formatCurrency(brigadeiroTotal)}</td></tr>` : ''}
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
                    ${vouchers.map(v => `<tr><td style="padding:4px 0;">${escapeHtml(v.description || 'Sem descrição')}</td><td align="right" style="padding:4px 0;">-${formatCurrency(v.amount)}</td></tr>`).join('')}
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
                    ${additions.map(a => `<tr><td style="padding:4px 0;">${escapeHtml(a.description || 'Sem descrição')}</td><td align="right" style="padding:4px 0;">+${formatCurrency(a.amount)}</td></tr>`).join('')}
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

              <tr>
                <td style="padding:4px 24px 18px 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">CONFERÊNCIA DO ENVELOPE</div>

                  ${motoboys.length > 0 ? `
                    <div style="font-size:12px;font-weight:800;margin:10px 0 5px 0;">TAXAS MOTOBOYS</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                      ${motoboys.map(m => `<tr><td style="padding:4px 0;">(${m.totalCount}) Total Tx ${escapeHtml(m.name)}</td><td align="right" style="padding:4px 0;font-weight:700;">${formatCurrency(m.total)}</td></tr>`).join('')}
                    </table>
                  ` : ''}

                  <div style="font-size:12px;font-weight:800;margin:12px 0 5px 0;">DINHEIRO TROCADO</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    <tr><td style="padding:4px 0;">Situação</td><td align="right" style="padding:4px 0;font-weight:800;">${changeNeeded ? 'NECESSÁRIO' : 'NÃO NECESSÁRIO'}</td></tr>
                    ${changeNeeded ? changeItems.map(item => `
                      <tr>
                        <td style="padding:4px 0;">${String(item.quantity).padStart(2, '0')} ${item.denomination === 1 ? 'moeda' : 'nota'}${item.quantity > 1 ? 's' : ''} de R$ ${item.denomination.toFixed(2).replace('.', ',')}</td>
                        <td align="right" style="padding:4px 0;">${formatCurrency(item.quantity * item.denomination)}</td>
                      </tr>
                    `).join('') : ''}
                    <tr><td style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">TOTAL TROCADO</td><td align="right" style="padding:7px 0;border-top:1px dashed #6b7280;font-weight:800;">${formatCurrency(changeTotal)}</td></tr>
                  </table>

                  <div style="font-size:12px;font-weight:800;margin:12px 0 5px 0;">DINHEIRO DO ENVELOPE</div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
                    <tr><td style="padding:4px 0;">Dinheiro das vendas</td><td align="right" style="padding:4px 0;">${formatCurrency(salesByPayment.cash)}</td></tr>
                    <tr><td style="padding:4px 0;">+ Trocado solicitado</td><td align="right" style="padding:4px 0;">${formatCurrency(changeTotal)}</td></tr>
                    <tr><td style="padding:4px 0;">+ Adições</td><td align="right" style="padding:4px 0;">${formatCurrency(additionTotal)}</td></tr>
                    <tr><td style="padding:4px 0;">- Brigadeiros</td><td align="right" style="padding:4px 0;">${formatCurrency(brigadeiroTotal)}</td></tr>
                    <tr><td style="padding:4px 0;">- Vales</td><td align="right" style="padding:4px 0;">${formatCurrency(voucherTotal)}</td></tr>
                    <tr><td style="padding:4px 0;">${difference >= 0 ? '+' : '-'} Resultado conferência</td><td align="right" style="padding:4px 0;">${formatCurrency(Math.abs(difference))}</td></tr>
                    <tr><td style="padding:8px 0;border-top:2px solid #111827;font-weight:900;">TOTAL DO ENVELOPE</td><td align="right" style="padding:8px 0;border-top:2px solid #111827;font-weight:900;">${formatCurrency(envelopeTotal)}</td></tr>
                  </table>
                </td>
              </tr>

              ${safeNotes ? `
              <tr>
                <td style="padding:4px 24px 16px 24px;">
                  <div style="font-size:13px;font-weight:800;border-bottom:1px solid #111827;padding-bottom:6px;margin-bottom:8px;">OBSERVAÇÕES</div>
                  <div style="font-size:13px;line-height:19px;white-space:pre-wrap;">${escapeHtml(safeNotes)}</div>
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

    // O e-mail usa o renderizador próprio, feito com tabelas e estilos inline.
    // Os valores vêm do mesmo fechamento usado pela impressão.
    const html = generateReportHtml(data);

    const subject = `📊 Fechamento de Caixa${data.identificacaoLoja ? ` - ${data.identificacaoLoja}` : ''} - ${formatDateTime(data.closedAt)}`;

    const retryDelays = [0, 2000, 5000];
    let lastError: any = null;

    for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
      const delay = retryDelays[attempt];
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        await transporter.sendMail({
          from: `"Empório das Coxinhas" <${fromEmail}>`,
          to: toEmail,
          subject,
          html,
        });

        console.log(`✅ E-mail de fechamento de caixa enviado para ${toEmail} (tentativa ${attempt + 1})`);
        return { success: true };
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Tentativa ${attempt + 1}/3 de envio falhou:`, error?.message || error);
      }
    }

    throw lastError || new Error('Falha ao enviar e-mail após 3 tentativas');
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail de fechamento:', error);
    return { success: false, error: error.message };
  }
}
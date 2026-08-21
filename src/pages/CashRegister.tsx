import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, Plus, Lock, Unlock, Minus, CreditCard, QrCode, Banknote, Printer, Receipt, Bike, Utensils, Smartphone, Mail } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CashRegister = () => {
  const queryClient = useQueryClient();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isCloseSuccessDialogOpen, setIsCloseSuccessDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isAdditionDialogOpen, setIsAdditionDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [finalClosingAmount, setFinalClosingAmount] = useState(0);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionCategory, setTransactionCategory] = useState('ifood');
  const [notes, setNotes] = useState('');
  const [closeResult, setCloseResult] = useState<any>(null);
  const [closedRegisterData, setClosedRegisterData] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const { data: cashData, isLoading, refetch } = useQuery({
    queryKey: ['cash-register'],
    queryFn: async () => {
      const response = await fetch('/api/cash-register');
      if (!response.ok) throw new Error('Failed to fetch cash register');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const currentRegister = cashData?.current;
  const history = cashData?.history || [];

  useEffect(() => {
    if (!currentRegister) {
      setTimeElapsed(0);
      return;
    }

    const calculateTimeElapsed = () => {
      const opened = new Date(currentRegister.opened_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - opened.getTime()) / 1000 / 60);
      setTimeElapsed(Math.max(0, diffInMinutes));
    };

    calculateTimeElapsed();

    const interval = setInterval(() => {
      calculateTimeElapsed();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRegister]);

  const getCategoryFromDescription = (desc: string | null | undefined) => {
    if (!desc) return 'outros';
    if (desc.startsWith('Taxa Entrega')) return 'taxa_entrega';
    if (desc.startsWith('iFood')) return 'ifood';
    if (desc.startsWith('Brigadeiros')) return 'brigadeiros';
    return 'outros';
  };

  const getCleanDescription = (desc: string | null | undefined) => {
    if (!desc) return 'Sem descrição';
    if (desc.startsWith('Taxa Entrega: ')) return desc.replace('Taxa Entrega: ', '');
    if (desc.startsWith('iFood: ')) return desc.replace('iFood: ', '');
    if (desc.startsWith('Brigadeiros: ')) return desc.replace('Brigadeiros: ', '');
    return desc;
  };

  const calculateTotalsByCategory = (transactions: any[]) => {
    const withdrawals = transactions?.filter((t: any) => t.type === 'withdrawal') || [];
    return withdrawals.reduce((acc: any, t: any) => {
      const cat = getCategoryFromDescription(t.description);
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
      return acc;
    }, { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 });
  };

  const totalsByCategory = calculateTotalsByCategory(currentRegister?.transactions || []);

  const handleOpenRegister = async () => {
    try {
      const response = await fetch('/api/cash-register/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingAmount: parseFloat(openingAmount) || 0,
          notes,
        }),
      });

      if (response.ok) {
        toast.success('Caixa aberto com sucesso!');
        setIsOpenDialogOpen(false);
        setOpeningAmount('');
        setNotes('');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao abrir caixa');
      }
    } catch (error) {
      toast.error('Erro ao abrir caixa');
    }
  };

  const handleCloseRegister = async () => {
      // Abre a janela no clique do usuário para evitar bloqueio de pop-up após o await.
      const printWindow = window.open('', '_blank', 'width=420,height=700');

      try {
        const amount = parseFloat(closingAmount) || 0;
        const closingNotes = notes;
        setFinalClosingAmount(amount);
        setClosedRegisterData(currentRegister);
  
        const response = await fetch('/api/cash-register/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            closingAmount: amount,
            notes,
            salesByPayment: currentRegister?.salesByPayment || {
              cash: 0,
              debit: 0,
              credit: 0,
              pix: 0
            }
          }),
        });
  
        if (response.ok) {
          const result = await response.json();

          // Monta o registro fechado preservando os dados que já estavam carregados
          // e priorizando os valores devolvidos pela API de fechamento.
          const apiRegister = result?.register || result?.cashRegister || result || {};
          const closedRegister = {
            ...currentRegister,
            ...apiRegister,
            opening_amount: apiRegister.opening_amount ?? currentRegister?.opening_amount,
            closing_amount: apiRegister.closing_amount ?? amount,
            expected_amount: apiRegister.expected_amount ?? result?.expectedAmount ?? currentRegister?.expected_amount,
            difference: apiRegister.difference ?? result?.difference,
            closed_at: apiRegister.closed_at ?? result?.closedAt ?? new Date().toISOString(),
            salesByPayment: apiRegister.salesByPayment ?? currentRegister?.salesByPayment,
            transactions: apiRegister.transactions ?? currentRegister?.transactions ?? [],
            notes: apiRegister.notes ?? closingNotes,
          };

          setCloseResult(result);
          setClosedRegisterData(closedRegister);
          setIsCloseSuccessDialogOpen(true);
          setIsCloseDialogOpen(false);

          // Gera imediatamente o MESMO relatório usado no Histórico de Fechamentos.
          const reportHtml = handlePrintHistorical(closedRegister, printWindow);

          // Mantém o envio já existente, acrescentando o HTML padronizado do relatório.
          // O endpoint pode usar reportHtml/html como corpo do e-mail.
          await handleSendEmail(closedRegister, reportHtml);

          setClosingAmount('');
          setNotes('');
          refetch();
        } else {
          if (printWindow && !printWindow.closed) printWindow.close();
          const error = await response.json();
          toast.error(error.statusMessage || 'Erro ao fechar caixa');
        }
      } catch (error) {
        if (printWindow && !printWindow.closed) printWindow.close();
        toast.error('Erro ao fechar caixa');
      }
    };

  const handleTransaction = async (type: 'withdrawal' | 'addition' | 'voucher') => {
    try {
      let finalDescription = transactionDescription;
      
      if (type === 'withdrawal') {
        const categoryPrefix = {
          taxa_entrega: 'Taxa Entrega',
          ifood: 'iFood',
          brigadeiros: 'Brigadeiros',
          outros: 'Outros'
        }[transactionCategory];
        
        finalDescription = transactionCategory === 'outros' 
          ? transactionDescription 
          : `${categoryPrefix}: ${transactionDescription}`;
      }

      const response = await fetch('/api/cash-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(transactionAmount) || 0,
          description: finalDescription,
        }),
      });

      if (response.ok) {
        const typeName = type === 'withdrawal' ? 'Sangria' : type === 'addition' ? 'Adição' : 'Vale';
        toast.success(`${typeName} registrada com sucesso!`);
        
        if (type === 'withdrawal') {
          setIsWithdrawalDialogOpen(false);
        } else if (type === 'addition') {
          setIsAdditionDialogOpen(false);
        } else {
          setIsVoucherDialogOpen(false);
        }
        
        setTransactionAmount('');
        setTransactionDescription('');
        setTransactionCategory('ifood');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao registrar transação');
      }
    } catch (error) {
      toast.error('Erro ao registrar transação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintHistorical = (register: any, existingPrintWindow?: Window | null) => {
    const printWindow = existingPrintWindow || window.open('', '_blank', 'width=420,height=700');
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão. Verifique se o navegador está bloqueando pop-ups.');
      return '';
    }

    const openingAmount = parseFloat(register.opening_amount || 0);
    const cashSales = Number(register.salesByPayment?.cash || 0);
    const debitSales = Number(register.salesByPayment?.debit || 0);
    const creditSales = Number(register.salesByPayment?.credit || 0);
    const pixSales = Number(register.salesByPayment?.pix || 0);
    const salesTotal = cashSales + debitSales + creditSales + pixSales;

    const calculateHistoricalTotalsByCategory = (transactions: any[]) => {
      const withdrawals = transactions?.filter((t: any) => t.type === 'withdrawal') || [];
      return withdrawals.reduce((acc: any, t: any) => {
        const desc = t.description || '';
        let cat = 'outros';
        if (desc.startsWith('Taxa Entrega')) cat = 'taxa_entrega';
        else if (desc.startsWith('iFood')) cat = 'ifood';
        else if (desc.startsWith('Brigadeiros')) cat = 'brigadeiros';

        acc[cat] = (acc[cat] || 0) + parseFloat(t.amount || 0);
        return acc;
      }, { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 });
    };

    const historicalTotals = calculateHistoricalTotalsByCategory(register.transactions || []);
    const totalSangrias = historicalTotals.taxa_entrega + historicalTotals.ifood + historicalTotals.brigadeiros + historicalTotals.outros;

    const vouchers = register.transactions?.filter((t: any) => t.type === 'voucher') || [];
    const additions = register.transactions?.filter((t: any) => t.type === 'addition') || [];
    const voucherTotal = vouchers.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
    const additionTotal = additions.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    // Mantém a mesma regra já utilizada pelo sistema para este campo.
    const calculatedClosingCash = salesTotal - totalSangrias;
    const valorInformado = parseFloat(register.closing_amount || 0);

    // Valor Esperado = (Abertura + Dinheiro + Adições) - (Total Sangrias + Total Vales)
    const expectedAmount = register.expected_amount !== undefined && register.expected_amount !== null
      ? parseFloat(register.expected_amount)
      : openingAmount + cashSales + additionTotal - totalSangrias - voucherTotal;

    const difference = valorInformado - expectedAmount;
    const differenceStatus = difference > 0
      ? 'SOBROU DINHEIRO'
      : difference < 0
        ? 'FALTOU DINHEIRO'
        : 'CAIXA FECHOU EXATO';

    const formatReceiptCurrency = (value: number, showSign = false) => {
      const numericValue = Number(value || 0);
      const formatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.abs(numericValue));

      if (!showSign || numericValue === 0) return `R$ ${formatted}`;
      return `${numericValue > 0 ? '+' : '-'} R$ ${formatted}`;
    };

    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Usa a data/hora REAL do fechamento, e não a data da reimpressão.
    const closedAt = register.closed_at ? new Date(register.closed_at) : new Date();
    const closedDate = closedAt.toLocaleDateString('pt-BR');
    const closedTime = closedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fechamento de Caixa - ${escapeHtml(closedDate)}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 80mm;
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.28;
          }

          .receipt {
            width: 72mm;
            margin: 0 auto;
            padding: 3mm 0 5mm;
            color: #000;
          }

          .header {
            text-align: center;
          }

          .company {
            margin: 0;
            font-size: 17px;
            line-height: 1.1;
            font-weight: 900;
            letter-spacing: .2px;
          }

          .document-title {
            margin: 2px 0 5px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .date-row,
          .row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 8px;
          }

          .date-row {
            font-size: 11px;
            font-weight: 700;
          }

          .separator {
            border: 0;
            border-top: 1.5px dashed #000;
            margin: 7px 0;
          }

          .separator.strong {
            border-top: 2px solid #000;
          }

          .section {
            margin: 0;
          }

          .section-title {
            margin: 0 0 4px;
            font-size: 12px;
            line-height: 1.2;
            font-weight: 900;
            text-transform: uppercase;
          }

          .row {
            margin: 2px 0;
          }

          .label {
            flex: 1 1 auto;
            min-width: 0;
            overflow-wrap: anywhere;
          }

          .value {
            flex: 0 0 auto;
            min-width: 24mm;
            text-align: right;
            white-space: nowrap;
            font-variant-numeric: tabular-nums;
            font-weight: 700;
          }

          .detail {
            font-size: 11px;
            font-weight: 600;
          }

          .total-row {
            margin-top: 5px;
            padding-top: 4px;
            border-top: 1px dashed #000;
            font-weight: 900;
          }

          .total-row .label,
          .total-row .value {
            font-weight: 900;
          }

          .conference-title {
            text-align: center;
            font-size: 13px;
            font-weight: 900;
            margin-bottom: 5px;
          }

          .difference-box {
            margin: 8px 0 0;
            padding: 7px 2px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            text-align: center;
          }

          .difference-label {
            font-size: 12px;
            font-weight: 900;
          }

          .difference-value {
            margin: 2px 0;
            font-size: 20px;
            line-height: 1.15;
            font-weight: 900;
            letter-spacing: .3px;
          }

          .difference-status {
            font-size: 13px;
            font-weight: 900;
          }

          .notes {
            margin-top: 7px;
            padding-top: 5px;
            border-top: 1px dashed #000;
            font-size: 10.5px;
            font-weight: 600;
          }

          .footer {
            margin-top: 12px;
            text-align: center;
          }

          .thanks {
            font-size: 11px;
            font-weight: 800;
          }

          .footer-company {
            margin-top: 3px;
            font-size: 12px;
            font-weight: 900;
          }

          @media print {
            html, body {
              width: 80mm !important;
              min-width: 80mm !important;
              max-width: 80mm !important;
            }

            .receipt {
              width: 72mm !important;
            }
          }
        </style>
      </head>
      <body>
        <main class="receipt">
          <header class="header">
            <h1 class="company">EMPÓRIO DAS COXINHAS</h1>
            <div class="document-title">Relatório de Fechamento de Caixa</div>
          </header>

          <div class="date-row">
            <span>${escapeHtml(closedDate)}</span>
            <span>${escapeHtml(closedTime)}</span>
          </div>

          <hr class="separator strong" />

          <section class="section">
            <h2 class="section-title">Resumo do Caixa</h2>
            <div class="row"><span class="label">Abertura</span><span class="value">${formatReceiptCurrency(openingAmount)}</span></div>
            <div class="row"><span class="label">Total de Vendas</span><span class="value">${formatReceiptCurrency(salesTotal)}</span></div>
            <div class="row"><span class="label">Fechamento Calculado</span><span class="value">${formatReceiptCurrency(calculatedClosingCash)}</span></div>
          </section>

          <hr class="separator" />

          <section class="section">
            <h2 class="section-title">Formas de Pagamento</h2>
            <div class="row detail"><span class="label">Dinheiro</span><span class="value">${formatReceiptCurrency(cashSales)}</span></div>
            <div class="row detail"><span class="label">Débito</span><span class="value">${formatReceiptCurrency(debitSales)}</span></div>
            <div class="row detail"><span class="label">Crédito</span><span class="value">${formatReceiptCurrency(creditSales)}</span></div>
            <div class="row detail"><span class="label">PIX</span><span class="value">${formatReceiptCurrency(pixSales)}</span></div>
            <div class="row total-row"><span class="label">TOTAL VENDAS</span><span class="value">${formatReceiptCurrency(salesTotal)}</span></div>
          </section>

          ${totalSangrias > 0 ? `
          <hr class="separator" />
          <section class="section">
            <h2 class="section-title">Sangrias</h2>
            ${historicalTotals.taxa_entrega > 0 ? `<div class="row detail"><span class="label">Deliverys</span><span class="value">${formatReceiptCurrency(-historicalTotals.taxa_entrega, true)}</span></div>` : ''}
            ${historicalTotals.ifood > 0 ? `<div class="row detail"><span class="label">iFood</span><span class="value">${formatReceiptCurrency(-historicalTotals.ifood, true)}</span></div>` : ''}
            ${historicalTotals.brigadeiros > 0 ? `<div class="row detail"><span class="label">Brigadeiros</span><span class="value">${formatReceiptCurrency(-historicalTotals.brigadeiros, true)}</span></div>` : ''}
            ${historicalTotals.outros > 0 ? `<div class="row detail"><span class="label">Outros</span><span class="value">${formatReceiptCurrency(-historicalTotals.outros, true)}</span></div>` : ''}
            <div class="row total-row"><span class="label">TOTAL SANGRIAS</span><span class="value">${formatReceiptCurrency(-totalSangrias, true)}</span></div>
          </section>` : ''}

          ${vouchers.length > 0 ? `
          <hr class="separator" />
          <section class="section">
            <h2 class="section-title">Vales</h2>
            ${vouchers.map((v: any) => `
              <div class="row detail">
                <span class="label">${escapeHtml(v.description || 'Sem descrição')}</span>
                <span class="value">${formatReceiptCurrency(-parseFloat(v.amount || 0), true)}</span>
              </div>
            `).join('')}
            <div class="row total-row"><span class="label">TOTAL VALES</span><span class="value">${formatReceiptCurrency(-voucherTotal, true)}</span></div>
          </section>` : ''}

          ${additions.length > 0 ? `
          <hr class="separator" />
          <section class="section">
            <h2 class="section-title">Adições</h2>
            ${additions.map((a: any) => `
              <div class="row detail">
                <span class="label">${escapeHtml(a.description || 'Sem descrição')}</span>
                <span class="value">${formatReceiptCurrency(parseFloat(a.amount || 0), true)}</span>
              </div>
            `).join('')}
            <div class="row total-row"><span class="label">TOTAL ADIÇÕES</span><span class="value">${formatReceiptCurrency(additionTotal, true)}</span></div>
          </section>` : ''}

          <hr class="separator strong" />

          <section class="section">
            <div class="conference-title">CONFERÊNCIA DO CAIXA</div>
            <div class="row"><span class="label">Valor contado</span><span class="value">${formatReceiptCurrency(valorInformado)}</span></div>
            <div class="row"><span class="label">Valor esperado</span><span class="value">${formatReceiptCurrency(expectedAmount)}</span></div>

            <div class="difference-box">
              <div class="difference-label">DIFERENÇA</div>
              <div class="difference-value">${formatReceiptCurrency(difference, true)}</div>
              <div class="difference-status">${differenceStatus}</div>
            </div>
          </section>

          ${register.notes ? `
            <div class="notes"><strong>OBSERVAÇÕES:</strong> ${escapeHtml(register.notes)}</div>
          ` : ''}

          <footer class="footer">
            <div class="thanks">*** OBRIGADO PELA PREFERÊNCIA ***</div>
            <div class="footer-company">EMPÓRIO DAS COXINHAS</div>
          </footer>
        </main>

        <script>
          window.addEventListener('load', function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 250);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return html;
  };

  // Nova função para enviar e-mail do fechamento de caixa
  const handleSendEmail = async (register: any, reportHtml?: string) => {
    setSendingEmail(register.id);
    
    try {
      // Preparar dados para o e-mail
      const openingAmount = parseFloat(register.opening_amount || 0);
      const cashSales = register.salesByPayment?.cash || 0;
      const salesTotal = (register.salesByPayment?.cash || 0) + (register.salesByPayment?.debit || 0) + (register.salesByPayment?.credit || 0) + (register.salesByPayment?.pix || 0);
      
      const calculateTotalsByCategory = (transactions: any[]) => {
        const withdrawals = transactions?.filter((t: any) => t.type === 'withdrawal') || [];
        return withdrawals.reduce((acc: any, t: any) => {
          const desc = t.description || '';
          let cat = 'outros';
          if (desc.startsWith('Taxa Entrega')) cat = 'taxa_entrega';
          else if (desc.startsWith('iFood')) cat = 'ifood';
          else if (desc.startsWith('Brigadeiros')) cat = 'brigadeiros';
          
          acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
          return acc;
        }, { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 });
      };
      
      const totalsByCategory = calculateTotalsByCategory(register.transactions || []);
      const totalSangrias = totalsByCategory.taxa_entrega + totalsByCategory.ifood + totalsByCategory.brigadeiros + totalsByCategory.outros;
      
      const vouchers = register.transactions?.filter((t: any) => t.type === 'voucher') || [];
      const additions = register.transactions?.filter((t: any) => t.type === 'addition') || [];
      
      const voucherTotal = vouchers.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      const additionTotal = additions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      
      const calculatedClosingCash = salesTotal - totalSangrias;
      const valorInformado = parseFloat(register.closing_amount || 0);
      
      // CORREÇÃO: Valor Esperado = (Abertura + Dinheiro + Adições) - (Total Sangrias + Total Vales)
      const expectedAmount = register.expected_amount !== undefined 
        ? parseFloat(register.expected_amount) 
        : openingAmount + cashSales + additionTotal - totalSangrias - voucherTotal;
      
      const difference = valorInformado - expectedAmount;

      const emailData = {
        openingAmount,
        salesTotal,
        calculatedClosingCash,
        salesByPayment: {
          cash: register.salesByPayment?.cash || 0,
          debit: register.salesByPayment?.debit || 0,
          credit: register.salesByPayment?.credit || 0,
          pix: register.salesByPayment?.pix || 0,
        },
        totalsByCategory,
        totalSangrias,
        vouchers: vouchers.map((t: any) => ({ description: t.description, amount: parseFloat(t.amount) })),
        voucherTotal,
        additions: additions.map((t: any) => ({ description: t.description, amount: parseFloat(t.amount) })),
        additionTotal,
        valorInformado,
        expectedAmount,
        difference,
        closedAt: register.closed_at,
        notes: register.notes,
        // Mesmo HTML visual usado pela impressão do fechamento.
        reportHtml: reportHtml || undefined,
        html: reportHtml || undefined,
      };

      const response = await fetch('/api/cash-register/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success('E-mail do fechamento de caixa enviado com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao enviar e-mail');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erro ao enviar e-mail');
    } finally {
      setSendingEmail(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
            <p className="text-gray-600 mt-1">Controle de abertura e fechamento de caixa</p>
          </div>
          {currentRegister ? (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <Unlock className="h-5 w-5" />
              <span className="font-semibold">Caixa Aberto</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              <Lock className="h-5 w-5" />
              <span className="font-semibold">Caixa Fechado</span>
            </div>
          )}
        </div>

        {currentRegister ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Abertura
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(parseFloat(currentRegister.opening_amount))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(currentRegister.opened_at)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Vendas
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentRegister.salesTotal || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Todas as formas de pagamento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tempo Aberto
                  </CardTitle>
                  <Clock className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {timeElapsed} min
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Desde a abertura
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Dinheiro</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(currentRegister.salesByPayment?.cash || 0)}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Débito</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(currentRegister.salesByPayment?.debit || 0)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Crédito</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency(currentRegister.salesByPayment?.credit || 0)}
                    </p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="h-5 w-5 text-teal-600" />
                      <span className="font-semibold text-teal-800">Pix</span>
                    </div>
                    <p className="text-2xl font-bold text-teal-700">
                      {formatCurrency(currentRegister.salesByPayment?.pix || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Minus className="h-5 w-5" />
                    Sangrias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <p className="text-xs text-orange-700 font-medium">Deliverys</p>
                        <p className="font-bold text-orange-600">{formatCurrency(totalsByCategory.taxa_entrega)}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded text-center">
                        <p className="text-xs text-red-700 font-medium">Ifoods</p>
                        <p className="font-bold text-red-600">{formatCurrency(totalsByCategory.ifood)}</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded text-center">
                        <p className="text-xs text-amber-700 font-medium">Brigadeiros</p>
                        <p className="font-bold text-amber-600">{formatCurrency(totalsByCategory.brigadeiros)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-700 font-medium">Outros</p>
                        <p className="font-bold text-gray-600">{formatCurrency(totalsByCategory.outros)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2">
                                              <span className="text-gray-600 font-medium">Total de Sangrias:</span>
                                              <span className="text-xl font-bold text-red-600">
                                                {formatCurrency(totalsByCategory.taxa_entrega + totalsByCategory.ifood + totalsByCategory.brigadeiros + totalsByCategory.outros)}
                                              </span>
                                            </div>
                    
                    <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <Minus className="mr-2 h-4 w-4" />
                          Nova Sangria
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Sangria</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Categoria
                            </label>
                            <Select
                              value={transactionCategory}
                              onValueChange={(value: any) => setTransactionCategory(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ifood">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Taxas de iFood
                                  </div>
                                </SelectItem>
                                <SelectItem value="brigadeiros">
                                  <div className="flex items-center gap-2">
                                    <Utensils className="h-4 w-4" />
                                    Taxas de Brigadeiros
                                  </div>
                                </SelectItem>
                                <SelectItem value="taxa_entrega">
                                  <div className="flex items-center gap-2">
                                    <Bike className="h-4 w-4" />
                                    Taxa Entrega
                                  </div>
                                </SelectItem>
                                <SelectItem value="outros">
                                  <div className="flex items-center gap-2">
                                    <Minus className="h-4 w-4" />
                                    Outros
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Valor
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(e.target.value)}
                              placeholder="Ex: 50.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Descrição
                            </label>
                            <Textarea
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              placeholder={transactionCategory === 'taxa_entrega' ? 'Ex: Pedro' : 'Ex: Taxa, Comissão...'}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsWithdrawalDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleTransaction('withdrawal')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Sangria
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {(currentRegister?.transactions?.filter((t: any) => t.type === 'withdrawal') || []).length > 0 && (
                                          <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                                            {(currentRegister?.transactions?.filter((t: any) => t.type === 'withdrawal') || []).map((trans: any) => (
                                              <div key={trans.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-medium truncate">{getCleanDescription(trans.description)}</p>
                                                  <p className="text-xs text-gray-500">{formatDateTime(trans.created_at)}</p>
                                                </div>
                                                <span className="font-bold text-red-600 ml-2">
                                                  -{formatCurrency(parseFloat(trans.amount))}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Receipt className="h-5 w-5" />
                    Vales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Vales:</span>
                      <span className="text-xl font-bold text-amber-600">
                        {formatCurrency(
                          currentRegister.transactions?.filter((t: any) => t.type === 'voucher').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
                        )}
                      </span>
                    </div>
                    
                    <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700">
                          <Receipt className="mr-2 h-4 w-4" />
                          Novo Vale
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Vale</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Valor
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Descrição
                            </label>
                            <Textarea
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              placeholder="Ex: Diária funcionário João..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsVoucherDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleTransaction('voucher')}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Confirmar Vale
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {currentRegister.transactions?.filter((t: any) => t.type === 'voucher').length > 0 && (
                      <div className="space-y-2 mt-4">
                        {currentRegister.transactions
                          .filter((t: any) => t.type === 'voucher')
                          .map((trans: any) => (
                            <div key={trans.id} className="flex justify-between items-center p-2 bg-amber-50 rounded text-sm">
                              <div>
                                <p className="font-medium">{trans.description || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(trans.created_at)}</p>
                              </div>
                              <span className="font-bold text-amber-600">
                                -{formatCurrency(parseFloat(trans.amount))}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Plus className="h-5 w-5" />
                    Adições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Adições:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          currentRegister.transactions?.filter((t: any) => t.type === 'addition').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
                        )}
                      </span>
                    </div>
                    
                    <Dialog open={isAdditionDialogOpen} onOpenChange={setIsAdditionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Adição
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Adição</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Valor
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(e.target.value)}
                              placeholder="Ex: 100.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Descrição
                            </label>
                            <Textarea
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              placeholder="Ex: Troco de cliente..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAdditionDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleTransaction('addition')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirmar Adição
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {currentRegister.transactions?.filter((t: any) => t.type === 'addition').length > 0 && (
                      <div className="space-y-2 mt-4">
                        {currentRegister.transactions
                          .filter((t: any) => t.type === 'addition')
                          .map((trans: any) => (
                            <div key={trans.id} className="flex justify-between items-center p-2 bg-green-50 rounded text-sm">
                              <div>
                                <p className="font-medium">{trans.description || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(trans.created_at)}</p>
                              </div>
                              <span className="font-bold text-green-600">
                                +{formatCurrency(parseFloat(trans.amount))}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-orange-600" />
                  Fechar Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Ao fechar o caixa, você precisará informar o valor total em dinheiro contado.
                  O sistema calculará a diferença entre o valor contado e o valor esperado.
                </p>
                <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Lock className="mr-2 h-4 w-4" />
                      Fechar Caixa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Fechamento de Caixa</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valor Contado em Dinheiro
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={closingAmount}
                          onChange={(e) => setClosingAmount(e.target.value)}
                          placeholder="Ex: 1500.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Observações
                        </label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Ex: Troco quebrado, notas rasgadas..."
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCloseRegister}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        disabled={!closingAmount}
                      >
                        Confirmar Fechamento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-600" />
                Abrir Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Para iniciar as vendas, você precisa abrir o caixa informando o valor inicial em dinheiro.
              </p>
              <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Abrir Novo Caixa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Abrir Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor Inicial em Dinheiro
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(e.target.value)}
                        placeholder="Ex: 100.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Informe quanto dinheiro há no caixa antes de começar
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Observações
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Troco de ontem, notas..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleOpenRegister}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Abrir Caixa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Histórico de Fechamentos</h2>
                    <div className="space-y-4">
                      {history.map((register: any) => (
                        <Card key={register.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">
                                {formatDateTime(register.closed_at)}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {register.difference > 0 ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="font-semibold">
                                      +{formatCurrency(register.difference)}
                                    </span>
                                  </div>
                                ) : register.difference < 0 ? (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <TrendingDown className="h-4 w-4" />
                                    <span className="font-semibold">
                                      {formatCurrency(register.difference)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-semibold">Exato</span>
                                  </div>
                                )}
                                
                                {/* AÇÕES: Impressão e Email */}
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePrintHistorical(register)}
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    title="Imprimir relatório"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSendEmail(register)}
                                    disabled={sendingEmail === register.id}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Enviar relatório por e-mail"
                                  >
                                    {sendingEmail === register.id ? (
                                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                    ) : (
                                      <Mail className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Abertura</p>
                                <p className="font-semibold">{formatCurrency(register.opening_amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Vendas</p>
                                <p className="font-semibold text-green-600">{formatCurrency(register.expected_amount - register.opening_amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Esperado</p>
                                <p className="font-semibold text-orange-600">{formatCurrency(register.expected_amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Contado</p>
                                <p className="font-semibold">{formatCurrency(register.closing_amount)}</p>
                              </div>
                            </div>
                            {register.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-gray-500">Observações: {register.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
      </div>

      <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .printable-receipt, .printable-receipt * {
                  visibility: visible;
                }
                .printable-receipt {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 80mm;
                  font-family: Courier New, monospace;
                  font-size: 12px;
                  padding: 5mm;
                  background: white;
                  color: black;
                  line-height: 1.4;
                }
                .printable-receipt h2 {
                  font-size: 16px;
                  text-align: center;
                  margin-bottom: 5px;
                  font-weight: bold;
                }
                .printable-receipt p {
                  margin: 2px 0;
                }
                .printable-receipt .border-b-2,
                .printable-receipt .border-t {
                  border-bottom: 2px dashed black;
                  border-top: 2px dashed black;
                }
                .printable-receipt .flex {
                  display: flex;
                  justify-content: space-between;
                }
                .printable-receipt .font-bold {
                  font-weight: bold;
                }
                .printable-receipt .text-center {
                  text-align: center;
                }
                .printable-receipt .text-sm {
                  font-size: 10px;
                }
                .printable-receipt .text-xs {
                  font-size: 9px;
                }
                .printable-receipt .text-gray-500,
                .printable-receipt .text-gray-600,
                .printable-receipt .text-red-600,
                .printable-receipt .text-red-700,
                .printable-receipt .text-green-600,
                .printable-receipt .text-green-700,
                .printable-receipt .text-amber-600,
                .printable-receipt .text-amber-700,
                .printable-receipt .text-blue-600,
                .printable-receipt .text-blue-700,
                .printable-receipt .text-orange-600,
                .printable-receipt .text-orange-700,
                .printable-receipt .button,
                .printable-receipt .dialog-header,
                .printable-receipt .dialog-footer {
                  display: none;
                }
              }
              
              @media print {
                .epson-t20-receipt {
                  font-family: 'Courier New', Courier, monospace !important;
                  font-size: 10px !important;
                  width: 80mm !important;
                  margin: 0 !important;
                  padding: 2mm !important;
                  color: black !important;
                  background: white !important;
                }
                .epson-t20-receipt .center { text-align: center !important; }
                .epson-t20-receipt .right { text-align: right !important; }
                .epson-t20-receipt .bold { font-weight: bold !important; }
                .epson-t20-receipt .divider { border-bottom: 1px solid #000 !important; margin: 1mm 0 !important; }
                .epson-t20-receipt .dashed { border-top: 1px dashed #000 !important; border-bottom: 1px dashed #000 !important; margin: 1mm 0 !important; }
                .epson-t20-receipt .line { margin: 1mm 0 !important; }
                .epson-t20-receipt .small { font-size: 8px !important; }
                .epson-t20-receipt .medium { font-size: 10px !important; }
                .epson-t20-receipt .large { font-size: 12px !important; }
                .epson-t20-receipt .flex { display: flex !important; justify-content: space-between !important; }
                .epson-t20-receipt .gap-2 { gap: 2mm !important; }
                .epson-t20-receipt .gap-1 { gap: 1mm !important; }
                .epson-t20-receipt .no-print-color { display: none !important; }
              }
            `}</style>
    </div>
  );
};

export default CashRegister;
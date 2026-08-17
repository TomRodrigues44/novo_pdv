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

// --- NOVA FUNÇÃO: Gerar HTML formatado para impressora 80mm ---
function generateCashRegisterPrintHtml(register: any): string {
  const openingAmount = parseFloat(register.opening_amount || 0);
  // Total Vendas = soma de todas as formas de pagamento
  const salesTotal = (register.salesByPayment?.cash || 0) + (register.salesByPayment?.debit || 0) + (register.salesByPayment?.credit || 0) + (register.salesByPayment?.pix || 0);

  // Calcular totais por categoria de sangria (apenas sangrias, sem vouchers/adições)
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

  // Vales e Adições (separados do Fechamento Caixa)
  const vouchers = register.transactions?.filter((t: any) => t.type === 'voucher') || [];
  const additions = register.transactions?.filter((t: any) => t.type === 'addition') || [];

  const voucherTotal = vouchers.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
  const additionTotal = additions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  // Fechamento Caixa (Calc) = Total Vendas - Total Sangrias
  const calculatedClosingCash = salesTotal - totalSangrias;

  // VALOR INFORMADO = Valor Contado (o que o operador digitou no fechamento)
  const valorInformado = parseFloat(register.closing_amount || 0);

  // VALOR ESPERADO = Abertura + Vendas em Dinheiro + Adições - Sangrias - Vales
  const expectedAmount = register.expected_amount !== undefined 
    ? parseFloat(register.expected_amount) 
    : openingAmount + (register.salesByPayment?.cash || 0) + additionTotal - totalSangrias - voucherTotal;

  // Diferença = Valor Informado - Valor Esperado
  const difference = valorInformado - expectedAmount;

  // Helper para formatar currency
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // HTML simples para impressora térmica 80mm - monoespaçado, sem cores/fundos
  const lines: string[] = [];

  // Título
  lines.push('========================================');
  lines.push('   EMPÓRIO DAS COXINHAS');
  lines.push('   Relatório de Fechamento de Caixa');
  lines.push('========================================');
  lines.push('');

  // Data
  lines.push(`Data: ${new Date(register.closed_at).toLocaleString('pt-BR')}`);
  lines.push('');

  // ÁREA 1: Abertura, Total Vendas e Fechamento Caixa (Calc)
  lines.push('Abertura:                ' + fmt(openingAmount));
  lines.push('Total Vendas:            ' + fmt(salesTotal));
  lines.push('Fechamento Caixa (Calc): ' + fmt(calculatedClosingCash));
  lines.push('');

  // ÁREA 2: Vendas por Forma
  lines.push('VENDAS POR FORMA:');
  lines.push('Dinheiro:                ' + fmt(register.salesByPayment?.cash || 0));
  lines.push('Débito:                  ' + fmt(register.salesByPayment?.debit || 0));
  lines.push('Crédito:                 ' + fmt(register.salesByPayment?.credit || 0));
  lines.push('Pix:                     ' + fmt(register.salesByPayment?.pix || 0));
  lines.push('');

  // ÁREA 3: Sangrias
  if (totalSangrias > 0) {
    lines.push('SANGRIAS:                ' + fmt(totalSangrias));
    if (totalsByCategory.taxa_entrega > 0) {
      lines.push('Deliverys:               -' + fmt(totalsByCategory.taxa_entrega));
    }
    if (totalsByCategory.ifood > 0) {
      lines.push('Ifoods:                  -' + fmt(totalsByCategory.ifood));
    }
    if (totalsByCategory.brigadeiros > 0) {
      lines.push('Brigadeiros:             -' + fmt(totalsByCategory.brigadeiros));
    }
    if (totalsByCategory.outros > 0) {
      lines.push('Outros:                  -' + fmt(totalsByCategory.outros));
    }
  }
  lines.push('');

  // ÁREA 4: Vales
  if (vouchers.length > 0 || voucherTotal > 0) {
    lines.push('VALES:                     ' + fmt(voucherTotal));
    if (vouchers.length > 0) {
      vouchers.forEach((t: any) => {
        const desc = t.description || 'Sem descrição';
        lines.push('  - ' + desc + ': -' + fmt(parseFloat(t.amount)));
      });
    }
    lines.push('');
  }

  // ÁREA 5: Adições
  if (additions.length > 0 || additionTotal > 0) {
    lines.push('ADIÇÕES:                 ' + fmt(additionTotal));
    if (additions.length > 0) {
      additions.forEach((t: any) => {
        const desc = t.description || 'Sem descrição';
        lines.push('  + ' + desc + ': +' + fmt(parseFloat(t.amount)));
      });
    }
    lines.push('');
  }

  // ÁREA 6: Conferencia
  lines.push('CONFERÊNCIA:');
  lines.push('Valor Informado (Contado): ' + fmt(valorInformado));
  lines.push('Valor Esperado:            ' + fmt(expectedAmount));
  lines.push('DIFERENÇA:               ' + fmt(difference));
  lines.push('  ' + (difference > 0 ? 'Sobrou dinheiro' : difference < 0 ? 'Faltou dinheiro' : 'Caixa fechou exato'));
  lines.push('');

  // Rodapé
  lines.push('========================================');
  lines.push('*** OBRIGADO PELA PREFERÊNCIA ***');
  lines.push('Empório das Coxinhas');
  lines.push('========================================');

  // Junta todas as linhas com quebra de linha
  return lines.join('\n');
}

// Função auxiliar para formatar currency (já existia, mantemos para consistência)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CashRegister = () => {
  // ... resto do componente permanece o mesmo, apenas as funções de impressão são atualizadas

  // Antiga função handlePrint (apenas window.print) - mantemos para o dialog de sucesso
  const handlePrint = () => {
    window.print();
  };

  // Atualizada função handlePrintHistorical para usar HTML formatado
  const handlePrintHistorical = (register: any) => {
    const htmlContent = generateCashRegisterPrintHtml(register);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // HTML minimalista para impressora Epson T20
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px;
            margin: 0;
            padding: 2mm;
            background: white;
            color: black;
          }
          .center { text-align: center; }
          .divider { border-bottom: 1px solid #000; margin: 2mm 0; }
          .line { margin: 2mm 0; }
          .small { font-size: 8px; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap;">${htmlContent}</pre>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // ... resto do componente

  // Atualizar a função handleSendEmail para também usar o HTML formatado
  const handleSendEmail = async (register: any) => {
    setSendingEmail(register.id);
    
    try {
      // ... dados existentes ...
      
      // Gerar HTML formatado para o e-mail (versão simplificada)
      const htmlContent = generateCashRegisterPrintHtml(register);
      
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || '';
      const toEmail = process.env.CASH_REGISTER_EMAIL_TO || 'tom.santanna@gmail.com';
      
      if (!fromEmail) {
        throw new Error('E-mail remetente não configurado');
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });
      
      const subject = `📊 Fechamento de Caixa - Loja 1 - Aparecida - ${new Date().toLocaleString('pt-BR')}`;

      await transporter.sendMail({
        from: `"Empório das Coxinhas" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: '<pre style="font-family: Courier New, Courier, monospace; font-size: 10px; line-height: 1.3;">' + htmlContent.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>') + '</pre>',
      });

      console.log(`✅ E-mail de fechamento de caixa enviado para ${toEmail}`);
      toast.success('E-mail do fechamento de caixa enviado com sucesso!');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erro ao enviar e-mail');
    } finally {
      setSendingEmail(null);
    }
  };

  // ... resto do componente
}
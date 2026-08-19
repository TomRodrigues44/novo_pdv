import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Plus,
  Lock,
  Unlock,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Receipt,
  Bike,
  Utensils,
  Smartphone,
  Mail,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';

const CashRegister = () => {
  const queryClient = useQueryClient();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isCloseSuccessDialogOpen, setIsCloseSuccessDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isAdditionDialogOpen, setIsAdditionDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
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
  const receiptDataRef = useRef<any>(null);

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

  // Calcular totalsByCategory e withdrawals no escopo do componente
  const totalsByCategory = useMemo(() => {
    if (!currentRegister?.transactions) {
      return { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 };
    }
    
    const withdrawals = currentRegister.transactions.filter((t: any) => t.type === 'withdrawal');
    return withdrawals.reduce((acc: any, t: any) => {
      const desc = t.description || '';
      let cat = 'outros';
      if (desc.startsWith('Taxa Entrega')) cat = 'taxa_entrega';
      else if (desc.startsWith('iFood')) cat = 'ifood';
      else if (desc.startsWith('Brigadeiros')) cat = 'brigadeiros';
      
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
      return acc;
    }, { taxa_entrega: 0, ifood: 0, brigadeiros: 0, outros: 0 });
  }, [currentRegister?.transactions]);

  // Calcular withdrawals separadamente para uso no JSX
  const withdrawals = useMemo(() => {
    return currentRegister?.transactions?.filter((t: any) => t.type === 'withdrawal') || [];
  }, [currentRegister?.transactions]);

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
    try {
      const amount = parseFloat(closingAmount) || 0;
      setFinalClosingAmount(amount);
      setClosedRegisterData(currentRegister);

      // Store data for email sending after receipt dialog closes
      const paymentMethods = currentRegister.payments || [];
      const items = currentRegister.items || [];
      const fiscalData = currentRegister.fiscal ?? {};
      const nfceData = currentRegister.xml_envio ? { ...currentRegister } : null;

      receiptDataRef.current = {
        total: parseFloat(currentRegister.total_amount || 0),
        freight: parseFloat(currentRegister.freight || 0),
        cartItems: items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          flavors: item.flavors,
        })),
        payments: paymentMethods.map((p: any) => ({
          type: p.type,
          amount: Number(p.amount),
        })),
        documentType: currentRegister.xml_status === 'cancelled' ? 'quote' : 'fiscal',
        saleId: String(currentRegister.daily_sale_number || ''),
        nfceData,
      };

      // Open receipt dialog
      setIsReceiptDialogOpen(true);
    } catch (error) {
      toast.error('Erro ao fechar caixa');
    }
  };

  // Handle receipt dialog close - send email after dialog closes
  useEffect(() => {
    if (!isReceiptDialogOpen && receiptDataRef.current) {
      handleSendEmail(receiptDataRef.current);
      receiptDataRef.current = null; // Reset after sending
    }
  }, [isReceiptDialogOpen, receiptDataRef.current]);

  const handleGenerateDocument = async (type: 'quote' | 'fiscal') => {
    setCurrentDocumentType(type);
    setIsDocumentDialogOpen(true);
  };

  const handleReceiptClose = () => {
    setIsReceiptDialogOpen(false);
  };

  const handleSendEmail = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/cash-register/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
  }, []);

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

  const handlePrintHistorical = (register: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
  
    const openingAmount = parseFloat(register.opening_amount || 0);
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
    
    const expectedAmount = register.expected_amount !== undefined 
      ? parseFloat(register.expected_amount) 
      : openingAmount + (register.salesByPayment?.cash || 0) + additionTotal - totalSangrias - voucherTotal;
    
    const difference = valorInformado - expectedAmount;

    const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório Fechamento Caixa - Epson T20</title>
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
              .right { text-align: right; }
              .bold { font-weight: bold; }
              .underline { text-decoration: underline; }
              .divider { border-bottom: 1px solid #000; margin: 1mm 0; }
              .dashed { border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 1mm 0; }
              .line { margin: 1mm 0; }
              .small { font-size: 8px; }
              .medium { font-size: 10px; }
              .large { font-size: 12px; }
              .flex { display: flex; justify-content: space-between; }
              .gap-2 { gap: 2mm; }
              .gap-1 { gap: 1mm; }
            </style>
          </head>
          <body>
            <div class="epson-t20-receipt">
              <div class="line">
                <h2 class="large center bold">EMPÓRIO DAS COXINHAS</h2>
                <p class="medium center">Relatório de Fechamento de Caixa</p>
                <p class="small center">
                  ${formatDateTime(new Date().toISOString())}
                </p>
                <div class="divider"></div>
              </div>

              <!-- ÁREA 1: Abertura, Total Vendas e Fechamento Caixa (Calc) -->
              <div class="line">
                <span class="medium bold">Abertura:</span> ${formatCurrency(openingAmount)}
                <br>
                <span class="medium bold">Total Vendas:</span> ${formatCurrency(salesTotal)}
                <br>
                <span class="medium bold">Fechamento Caixa (Calc):</span> ${formatCurrency(calculatedClosingCash)}
              </div>
              <div class="divider"></div>

              <!-- ÁREA 2: Vendas por Forma -->
              <div class="line">
                <span class="medium bold">VENDAS POR FORMA:</span>
                <br>
                <span class="small">Dinheiro: ${formatCurrency(register.salesByPayment?.cash || 0)}</span>
                <br>
                <span class="small">Débito: ${formatCurrency(register.salesByPayment?.debit || 0)}</span>
                <br>
                <span class="small">Crédito: ${formatCurrency(register.salesByPayment?.credit || 0)}</span>
                <br>
                <span class="small">Pix: ${formatCurrency(register.salesByPayment?.pix || 0)}</span>
              </div>
              <div class="divider"></div>

              <!-- ÁREA 3: Sangrias -->
              ${totalSangrias > 0 ? `
              <div class="line">
                <span class="medium bold">SANGRIAS:</span> ${formatCurrency(totalSangrias)}
                <br>
                ${totalsByCategory.taxa_entrega > 0 ? `<span class="small">Deliverys: -${formatCurrency(totalsByCategory.taxa_entrega)}</span><br>` : ''}
                ${totalsByCategory.ifood > 0 ? `<span class="small">Ifood: -${formatCurrency(totalsByCategory.ifood)}</span><br>` : ''}
                ${totalsByCategory.brigadeiros > 0 ? `<span class="small">Brigadeiros: -${formatCurrency(totalsByCategory.brigadeiros)}</span><br>` : ''}
                ${totalsByCategory.outros > 0 ? `<span class="small">Outros: -${formatCurrency(totalsByCategory.outros)}</span><br>` : ''}
              </div>
              <div class="divider"></div>
              ` : ''}

              <!-- ÁREA 4: Vales -->
              ${vouchers.length > 0 ? `
              <div class="line">
                <span class="medium bold">VALES:</span>
                <br>
                ${vouchers.map(v => `<span class="small">-${formatCurrency(parseFloat(v.amount))} - ${v.description || 'Sem descrição'}</span>`).join('<br>')}
                <br>
                <span class="medium bold">Total de Vales:</span> ${formatCurrency(voucherTotal)}
              </div>
              <div class="divider"></div>
              ` : ''}

              <!-- ÁREA 5: Adições -->
              ${additions.length > 0 ? `
              <div class="line">
                <span class="medium bold">ADIÇÕES:</span>
                <br>
                ${additions.map(a => `<span class="small">+${formatCurrency(parseFloat(a.amount))} - ${a.description || 'Sem descrição'}</span>`).join('<br>')}
                <br>
                <span class="medium bold">Total de Adições:</span> ${formatCurrency(additionTotal)}
              </div>
              <div class="divider"></div>
              ` : ''}

              <!-- ÁREA 6: Conferencia -->
              <div class="line">
                <span class="medium bold">CONFERÊNCIA:</span>
                <br>
                <span class="small">Valor Informado (Contado): ${formatCurrency(valorInformado)}</span>
                <br>
                <span class="small">Valor Esperado: ${formatCurrency(expectedAmount)}</span>
                <br>
                <span class="medium bold">DIFERENÇA: ${formatCurrency(difference)}</span>
                <br>
                <span class="small">${difference > 0 ? 'Sobrou dinheiro' : difference < 0 ? 'Faltou dinheiro' : 'Caixa fechou exato'}</span>
              </div>
              <div class="divider"></div>

              <div class="line">
                <p class="medium center small">*** OBRIGADO PELA PREFERÊNCIA ***</p>
                <p class="medium center small">Empório das Coxinhas</p>
              </div>
            </div>
          </body>
          </html>
        `;
  
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
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
                        <p className="text-xs text-red-700 font-medium">iFoods</p>
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
                        {formatCurrency(withdrawals.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0))}
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

                    {withdrawals.length > 0 && (
                      <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                        {withdrawals.map((trans: any) => (
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
    </div>
  );
};

export default CashRegister;
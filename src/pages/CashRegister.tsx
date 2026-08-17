import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, Plus, Lock, Unlock, Minus, CreditCard, QrCode, Banknote, Printer, Receipt, Bike, Utensils, Smartphone } from 'lucide-react';
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
  const [transactionCategory, setTransactionCategory] = useState('taxa_entrega');
  const [notes, setNotes] = useState('');
  const [closeResult, setCloseResult] = useState<any>(null);
  const [closedRegisterData, setClosedRegisterData] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

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

    // Calcular imediatamente
    calculateTimeElapsed();

    // Atualizar a cada segundo
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

      const response = await fetch('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingAmount: amount,
          notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCloseResult(result);
        setIsCloseSuccessDialogOpen(true);
        setIsCloseDialogOpen(false);
        setClosingAmount('');
        setNotes('');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao fechar caixa');
      }
    } catch (error) {
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

  const handlePrintHistorical = (register: any) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
  
      const openingAmount = parseFloat(register.opening_amount || 0);
      const expectedAmount = parseFloat(register.expected_amount || 0);
      const difference = parseFloat(register.difference || 0);
  
      // Calcular Total Vendas a partir das vendas por forma
      const salesTotal = (register.salesByPayment?.cash || 0) + (register.salesByPayment?.debit || 0) + (register.salesByPayment?.credit || 0) + (register.salesByPayment?.pix || 0);
  
      // Calcular fechamento do caixa = Total Vendas - Sangrias
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
      const closingAmount = salesTotal - totalSangrias;
  
      // Generate ESC/POS commands for Epson T20
      const escPosCommands = generateEscPosCommands({
        title: 'EMPÓRIO DAS COXINHAS',
        subtitle: 'Relatório de Fechamento de Caixa',
        date: formatDateTime(register.closed_at),
        opening: `Abertura: R$ ${formatCurrency(openingAmount)}`,
        salesTotal: `Total Vendas: R$ ${formatCurrency(salesTotal)}`,
        closing: `Fechamento do Caixa: R$ ${formatCurrency(closingAmount)}`,
        paymentBreakdown: [
          `Dinheiro: R$ ${formatCurrency(register.salesByPayment?.cash || 0)}`,
          `Débito: R$ ${formatCurrency(register.salesByPayment?.debit || 0)}`,
          `Crédito: R$ ${formatCurrency(register.salesByPayment?.credit || 0)}`,
          `Pix: R$ ${formatCurrency(register.salesByPayment?.pix || 0)}`
        ],
        sangrias: {
          total: `SANGRIAS: ${formatCurrency(totalSangrias)}`,
          breakdown: [
            `Delivery: ${formatCurrency(totalsByCategory.taxa_entrega)}`,
            `Ifood: ${formatCurrency(totalsByCategory.ifood)}`,
            `Brigadeiros: ${formatCurrency(totalsByCategory.brigadeiros)}`,
            `Outros: ${formatCurrency(totalsByCategory.outros)}`
          ],
          detailed: register.transactions?.filter((t: any) => t.type === 'withdrawal' && t.description?.startsWith('Taxa Entrega')).map((trans: any) =>
            `${trans.description} ${formatCurrency(parseFloat(trans.amount))}`
          ).join('\n') || '',
          detailedIfood: register.transactions?.filter((t: any) => t.type === 'withdrawal' && t.description?.startsWith('iFood')).map((trans: any) =>
            `${trans.description} ${formatCurrency(parseFloat(trans.amount))}`
          ).join('\n') || '',
          detailedBrigadeiros: register.transactions?.filter((t: any) => t.type === 'withdrawal' && t.description?.startsWith('Brigadeiros')).map((trans: any) =>
            `${trans.description} ${formatCurrency(parseFloat(trans.amount))}`
          ).join('\n') || '',
          detailedOutros: register.transactions?.filter((t: any) => t.type === 'withdrawal' && !t.description?.startsWith('Taxa Entrega') && !t.description?.startsWith('iFood') && !t.description?.startsWith('Brigadeiros')).map((trans: any) =>
            `${trans.description} ${formatCurrency(parseFloat(trans.amount))}`
          ).join('\n') || ''
        },
        conference: {
          valueInformed: `Valor Informado: R$ ${formatCurrency(closingAmount)}`,
          expectedValue: `Valor Esperado: R$ ${formatCurrency(expectedAmount)}`,
          difference: `DIFERENÇA: ${formatCurrency(difference)}`,
          result: difference > 0 ? 'SOBROU DINHEIRO' : difference < 0 ? 'FALTOU DINHEIRO' : 'CAIXA FECHOU EXATO'
        },
        thanks: [
          '*** OBRIGADO PELA PREFERÊNCIA ***',
          'Empório das Coxinhas'
        ]
      });
  
      printWindow.document.write(escPosCommands);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    };
  
    // Generate ESC/POS commands for Epson T20 thermal printer
    function generateEscPosCommands(data: {
      title: string;
      subtitle: string;
      date: string;
      opening: string;
      salesTotal: string;
      closing: string;
      paymentBreakdown: string[];
      sangrias: {
        total: string;
        breakdown: string[];
        detailed: string;
        detailedIfood: string;
        detailedBrigadeiros: string;
        detailedOutros: string;
      };
      conference: {
        valueInformed: string;
        expectedValue: string;
        difference: string;
        result: string;
      };
      thanks: string[];
    }) {
      // ESC/POS commands
      const ESC = '\x1B';
      const GS = '\x1D';
      const RS = '\x1C';
      const EOT = '\x04';
      
      // Command sequences
      const ESC_ALIGN_CENTER = ESC + 'a' + '1'; // Center align
      const ESC_ALIGN_LEFT = ESC + 'a' + '0'; // Left align
      const ESC_BOLD_ON = ESC + 'E' + '1'; // Bold on
      const ESC_BOLD_OFF = ESC + 'E' + '0'; // Bold off
      const GS_ESC_PRINT = GS + ESC + 'V' + '1'; // Print text
      const GS_ESC_SELECT = GS + ESC + '!' + '0'; // Select print mode
      const GS_ESC_FONT = GS + ESC + '!' + '1'; // Select 12-dot font
      const GS_ESC_FONT_12 = GS + ESC + '!' + '2'; // Select 12-dot font
      const GS_ESC_FONT_10 = GS + ESC + '!' + '0'; // Select 10-dot font
      const GS_ESC_UNDERLINE_ON = GS + 'U' + '1'; // Underline on
      const GS_ESC_UNDERLINE_OFF = GS + 'U' + '0'; // Underline off
      const GS_ESC_FS_DRAW_BARCODE = GS + 'F' + '1'; // Draw barcode
      const GS_ESC_DRAW_IMAGE = GS + 'f' + '1'; // Draw image
      const GS_ESC_CUT = GS + 'd' + '3'; // Cut paper
      
      // Helper functions
      const printText = (text: string) => {
        return GS + '!' + '0' + text + '\n';
      };
      
      const printBoldText = (text: string) => {
        return ESC + 'E' + '1' + text + ESC + 'E' + '0' + '\n';
      };
      
      const printUnderlinedText = (text: string) => {
        return GS + 'U' + '1' + text + GS + 'U' + '0' + '\n';
      };
      
      const printCenteredText = (text: string) => {
        return ESC + 'a' + '1' + text + ESC + 'a' + '0' + '\n';
      };
      
      const printHeader = () => {
        return [
          ESC + '2' + '1', // Set double height
          printCenteredText(data.title),
          printCenteredText(data.subtitle),
          ESC + '2' + '0', // Set normal height
          printCenteredText(data.date),
          '\n'
        ].join('');
      };
      
      const printFooter = () => {
        return [
          '\n',
          ...data.thanks.map(printCenteredText),
          ESC + 'd' + '3', // Cut paper
        ].join('');
      };
      
      // Build the report
      const lines = [
        // Header
        printHeader(),
        
        // Opening
        printBoldText(data.opening),
        
        // Sales breakdown
        printBoldText('VENDAS POR FORMA:'),
        ...data.paymentBreakdown.map(printText),
        
        // Closing
        printBoldText('FECHAMENTO DO CAIXA:'),
        printText(data.closing),
        
        // Sales total
        printBoldText('TOTAL VENDAS:'),
        printText(data.salesTotal),
        
        // Sangrias
        printBoldText('SANGRIAS:'),
        printText(data.sangrias.total),
        ...data.sangrias.breakdown.map(printText),
        ...(data.sangrias.detailed ? [data.sangrias.detailed] : []),
        
        // Conference
        printBoldText('CONFERÊNCIA:'),
        printText(data.conference.valueInformed),
        printText(data.conference.expectedValue),
        printText(data.conference.difference),
        printText(data.conference.result),
        
        // Empty line
        '\n',
        
        // Footer
          printFooter()
        ].flat();
      
      return lines.join('');
    }

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

  const withdrawals = currentRegister?.transactions?.filter((t: any) => t.type === 'withdrawal') || [];
  const totalsByCategory = calculateTotalsByCategory(currentRegister?.transactions || []);

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
                  Ao fechar o caixa, você precisará informar o valor total em dinheiro.
                  O sistema calculará a diferença apenas após a confirmação.
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
                          Valor em Dinheiro (Contado)
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrintHistorical(register)}
                                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
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

      <Dialog open={isCloseSuccessDialogOpen} onOpenChange={setIsCloseSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Caixa Fechado com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          {(() => {
                      const closedTotalsByCategory = calculateTotalsByCategory(closedRegisterData?.transactions || []);
                                            const totalWithdrawals = Object.values(closedTotalsByCategory).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0) as number;
                      
                      return (
              <div className="printable-receipt">
                <div className="text-center mb-4 pb-2 border-b-2 border-dashed">
                  <h2 className="text-xl font-bold">EMPÓRIO DAS COXINHAS</h2>
                  <p className="text-sm text-gray-600">Relatório de Fechamento de Caixa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(new Date().toISOString())}
                  </p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Abertura:</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(closedRegisterData?.opening_amount || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Vendas:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(closeResult?.salesTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fechamento do Caixa:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(closeResult?.closingCash || 0)}</span>
                  </div>
                </div>

                <div className="mb-4 pb-2 border-b-2 border-dashed">
                  <h4 className="font-bold text-sm mb-2">Vendas por Forma:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Dinheiro:</span>
                      <span>{formatCurrency(closeResult?.cashSales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Débito:</span>
                      <span>{formatCurrency(closedRegisterData?.salesByPayment?.debit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crédito:</span>
                      <span>{formatCurrency(closedRegisterData?.salesByPayment?.credit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pix:</span>
                      <span>{formatCurrency(closedRegisterData?.salesByPayment?.pix || 0)}</span>
                    </div>
                  </div>
                </div>

                {totalWithdrawals > 0 && (
                  <div className="mb-4 pb-2 border-b-2 border-dashed">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm text-red-700">SANGRIAS:</h4>
                      <span className="font-bold text-red-600">-{formatCurrency(totalWithdrawals)}</span>
                    </div>
                    
                    {closedTotalsByCategory.taxa_entrega > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between font-semibold text-orange-700 text-xs mb-1">
                          <span>Deliverys:</span>
                          <span>-{formatCurrency(closedTotalsByCategory.taxa_entrega)}</span>
                        </div>
                        {closedRegisterData?.transactions?.filter((t: any) => getCategoryFromDescription(t.description) === 'taxa_entrega').map((trans: any) => (
                          <div key={trans.id} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]">{getCleanDescription(trans.description)}</span>
                            <span>-{formatCurrency(parseFloat(trans.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {closedTotalsByCategory.ifood > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between font-semibold text-red-700 text-xs mb-1">
                          <span>Ifoods:</span>
                          <span>-{formatCurrency(closedTotalsByCategory.ifood)}</span>
                        </div>
                        {closedRegisterData?.transactions?.filter((t: any) => getCategoryFromDescription(t.description) === 'ifood').map((trans: any) => (
                          <div key={trans.id} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]">{getCleanDescription(trans.description)}</span>
                            <span>-{formatCurrency(parseFloat(trans.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {closedTotalsByCategory.brigadeiros > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between font-semibold text-amber-700 text-xs mb-1">
                          <span>Brigadeiros:</span>
                          <span>-{formatCurrency(closedTotalsByCategory.brigadeiros)}</span>
                        </div>
                        {closedRegisterData?.transactions?.filter((t: any) => getCategoryFromDescription(t.description) === 'brigadeiros').map((trans: any) => (
                          <div key={trans.id} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]">{getCleanDescription(trans.description)}</span>
                            <span>-{formatCurrency(parseFloat(trans.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {closedTotalsByCategory.outros > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between font-semibold text-gray-700 text-xs mb-1">
                          <span>Outros:</span>
                          <span>-{formatCurrency(closedTotalsByCategory.outros)}</span>
                        </div>
                        {closedRegisterData?.transactions?.filter((t: any) => getCategoryFromDescription(t.description) === 'outros').map((trans: any) => (
                          <div key={trans.id} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]">{getCleanDescription(trans.description)}</span>
                            <span>-{formatCurrency(parseFloat(trans.amount))}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {closeResult?.vouchers > 0 && (
                  <div className="mb-4 pb-2 border-b-2 border-dashed">
                    <h4 className="font-bold text-sm mb-2 text-amber-700">VALES:</h4>
                    <div className="space-y-1 text-sm">
                      {closedRegisterData?.transactions?.filter((t: any) => t.type === 'voucher').map((trans: any) => (
                        <div key={trans.id} className="flex justify-between">
                          <span className="truncate max-w-[150px]">{trans.description || 'Sem descrição'}</span>
                          <span className="text-amber-600">-{formatCurrency(parseFloat(trans.amount))}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-1 border-t">
                        <span>Total:</span>
                        <span className="text-amber-600">-{formatCurrency(closeResult?.vouchers || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {closeResult?.additions > 0 && (
                  <div className="mb-4 pb-2 border-b-2 border-dashed">
                    <h4 className="font-bold text-sm mb-2 text-green-700">ADIÇÕES:</h4>
                    <div className="space-y-1 text-sm">
                      {closedRegisterData?.transactions?.filter((t: any) => t.type === 'addition').map((trans: any) => (
                        <div key={trans.id} className="flex justify-between">
                          <span className="truncate max-w-[150px]">{trans.description || 'Sem descrição'}</span>
                          <span className="text-green-600">+{formatCurrency(parseFloat(trans.amount))}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-1 border-t">
                        <span>Total:</span>
                        <span className="text-green-600">+{formatCurrency(closeResult?.additions || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 pb-2 border-b-2 border-dashed">
                  <h4 className="font-bold text-sm mb-2">CONFERÊNCIA:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor Informado:</span>
                      <span className="font-semibold">{formatCurrency(finalClosingAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Esperado:</span>
                      <span className="font-semibold">{formatCurrency(closeResult?.expectedCashAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-bold">DIFERENÇA:</span>
                      <span className={`font-bold text-lg ${
                        (closeResult?.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(closeResult?.difference || 0)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {(closeResult?.difference || 0) > 0 ? 'Sobrou dinheiro' : 
                     (closeResult?.difference || 0) < 0 ? 'Faltou dinheiro' : 'Caixa fechou exato'}
                  </p>
                </div>

                <div className="text-center text-xs text-gray-500 pt-2">
                  <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
                  <p>Empório das Coxinhas</p>
                </div>
              </div>
            );
          })()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseSuccessDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      `}</style>
    </div>
  );
};

export default CashRegister;
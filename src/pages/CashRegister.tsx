import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, Plus, Lock, Unlock, Minus, CreditCard, QrCode, Banknote, Printer, Receipt, Bike, Utensils, Smartphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CashRegisterPrintDialog } from '@/components/CashRegisterPrintDialog';

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
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const { data: cashData, isLoading, refetch } = useQuery({
    queryKey: ['cash-register'],
    queryFn: async () => {
      const response = await fetch('/api/cash-register');
      if (!response.ok) throw new Error('Failed to fetch cash register');
      return response.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
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
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <div className="flex items-center gap-2">
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
        </div>

        {/* Histórico de Fechamentos com botão de impressão */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Histórico de Fechamentos</h2>
            <div className="space-y-4">
              {history.map((register: any) => {
                const totalWithdrawals = register.transactions?.filter((t: any) => t.type === 'withdrawal').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
                const totalAdditions = register.transactions?.filter((t: any) => t.type === 'addition').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
                const totalVouchers = register.transactions?.filter((t: any) => t.type === 'voucher').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0;
                
                return (
                  <Card key={register.id} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">
                            Fechamento em {formatDateTime(register.closed_at)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Abertura: {formatDateTime(register.opened_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setClosedRegisterData(register);
                              setCloseResult({
                                salesTotal: register.expected_amount - parseFloat(register.opening_amount),
                                closingCash: parseFloat(register.closing_amount),
                                expectedCashAmount: register.expected_amount,
                                withdrawals: totalWithdrawals,
                                additions: totalAdditions,
                                vouchers: totalVouchers,
                                difference: register.difference
                              });
                              setPrintDialogOpen(true);
                            }}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                          </Button>
                          <div className="text-right">
                            {register.difference > 0 ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-bold">+{formatCurrency(register.difference)}</span>
                              </div>
                            ) : register.difference < 0 ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="h-4 w-4" />
                                <span className="font-bold">{formatCurrency(register.difference)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-blue-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-bold">Exato</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Abertura</p>
                          <p className="font-semibold">{formatCurrency(parseFloat(register.opening_amount))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vendas</p>
                          <p className="font-semibold text-green-600">{formatCurrency(register.expected_amount - parseFloat(register.opening_amount))}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Esperado</p>
                          <p className="font-semibold text-orange-600">{formatCurrency(register.expected_amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contado</p>
                          <p className="font-semibold">{formatCurrency(parseFloat(register.closing_amount))}</p>
                        </div>
                      </div>
                      {register.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">Observações: {register.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Resto do conteúdo permanece igual... */}
        {/* ... (continua com o resto do componente) */}
      </div>

      {/* Diálogo de impressão */}
      <CashRegisterPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        closedRegisterData={closedRegisterData}
        closeResult={closeResult}
      />
    </div>
  );
};

export default CashRegister;
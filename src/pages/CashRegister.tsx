import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CashRegister = () => {
  const queryClient = useQueryClient();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isCloseSuccessDialogOpen, setIsCloseSuccessDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isAdditionDialogOpen, setIsAdditionDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [closeResult, setCloseResult] = useState<any>(null);
  const [closedRegisterData, setClosedRegisterData] = useState<any>(null); // Captura dados antes de fechar

  // Buscar dados do caixa
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
      // CAPTURAR DADOS ANTES DE FECHAR (snapshot)
      setClosedRegisterData(currentRegister);

      const response = await fetch('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingAmount: parseFloat(closingAmount) || 0,
          notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCloseResult(result);
        setIsCloseSuccessDialogOpen(true);
        setIsCloseDialogOpen(false);
        // NÃO limpamos o closingAmount aqui, pois precisamos dele no relatório
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

  const handleTransaction = async (type: 'withdrawal' | 'addition') => {
    try {
      const response = await fetch('/api/cash-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(transactionAmount) || 0,
          description: transactionDescription,
        }),
      });

      if (response.ok) {
        const typeName = type === 'withdrawal' ? 'Sangria' : 'Adição';
        toast.success(`${typeName} registrada com sucesso!`);
        
        if (type === 'withdrawal') {
          setIsWithdrawalDialogOpen(false);
        } else {
          setIsAdditionDialogOpen(false);
        }
        
        setTransactionAmount('');
        setTransactionDescription('');
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

        {/* Caixa Aberto */}
        {currentRegister ? (
          <div className="space-y-6">
            {/* Cards de Resumo */}
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
                    {Math.floor((Date.now() - new Date(currentRegister.opened_at).getTime()) / 1000 / 60)} min
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Desde a abertura
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Vendas por Forma de Pagamento */}
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

            {/* Sangrias e Adições */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Minus className="h-5 w-5" />
                    Sangrias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Sangrias:</span>
                      <span className="text-xl font-bold text-red-600">
                        {formatCurrency(
                          currentRegister.transactions?.filter((t: any) => t.type === 'withdrawal').reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0) || 0
                        )}
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
                              placeholder="Ex: Pagamento de fornecedor..."
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

                    {currentRegister.transactions?.filter((t: any) => t.type === 'withdrawal').length > 0 && (
                      <div className="space-y-2 mt-4">
                        {currentRegister.transactions
                          .filter((t: any) => t.type === 'withdrawal')
                          .map((trans: any) => (
                            <div key={trans.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                              <div>
                                <p className="font-medium">{trans.description || 'Sem descrição'}</p>
                                <p className="text-xs text-gray-500">{formatDateTime(trans.created_at)}</p>
                              </div>
                              <span className="font-bold text-red-600">
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

            {/* Botão de Fechar Caixa */}
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
          /* Caixa Fechado - Botão de Abrir */
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

        {/* Histórico de Fechamentos */}
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

      {/* Dialog de Sucesso do Fechamento com Impressão Térmica */}
      <Dialog open={isCloseSuccessDialogOpen} onOpenChange={setIsCloseSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Caixa Fechado com Sucesso!
            </DialogTitle>
          </DialogHeader>
          
          <div className="printable-receipt">
            {/* Cabeçalho do Cupom */}
            <div className="text-center mb-4 pb-2 border-b-2 border-dashed">
              <h2 className="text-xl font-bold">EMPÓRIO DAS COXINHAS</h2>
              <p className="text-sm text-gray-600">Relatório de Fechamento de Caixa</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(new Date().toISOString())}
              </p>
            </div>

            {/* Resumo Financeiro */}
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

            {/* Vendas por Forma de Pagamento */}
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

            {/* Sangrias */}
            {closeResult?.withdrawals > 0 && (
              <div className="mb-4 pb-2 border-b-2 border-dashed">
                <h4 className="font-bold text-sm mb-2 text-red-700">SANGRIAS:</h4>
                <div className="space-y-1 text-sm">
                  {closedRegisterData?.transactions?.filter((t: any) => t.type === 'withdrawal').map((trans: any) => (
                    <div key={trans.id} className="flex justify-between">
                      <span className="truncate max-w-[150px]">{trans.description || 'Sem descrição'}</span>
                      <span className="text-red-600">-{formatCurrency(parseFloat(trans.amount))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Total:</span>
                    <span className="text-red-600">-{formatCurrency(closeResult?.withdrawals || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Adições */}
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

            {/* Resumo de Conferência */}
            <div className="mb-4 pb-2 border-b-2 border-dashed">
              <h4 className="font-bold text-sm mb-2">CONFERÊNCIA:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor Informado:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(closingAmount || 0))}</span>
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

            {/* Rodapé */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
              <p>Empório das Coxinhas</p>
            </div>
          </div>

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

      {/* Estilos de Impressão para Impressora Térmica */}
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
            font-family: 'Courier New', monospace;
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
            border-bottom: 2px dashed black !important;
            border-top: 2px dashed black !important;
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
          .printable-receipt .text-green-700 {
            color: black !important;
          }
          .printable-receipt button,
          .printable-receipt .dialog-header,
          .printable-receipt .dialog-footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CashRegister;
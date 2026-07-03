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
  XCircle,
  FileText,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CashRegister = () => {
  const queryClient = useQueryClient();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Buscar dados do caixa
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
        toast.success('Caixa fechado com sucesso!');
        
        // Mostrar resumo
        if (result.difference !== 0) {
          const diffType = result.difference > 0 ? 'Sobrou' : 'Faltou';
          toast.info(`${diffType}: R$ ${Math.abs(result.difference).toFixed(2)}`);
        }
        
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
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
                    Vendas
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentRegister.salesTotal || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total do período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Esperado
                  </CardTitle>
                  <FileText className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(
                      parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0)
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Abertura + Vendas
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
                  O sistema calculará automaticamente a diferença.
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
                      <DialogTitle>Fechar Caixa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Valor de Abertura:</span>
                          <span className="font-semibold">
                            {formatCurrency(parseFloat(currentRegister.opening_amount))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total de Vendas:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(currentRegister.salesTotal || 0)}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Valor Esperado:</span>
                          <span className="text-orange-600">
                            {formatCurrency(
                              parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0)
                            )}
                          </span>
                        </div>
                      </div>

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

                      {closingAmount && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Diferença:</span>
                            <span className={`text-lg font-bold ${
                              (parseFloat(closingAmount) - (parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0))) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(
                                parseFloat(closingAmount) - (parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0))
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {(parseFloat(closingAmount) - (parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0))) > 0
                              ? 'Sobrou dinheiro (Suprimento)'
                              : (parseFloat(closingAmount) - (parseFloat(currentRegister.opening_amount) + (currentRegister.salesTotal || 0))) < 0
                              ? 'Faltou dinheiro (Sangria)'
                              : 'Caixa fechado corretamente'}
                          </p>
                        </div>
                      )}

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
                        className="bg-orange-600 hover:bg-orange-700"
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
    </div>
  );
};

export default CashRegister;
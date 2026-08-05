import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Bell, AlertTriangle, ChefHat, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  flavors?: string[];
}

interface Sale {
  id: string;
  daily_sale_number?: number;
  total_amount: number;
  payment_method: string;
  freight: number;
  created_at: string;
  items: SaleItem[];
  status?: 'pending' | 'preparing' | 'ready' | 'delivered';
  customer_name?: string;
}

const Kitchen = () => {
  const [status, setStatus] = useState<'pending' | 'preparing' | 'ready'>('pending');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Configuração de tempo de atraso (em minutos)
  const DELAY_THRESHOLD_MINUTES = 15;

  // Buscar vendas
  const { data: sales = [], refetch } = useQuery({
    queryKey: ['sales-kitchen'],
    queryFn: async () => {
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Atualizar o tempo atual a cada segundo para o contador funcionar
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Filtrar vendas pelo status e apenas de hoje
  const today = new Date().toISOString().split('T')[0];
  const filteredSales = sales
    .filter((sale: Sale) => {
      const saleDate = sale.created_at.split('T')[0];
      return saleDate === today && sale.status !== 'delivered';
    })
    .filter((sale: Sale) => {
      if (status === 'pending') return !sale.status || sale.status === 'pending';
      if (status === 'preparing') return sale.status === 'preparing';
      if (status === 'ready') return sale.status === 'ready';
      return true;
    })
    .sort((a: Sale, b: Sale) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const updateStatus = async (saleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sales/${saleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Status atualizado para ${newStatus}`);
        refetch();
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'preparing': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'ready': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusLabel = (s?: string) => {
    switch (s) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      default: return 'Pendente';
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = currentTime;
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    }
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    }
    
    const hours = Math.floor(diffInMinutes / 60);
    const mins = diffInMinutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getTimeColor = (createdAt: string) => {
    const now = currentTime;
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    
    if (diffInMinutes >= DELAY_THRESHOLD_MINUTES) {
      return 'text-red-600 font-bold animate-pulse';
    }
    if (diffInMinutes >= DELAY_THRESHOLD_MINUTES - 5) {
      return 'text-orange-600 font-semibold';
    }
    return 'text-green-600';
  };

  const isDelayed = (createdAt: string) => {
    const now = currentTime;
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
    return diffInMinutes >= DELAY_THRESHOLD_MINUTES;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-3 rounded-full">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cozinha</h1>
              <p className="text-gray-600">Kitchen Display System (KDS)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={status === 'pending' ? 'default' : 'outline'}
          onClick={() => setStatus('pending')}
          className={status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
        >
          Pendentes {sales.filter((s: Sale) => !s.status || s.status === 'pending').length}
        </Button>
        <Button
          variant={status === 'preparing' ? 'default' : 'outline'}
          onClick={() => setStatus('preparing')}
          className={status === 'preparing' ? 'bg-blue-500 hover:bg-blue-600' : ''}
        >
          Em Preparo {sales.filter((s: Sale) => s.status === 'preparing').length}
        </Button>
        <Button
          variant={status === 'ready' ? 'default' : 'outline'}
          onClick={() => setStatus('ready')}
          className={status === 'ready' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          Prontos {sales.filter((s: Sale) => s.status === 'ready').length}
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSales.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Nenhum pedido encontrado neste status</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale: Sale) => (
            <Card
              key={sale.id}
              className={`${getStatusColor(sale.status)} border-2 overflow-hidden ${isDelayed(sale.created_at) ? 'border-red-500 shadow-lg shadow-red-200' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pedido #{sale.daily_sale_number || String(sale.id).slice(-6)}
                    {sale.customer_name && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {sale.customer_name}
                        </span>
                      </>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {getStatusLabel(sale.status)}
                  </Badge>
                </div>
                <div className={`flex items-center gap-2 text-sm ${getTimeColor(sale.created_at)}`}>
                  <Clock className="h-4 w-4" />
                  <span>{getTimeElapsed(sale.created_at)}</span>
                  {isDelayed(sale.created_at) && (
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      ATRASADO
                    </span>
                  )}
                </div>
                {sale.freight > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <span>🚗 Entrega</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sale.items.map((item) => (
                    <div key={item.id} className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {item.quantity}x {item.product_name}
                          </p>
                          {item.flavors && item.flavors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-base font-semibold text-gray-700 mb-1">Sabores:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.flavors.map((flavor, idx) => (
                                  <span
                                    key={idx}
                                    className="text-base font-semibold bg-white px-3 py-1 rounded-full border border-gray-200"
                                  >
                                    {flavor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {!sale.status || sale.status === 'pending' ? (
                    <Button
                      onClick={() => updateStatus(sale.id, 'preparing')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Iniciar Preparo
                    </Button>
                  ) : sale.status === 'preparing' ? (
                    <>
                      <Button
                        onClick={() => updateStatus(sale.id, 'pending')}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={() => updateStatus(sale.id, 'ready')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Pronto
                      </Button>
                    </>
                  ) : sale.status === 'ready' ? (
                    <>
                      <Button
                        onClick={() => updateStatus(sale.id, 'preparing')}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={() => updateStatus(sale.id, 'delivered')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Entregue
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Kitchen;
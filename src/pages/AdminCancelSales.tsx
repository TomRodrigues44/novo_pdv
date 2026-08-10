import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import AdminSidebar from "@/components/AdminSidebar";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog";
import {
 Input,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
 AlertCircle,
 Loader2,
 Lock,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AdminCancelSales = () => {
 const { getSalesReport, refreshData } = useAdmin();
 const [selectedSale, setSelectedSale] = useState<any>(null);
 const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
 const [cancelledSales, setCancelledSales] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 // Buscar vendas canceladas
 const fetchCancelledSales = async () => {
  try {
   setLoading(true);
   const response = await fetch('/api/sales');
   if (response.ok) {
    const sales = await response.json();
    // Filtrar apenas vendas canceladas
    const cancelled = sales.filter((sale: any) => 
     sale.status === 'cancelled' || sale.xml_status === 'cancelled'
    );
    setCancelledSales(cancelled);
   }
  } catch (error) {
   console.error('Error fetching cancelled sales:', error);
   toast.error('Erro ao carregar notas canceladas');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchCancelledSales();
 }, []);

 const handleViewDetails = (sale: any) => {
  setSelectedSale(sale);
  setIsDetailDialogOpen(true);
 };

 const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL',
  }).format(value);
 };

 const getStatusBadge = (sale: any) => {
  if (sale.xml_status === 'cancelled' || sale.status === 'cancelled') {
   return <Badge variant="destructive">Cancelada</Badge>;
  }
  if (sale.fiscal_model === 'NFe') return <Badge variant="secondary">NF-e</Badge>;
  if (sale.fiscal_model === 'NFCe') return <Badge variant="default">NFC-e</Badge>;
  if (sale.fiscal_model === 'Orcamento') return <Badge variant="outline">Orçamento</Badge>;
  return <Badge variant="outline">Venda</Badge>;
 };

 return (
  <>
   <div className="flex">
    <AdminSidebar />
    <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
       <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
         <AlertCircle className="h-8 w-8 text-red-600" />
         Notas Canceladas
        </h1>
        <p className="text-gray-600 mt-2">
         Lista de todas as vendas e notas fiscais que foram canceladas
        </p>
       </div>
       <Button
        variant="outline"
        onClick={fetchCancelledSales}
        disabled={loading}
        className="gap-2"
       >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
       </Button>
      </div>

      <Card>
       <CardHeader>
        <CardTitle>Notas Fiscais e Vendas Canceladas ({cancelledSales.length})</CardTitle>
       </CardHeader>
       <CardContent>
        {loading ? (
         <div className="py-12 text-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          Carregando notas canceladas...
         </div>
        ) : cancelledSales.length === 0 ? (
         <div className="py-12 text-center text-gray-500">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg">Nenhuma nota cancelada encontrada</p>
          <p className="mt-2 text-sm">As notas canceladas aparecerão aqui automaticamente</p>
         </div>
        ) : (
         <div className="overflow-x-auto">
          <Table>
           <TableHeader>
            <TableRow>
             <TableHead>Data</TableHead>
             <TableHead>ID / Senha</TableHead>
             <TableHead>Tipo</TableHead>
             <TableHead>Status</TableHead>
             <TableHead>Cliente</TableHead>
             <TableHead className="text-right">Total</TableHead>
             <TableHead className="text-right">Ações</TableHead>
            </TableRow>
           </TableHeader>
           <TableBody>
            {cancelledSales.map((sale) => (
             <TableRow key={sale.id} className="hover:bg-red-50">
              <TableCell className="whitespace-nowrap">
               {new Date(sale.created_at).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="font-medium font-mono">
               #{sale.daily_sale_number || String(sale.id).slice(-6)}
              </TableCell>
              <TableCell>{getStatusBadge(sale)}</TableCell>
              <TableCell>
               <Badge variant="destructive">Cancelada</Badge>
              </TableCell>
              <TableCell>{sale.customer_name || 'Consumidor não identificado'}</TableCell>
              <TableCell className="text-right font-bold text-red-600">
               {formatCurrency(parseFloat(sale.total_amount || sale.total || 0))}
              </TableCell>
              <TableCell className="text-right">
               <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(sale)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
               >
                <Eye className="h-4 w-4" />
                Ver detalhes
               </Button>
              </TableCell>
             </TableRow>
            ))}
           </TableBody          </Table>
         </div>
        )}
       </CardContent>
      </Card>

      {/* Info card */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
       <CardContent className="p-4">
        <div className="flex items-start gap-3">
         <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
         <div>
          <h4 className="font-semibold text-blue-900">Informações sobre cancelamento</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-700">
           <li>• Esta lista mostra todas as vendas com status "cancelled" ou "xml_status = cancelled"</li>
           <li>• Notas fiscais (NF-e/NFC-e) canceladas na SEFAZ aparecem aqui automaticamente</li>
           <li>• Vendas de orçamento canceladas localmente também são exibidas</li>
           <li>• Use "Ver detalhes" para ver os itens, pagamentos e informações fiscais</li>
          </ul>
         </div>
        </div>
       </CardContent>
      </Card>
     </div>
    </div>

    {/* Dialog de Detalhes da Venda Cancelada */}
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
     <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
       <DialogTitle className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-600" />
        Detalhes da Venda Cancelada
       </DialogTitle>
       <DialogDescription>
        Venda #{selectedSale?.daily_sale_number || String(selectedSale?.id)?.slice(-6)} • 
        {new Date(selectedSale?.created_at).toLocaleString('pt-BR')}
       </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
       {/* Info geral */}
       <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
         <p className="text-sm text-gray-500">Status</p>
         <p className="font-semibold text-red-600">
          <Badge variant="destructive">Cancelada</Badge>
         </p>
        </div>
        <div>
         <p className="text-sm text-gray-500">Tipo</p>
         <p className="font-semibold">{getStatusBadge(selectedSale)}</p>
        </div>
        <div>
         <p className="text-sm text-gray-500">Cliente</p>
         <p className="font-semibold">{selectedSale?.customer_name || 'Consumidor não identificado'}</p>
        </div>
        <div>
         <p className="text-sm text-gray-500">Forma Pagamento</p>
         <p className="font-semibold">{selectedSale?.payment_method || 'Não informado'}</p>
        </div>
        <div className="col-span-2">
         <p className="text-sm text-gray-500">Total</p>
         <p className="text-2xl font-bold text-red-600">
          {formatCurrency(parseFloat(selectedSale?.total_amount || selectedSale?.total || 0))}
         </p>
        </div>
        {selectedSale?.freight > 0 && (
         <div className="col-span-2">
          <p className="text-sm text-gray-500">Frete</p>
          <p className="font-semibold text-blue-600">
           {formatCurrency(parseFloat(selectedSale?.freight || 0))}
          </p>
         </div>
        )}
       </div>

       {/* Itens */}
       <div>
        <h4 className="font-semibold mb-3">Itens da Venda</h4>
        <div className="space-y-2">
         {selectedSale?.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
           <div className="flex-1">
            <p className="font-medium">{item.quantity}x {item.product_name || item.name}</p>
            {item.flavors && item.flavors.length > 0 && (
             <p className="text-sm text-gray-500 mt-1">
              Sabores: {item.flavors.join(', ')}
             </p>
            )}
           </div>
           <p className="font-semibold text-gray-800">
            {formatCurrency(parseFloat(item.price || 0) * item.quantity)}
           </p>
          </div>
         ))}
        </div>
       </div>

       {/* Pagamentos */}
       {selectedSale?.payments && selectedSale.payments.length > 0 && (
        <div>
         <h4 className="font-semibold mb-3">Formas de Pagamento</h4>
         <div className="space-y-2">
          {selectedSale.payments.map((payment: any, idx: number) => (
           <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="capitalize">{payment.type}</span>
            <span className="font-semibold">{formatCurrency(parseFloat(payment.amount || 0))}</span>
           </div>
          ))}
         </div>
        </div>
       )}

       {/* Info fiscal se houver */}
       {(selectedSale?.xml_chave || selectedSale?.xml_numero) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
         <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Informações Fiscais
         </h4>
         <div className="grid grid-cols-2 gap-3 text-sm">
          {selectedSale?.xml_chave && (
           <div className="col-span-2">
            <p className="text-blue-700">Chave de Acesso:</p>
            <p className="font-mono text-xs break-all">{selectedSale.xml_chave}</p>
           </div>
          )}
          {selectedSale?.xml_numero && (
           <div>
            <p className="text-blue-700">Número:</p>
            <p className="font-semibold">{selectedSale.xml_numero}</p>
           </div>
          )}
          {selectedSale?.xml_status && (
           <div>
            <p className="text-blue-700">Status XML:</p>
            <p className="font-semibold">
             <Badge variant="destructive">{selectedSale.xml_status}</Badge>
            </p>
           </div>
          )}
         </div>
        </div>
       )}
      </div>
      <DialogFooter>
       <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
        Fechar
       </Button>
      </DialogFooter>
     </DialogContent>
    </Dialog>
   </>
 );
};

export default AdminCancelSales;
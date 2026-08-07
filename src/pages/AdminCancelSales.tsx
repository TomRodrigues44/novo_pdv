import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import AdminSidebar from "@/components/AdminSidebar";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import {
 AlertCircle,
 Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Sale {
 id: number;
 daily_sale_number: number;
 created_at: string;
 total_amount: string;
 status: string;
 fiscal_model: string;
 items: any[];
}

const AdminCancelSales = () => {
 const { getSalesReport } = useAdmin();
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const report = getSalesReport(90);

 // Filtrar vendas que podem ser canceladas (abertas, orçamentos, etc.)
 const cancellableSales = report.sales.filter((sale: Sale) => {
 const status = sale.status?.toLowerCase() || "";
 const model = sale.fiscal_model?.toLowerCase() || "";
 return (
  status === "aberta" ||
  status === "aberta (orçamento)" ||
  status === "aberta (nfce)" ||
  status === "aberta (nfe)" ||
  model.includes("orçamento") ||
  model.includes("orcamento")
 );
 });

 const handleCancelSale = async () => {
  if (!selectedSale) return;
  
  if (password !== confirmPassword) {
   toast.error("As senhas não coincidem!");
   return;
  }

  setIsSubmitting(true);

  try {
   const response = await fetch(`/api/sales/${selectedSale.id}/cancel`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     password: password,
    }),
   });

   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Falha ao cancelar a venda");
   }

   toast.success("Venda cancelada com sucesso!");
   setPassword("");
   setConfirmPassword("");
   setSelectedSale(null);
  } catch (error) {
   toast.error(error instanceof Error ? error.message : "Erro ao cancelar a venda");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleOpenCancelForm = (sale: Sale) => {
  setSelectedSale(sale);
  setPassword("");
  setConfirmPassword("");
 };

 const handleCloseForm = () => {
  setSelectedSale(null);
  setPassword("");
  setConfirmPassword("");
 };

 return (
  <>
   <div className="flex">
    <AdminSidebar />
    <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">
     <div className="mb-8">
      <h1 className="text-3xl font-bold">Cancelar Vendas</h1>
      <p className="text-gray-600 mt-2">
       Selecione uma venda para cancelar. Apenas vendas em status "aberta" podem ser canceladas.
      </p>
     </div>

     <Card>
      <CardHeader>
       <CardTitle>Vendas Pendentes de Cancelamento</CardTitle>
      </CardHeader>
      <CardContent>
       {cancellableSales.length === 0 ? (
        <div className="text-center py-8">
         <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
         <p className="text-gray-500">Nenhuma venda pendente de cancelamento encontrada.</p>
        </div>
       ) : (
        <div className="overflow-x-auto">
         <Table>
          <TableHeader>
           <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
           </TableRow>
          </TableHeader>
          <TableBody>
           {cancellableSales.map((sale: Sale) => (
            <TableRow key={sale.id} className="hover:bg-gray-50">
             <td>{new Date(sale.created_at).toLocaleString("pt-BR")}</td>
             <td className="font-medium">#{sale.daily_sale_number || String(sale.id).slice(-6)}</td>
             <td>
              {sale.fiscal_model === "NFCe" ? "NFC-e" :
               sale.fiscal_model === "NFe" ? "NF-e" :
               sale.fiscal_model === "Orcamento" ? "Orçamento" :
               sale.fiscal_model || "Venda"}
             </td>
             <td className="font-bold text-green-600">
              R$ {parseFloat(sale.total_amount || 0).toFixed(2)}
             </td>
             <td className="text-right">
              <Button
               variant="destructive"
               size="sm"
               onClick={() => handleOpenCancelForm(sale)}
              >
               Cancelar
              </Button>
             </td>
            </TableRow>
           ))}
          </TableBody>
         </Table>
        </div>
       )}
      </CardContent>
     </Card>
    </div>
   </div>

   {/* Modal de Cancelamento */}
   {selectedSale && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
     <Card className="w-full max-w-md mx-4">
      <CardHeader>
       <CardTitle>Confirmar Cancelamento</CardTitle>
       <p className="text-sm text-gray-500">
        Venda #{selectedSale.daily_sale_number || String(selectedSale.id).slice(-6)}
       </p>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="password">Senha de Cancelamento</Label>
        <Input
         type="password"
         id="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         placeholder="Digite a senha"
         autoComplete="off"
        />
       </div>
       <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <Input
         type="password"
         id="confirmPassword"
         value={confirmPassword}
         onChange={(e) => setConfirmPassword(e.target.value)}
         placeholder="Confirme a senha"
         autoComplete="off"
        />
       </div>
       <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleCloseForm}>
         Cancelar
        </Button>
        <Button
         variant="destructive"
         onClick={handleCancelSale}
         disabled={isSubmitting}
        >
         {isSubmitting ? (
          <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           Cancelando...
          </>
         ) : (
          "Confirmar Cancelamento"
         )}
        </Button>
       </div>
      </CardContent>
     </Card>
    </div>
   )}
  </>
 );
};

export default AdminCancelSales;
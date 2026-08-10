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
import {
 AlertCircle,
 Loader2,
 Lock,
} from "lucide-react";
import { toast } from "sonner";

const AdminCancelSales = () => {
  const { getSalesReport, refreshData } = useAdmin();
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelPassword, setCancelPassword] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelPasswordConfigured, setCancelPasswordConfigured] = useState(false);

  const report = getSalesReport(90);

  // Verificar se a senha de cancelamento está configurada
  useEffect(() => {
    const checkCancelPassword = async () => {
      try {
        const response = await fetch('/api/cancel-password');
        if (response.ok) {
          const data = await response.json();
          setCancelPasswordConfigured(data.configured);
        }
      } catch (error) {
        console.error('Error checking cancel password:', error);
      }
    };
    checkCancelPassword();
  }, []);

  const cancellableSales = report.sales.filter((sale: any) => {
    const status = sale.status?.toLowerCase() || "";
    const model = sale.fiscal_model?.toLowerCase() || "";
    const isCancelled = sale.status === 'cancelled' || sale.xml_status === 'cancelled';
    
    if (isCancelled) return false;
    
    return (
      status === "aberta" ||
      status === "aberta (orçamento)" ||
      status === "aberta (nfce)" ||
      status === "aberta (nfe)" ||
      status === "concluída" ||
      status === "concluida" ||
      status === "finalizada" ||
      status === "finalizado" ||
      model.includes("orçamento") ||
      model.includes("orcamento")
    );
  });

  const handleCancelClick = (sale: any) => {
    setSelectedSale(sale);
    setCancelDialogOpen(true);
    setCancelPassword("");
  };

  const handleCancelSale = async () => {
    if (!cancelPassword) {
      toast.error("Senha de cancelamento é obrigatória!");
      return;
    }

    if (!cancelPasswordConfigured) {
      toast.error("Senha de cancelamento não configurada. Configure uma senha de cancelamento em Configurações Fiscais.");
      return;
    }

    setCancelLoading(true);

    try {
      // Primeiro, tentar cancelamento fiscal se for NFe ou NFCe
      if (selectedSale.fiscal_model === "NFe" || selectedSale.fiscal_model === "NFCe") {
        const cancelFiscalResponse = await fetch(`/api/fiscal/${selectedSale.id}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: cancelPassword,
          }),
        });

        if (!cancelFiscalResponse.ok) {
          const error = await cancelFiscalResponse.json();
          throw new Error(error.statusMessage || error.message || "Falha ao cancelar fiscalmente");
        }
      }

      // Depois, cancelar a venda no sistema
      const response = await fetch(`/api/sales/${selectedSale.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: cancelPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.statusMessage || error.message || "Falha ao cancelar a venda");
      }

      toast.success("Venda cancelada com sucesso!");
      setCancelDialogOpen(false);
      
      // Atualizar os dados após cancelamento
      await refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar a venda");
    } finally {
      setCancelLoading(false);
    }
  };

  const cancellableSales = report.sales.filter((sale: any) => {
    const status = sale.status?.toLowerCase() || "";
    const model = sale.fiscal_model?.toLowerCase() || "";
    const isCancelled = sale.status === 'cancelled' || sale.xml_status === 'cancelled';
    
    if (isCancelled) return false;
    
    return (
      status === "aberta" ||
      status === "aberta (orçamento)" ||
      status === "aberta (nfce)" ||
      status === "aberta (nfe)" ||
      status === "concluída" ||
      status === "concluida" ||
      status === "finalizada" ||
      status === "finalizado" ||
      model.includes("orçamento") ||
      model.includes("orcamento")
    );
  });

  const handleCancelClick = (sale: any) => {
    setSelectedSale(sale);
    setCancelDialogOpen(true);
    setCancelPassword("");
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cancelar Vendas</h1>
          <p className="text-gray-600 mt-2">
            Selecione uma venda para cancelar. Apenas vendas em status "aberta" ou "concluída" podem ser canceladas.
          </p>
          {!cancelPasswordConfigured && (
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Atenção</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Configure uma senha de cancelamento em <span className="font-medium">Configurações Fiscais → Senha de Cancelamento</span> antes de cancelar vendas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendas Pendentes de Cancelamento</CardTitle>
          </CardHeader>
          <CardContent>
            {cancellableSales.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Nenhuma venda pendente de cancelamento encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Data</th>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Tipo</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancellableSales.map((sale: any) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(sale.created_at).toLocaleString("pt-BR")}</td>
                        <td className="p-3 font-medium">#{sale.daily_sale_number || String(sale.id).slice(-6)}</td>
                        <td>
                          {sale.fiscal_model === "NFCe" ? "NFC-e" :
                           sale.fiscal_model === "NFe" ? "NF-e" :
                           sale.fiscal_model === "Orcamento" ? "Orçamento" :
                           sale.fiscal_model || "Venda"}
                        </td>
                        <td className="p-3 text-right font-bold text-green-600">
                          R$ {parseFloat(sale.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(sale)}
                          >
                            Cancelar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Diálogo de Cancelamento Simplificado */}
    <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogDescription>
            Venda #{selectedSale?.daily_sale_number || String(selectedSale?.id)?.slice(-6)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-password">Senha de Cancelamento</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                id="cancel-password"
                value={cancelPassword}
                onChange={(e) => setCancelPassword(e.target.value)}
                placeholder="Digite a senha de cancelamento"
                autoComplete="off"
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSale}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </div>
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCancelSales;
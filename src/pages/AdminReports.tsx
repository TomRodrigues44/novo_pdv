import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import AdminSidebar from "@/components/AdminSidebar";
import { ReceiptDialog } from "@/components/DocumentDialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Download,
  Printer,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const AdminReports = () => {
  const { getSalesReport } = useAdmin();
  const [days, setDays] = useState(7);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [nfceData, setNfceData] = useState(null);

  const report = getSalesReport(days);

  const handlePrintClick = async (sale: any) => {
    setLoadingReceipt(true);
    setSelectedSale(sale);
    setNfceData(null); // Reset previous NFC-e data

    try {
      // Check if there's an associated NFC-e
      if (sale.xml_status === 'autorizada' && sale.id) {
        const response = await fetch(`/api/nfce/${sale.id}`);
        if (response.ok) {
          const nfce = await response.json();
          setNfceData(nfce);
        }
      }
    } catch (error) {
      console.error("Failed to fetch NFC-e data for reprinting:", error);
      toast.error("Não foi possível carregar os dados da NFC-e para reimpressão.");
    } finally {
      setIsReceiptOpen(true);
      setLoadingReceipt(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ["Data", "ID", "Total", "Itens"].join(","),
      ...report.sales.map((sale) =>
        [
          new Date(sale.created_at).toLocaleString("pt-BR"),
          String(sale.id),
          parseFloat(sale.total_amount || 0).toFixed(2),
          sale.items.length,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${days}-dias.csv`;
    link.click();
  };

  return (
    <>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <div className="flex gap-4">
              <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último dia</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Vendas
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-500">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report.totalSales}</div>
                <p className="text-sm text-gray-500 mt-1">
                  nos últimos {days} dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Receita Total
                </CardTitle>
                <div className="p-2 rounded-full bg-green-500">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {report.totalRevenue.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  nos últimos {days} dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Itens Vendidos
                </CardTitle>
                <div className="p-2 rounded-full bg-orange-500">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{report.totalItems}</div>
                <p className="text-sm text-gray-500 mt-1">
                  nos últimos {days} dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {report.sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma venda registrada
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Data</th>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Itens</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-right p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {new Date(sale.created_at).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 font-medium">
                            #{String(sale.id).slice(-6)}
                          </td>
                          <td className="p-3">{sale.items.length} itens</td>
                          <td className="p-3 text-right font-bold text-green-600">
                            R$ {parseFloat(sale.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintClick(sale)}
                              disabled={loadingReceipt && selectedSale?.id === sale.id}
                            >
                              {loadingReceipt && selectedSale?.id === sale.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Printer className="h-4 w-4" />
                              )}
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
      {selectedSale && (
        <ReceiptDialog
          open={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          total={parseFloat(selectedSale.total_amount || 0)}
          cartItems={selectedSale.items || []}
          payments={selectedSale.payments || []}
          documentType={selectedSale.xml_status === 'autorizada' ? 'fiscal' : 'quote'}
          saleId={String(selectedSale.id)}
          nfceData={nfceData}
        />
      )}
    </>
  );
};

export default AdminReports;
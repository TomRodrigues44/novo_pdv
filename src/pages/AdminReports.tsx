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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Download,
} from "lucide-react";

const AdminReports = () => {
  const { getSalesReport, products } = useAdmin();
  const [days, setDays] = useState(7);

  const report = getSalesReport(days);

  const categoryNames: { [key: string]: string } = {
    salgados: "Salgados",
    bolos: "Bolos",
    brigadeiros: "Brigadeiros",
    bebidas: "Bebidas",
    combos: "Combos",
    diversos: "Diversos",
  };

  const exportReport = () => {
    const csvContent = [
      ["Data", "ID", "Total", "Itens"].join(","),
      ...report.sales.map((sale) =>
        [
          new Date(sale.created_at).toLocaleString("pt-BR"),
          String(sale.id),
          parseFloat(sale.total_amount || sale.total || 0).toFixed(2),
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

        {/* Sales by Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(report.salesByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma venda registrada
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(report.salesByCategory).map(([categoryId, revenue]) => (
                  <div key={categoryId} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {categoryNames[categoryId] || categoryId}
                      </span>
                      <span className="font-bold text-green-600">
                        R$ {(revenue as number).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${((revenue as number) / report.totalRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                          R$ {parseFloat(sale.total_amount || sale.total || 0).toFixed(2)}
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
  );
};

export default AdminReports;
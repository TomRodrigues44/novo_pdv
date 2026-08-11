import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { useState } from "react";

const AdminKitchen = () => {
  const { getSalesReport } = useAdmin();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getSalesReport(7);
        setReport(data);
      } catch (error) {
        console.error("Error fetching sales report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Vendas (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {report ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Total de Vendas: {report.totalSales}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">
                    Receita Total: R$ {report.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {report.sales?.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      Venda #{String(sale.id).slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleString("pt-BR")}
                    </p>
                    <p className="font-bold text-green-600">
                      R$ {parseFloat(sale.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          } : (
            <p className="text-center">Carregando...</p>
          )
        </>
      </Card>
    </div>
  );
};

export default AdminKitchen;
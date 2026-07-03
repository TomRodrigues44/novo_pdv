import { useAdmin } from "@/hooks/use-admin";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Tags,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const Admin = () => {
  const { products, categories, getSalesReport, getLowStockProducts } = useAdmin();

  const report = getSalesReport(7);
  const lowStockProducts = getLowStockProducts(5);

  const stats = [
    {
      title: "Total de Produtos",
      value: products.length,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Categorias",
      value: categories.length,
      icon: Tags,
      color: "bg-purple-500",
    },
    {
      title: "Vendas (7 dias)",
      value: report.totalSales,
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Receita (7 dias)",
      value: `R$ ${report.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Alerta de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-2 bg-white rounded"
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-red-600 font-bold">
                      Estoque: {product.stock || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {report.sales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma venda registrada nos últimos 7 dias
              </p>
            ) : (
              <div className="space-y-4">
                {report.sales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Venda #{String(sale.id).slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {parseFloat(sale.total_amount || sale.total || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sale.items.length} itens
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
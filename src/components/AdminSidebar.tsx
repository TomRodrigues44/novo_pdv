import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  BarChart3,
  ShoppingCart,
  Settings,
  LogOut,
  ChefHat,
  Users,
  DollarSign,
  Motorcycle,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Produtos" },
    { path: "/admin/categories", icon: Tags, label: "Categorias" },
    { path: "/admin/customers", icon: Users, label: "Clientes" },
    { path: "/admin/motoboys", icon: Motorcycle, label: "Motoboys" },
    { path: "/admin/cash-register", icon: DollarSign, label: "Fluxo de Caixa" },
    { path: "/admin/reports", icon: BarChart3, label: "Relatórios" },
    { path: "/kitchen", icon: ChefHat, label: "Cozinha" },
    { path: "/", icon: ShoppingCart, label: "Ir para PDV" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Admin Panel
        </h2>
        <p className="text-gray-400 text-sm mt-1">Empório das Coxinhas</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === item.path
                ? "bg-orange-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import {
 LayoutDashboard, Package, Tags, BarChart3, ShoppingCart, Settings, LogOut,
 ChefHat, Users, DollarSign, Bike, Shield, FileText, FilePlus2, WifiOff,
 Trash2, FileX,
} from "lucide-react";

const AdminSidebar = () => {
 const location = useLocation();
 const { user, logout } = useAuth();

 const menuItems: { path: string; icon: any; label: string; roles: UserRole[] }[] = [
 { path: "/admin", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager"] },
 { path: "/admin/products", icon: Package, label: "Produtos", roles: ["admin", "manager"] },
 { path: "/admin/categories", icon: Tags, label: "Categorias", roles: ["admin", "manager"] },
 { path: "/admin/customers", icon: Users, label: "Clientes", roles: ["admin", "manager", "cashier"] },
 { path: "/admin/motoboys", icon: Bike, label: "Motoboys", roles: ["admin", "manager", "cashier"] },
 { path: "/admin/cash-register", icon: DollarSign, label: "Fluxo de Caixa", roles: ["admin", "manager", "cashier"] },
 { path: "/admin/reports", icon: BarChart3, label: "Relatórios", roles: ["admin", "manager", "cashier"] }, 
 { path: "/admin/cancelar", icon: FileX, label: "Notas Canceladas", roles: ["admin", "manager", "cashier"] }, 
 { path: "/admin/fiscal", icon: Shield, label: "Configurações Fiscais", roles: ["admin"] },
 { path: "/admin/nfe", icon: FilePlus2, label: "Emitir NF-e", roles: ["admin", "manager", "cashier"] }, 
 { path: "/admin/xmls", icon: FileText, label: "XMLs Fiscais", roles: ["admin", "manager", "cashier"] }, 
 { path: "/admin/contingency", icon: WifiOff, label: "Contingência", roles: ["admin", "manager", "cashier"] }, 
 { path: "/admin/users", icon: Users, label: "Usuários e Perfis", roles: ["admin"] },
 { path: "/kitchen", icon: ChefHat, label: "Cozinha", roles: ["admin", "manager", "cashier"] }, 
 { path: "/", icon: ShoppingCart, label: "Ir para PDV", roles: ["admin", "manager", "cashier"] },
 ];

 const visibleItems = menuItems.filter((item) => user && item.roles.includes(user.role));

 return (
 <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 p-4 text-white overflow-y-auto">
 <div className="mb-8">
 <h2 className="flex items-center gap-2 text-xl font-bold"><Settings className="h-6 w-6" /> Admin Panel</h2>
 <p className="mt-1 text-sm text-gray-400">Empório das Coxinhas</p>
 {user && <p className="mt-3 rounded bg-gray-800 px-3 py-2 text-xs text-gray-300">{user.name} · {user.roleLabel}</p>}
 </div>
 <nav className="space-y-2">
 {visibleItems.map((item) => (
 <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 rounded-lg px-4 py-3 transition-colors", location.pathname === item.path ? "bg-orange-600 text-white" : "text-gray-300 hover:bg-gray-800")}>
 <item.icon className="h-5 w-5" />{item.label}
 </Link>
 ))}
 </nav>
 <button onClick={() => logout()} className="mt-4 w-full flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800">
 <LogOut className="h-5 w-5" />Sair
 </button>
 </aside>
 };
};

export default AdminSidebar;
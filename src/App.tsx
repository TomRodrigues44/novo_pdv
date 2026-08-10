import { Navigate, BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth, type UserRole } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import AdminReports from "./pages/AdminReports";
import AdminCustomers from "./pages/AdminCustomers";
import AdminMotoboys from "./pages/AdminMotoboys";
import AdminFiscal from "./pages/AdminFiscal";
import AdminNfe from "./pages/AdminNfe";
import AdminXmls from "./pages/AdminXmls";
import AdminContingency from "./pages/AdminContingency";
import AdminUsers from "./pages/AdminUsers";
import Kitchen from "./pages/Kitchen";
import CashRegister from "./pages/CashRegister";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/kitchen" element={<ProtectedRoute roles={["admin", "manager"]}><Kitchen /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute roles={["admin", "manager"]}><Admin /></ProtectedRoute>} />
    <Route path="/admin/categories" element={<ProtectedRoute roles={["admin", "manager"]}><AdminCategories /></ProtectedRoute>} />
    <Route path="/admin/products" element={<ProtectedRoute roles={["admin", "manager"]}><AdminProducts /></ProtectedRoute>} />
    <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
    <Route path="/admin/motoboys" element={<ProtectedRoute><AdminMotoboys /></ProtectedRoute>} />
    <Route path="/admin/cash-register" element={<ProtectedRoute><CashRegister /></ProtectedRoute>} />
    <Route path="/admin/reports" element={<ProtectedRoute roles={["admin", "manager"]}><AdminReports /></ProtectedRoute>} />
    <Route path="/admin/fiscal" element={<ProtectedRoute roles={["admin"]}><AdminFiscal /></ProtectedRoute>} />
    <Route path="/admin/nfe" element={<ProtectedRoute roles={["admin", "manager"]}><AdminNfe /></ProtectedRoute>} />
    <Route path="/admin/xmls" element={<ProtectedRoute roles={["admin", "manager"]}><AdminXmls /></ProtectedRoute>} />
    <Route path="/admin/contingency" element={<ProtectedRoute roles={["admin", "manager"]}><AdminContingency /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter><AppRoutes /></BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
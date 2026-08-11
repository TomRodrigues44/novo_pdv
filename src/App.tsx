import { Navigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Server } from "node:http";
import { sql } from "@/lib/db";
import routes from "./routes"; // Assuming you have a routes file

const AuthCallback = () => {
  const { user, loading } = useAuth();
  const { isLoading } = useQuery({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      return response.json();
    },
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return <></>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/kitchen" element={<AdminKitchen />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/cancelar" element={<AdminCancelSales />} />
      <Route path="/admin/fiscal" element={<AdminFiscal />} />
      <Route path="/admin/xmls" element={<AdminXmls />} />
      <Route path="/admin/contingency" element={<AdminContingency />} />
      <Route path="/admin/motoboys" element={<AdminMotoboys />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/cash-register" element={<CashRegister />} />
      {/* Add other admin routes as needed */}
    </Routes>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Toaster />
        <Routes>
          <Route element={<AuthCallback />}>
            <Routes>
              {/* Existing routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/kitchen" element={<AdminKitchen />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/cancelar" element={<AdminCancelSales />} />
              <Route path="/admin/fiscal" element={<AdminFiscal />} />
              <Route path="/admin/xmls" element={<AdminXmls />} />
              <Route path="/admin/contingency" element={<AdminContingency />} />
              <Route path="/admin/motoboys" element={<AdminMotoboys />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/cash-register" element={<CashRegister />} />
              {/* Add other admin routes */}
            </Routes>
          </Routes>
        </QueryClientProvider>
      </QueryClientProvider>
    </>
  );
}
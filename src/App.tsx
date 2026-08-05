import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
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
import Kitchen from "./pages/Kitchen";
import CashRegister from "./pages/CashRegister";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/motoboys" element={<AdminMotoboys />} />
            <Route path="/admin/cash-register" element={<CashRegister />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/fiscal" element={<AdminFiscal />} />
            <Route path="/admin/nfe" element={<AdminNfe />} />
            <Route path="/admin/xmls" element={<AdminXmls />} />
            <Route path="/admin/contingency" element={<AdminContingency />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
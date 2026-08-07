import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  User,
  Phone,
  MapPin,
  Mail,
  Star,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  points: number;
  total_spent: number;
  total_orders: number;
  created_at: string;
}

interface CustomerHistory {
  customer: Customer;
  sales: any[];
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] =
    useState<CustomerHistory | null>(null);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // useEffect(() => {
  //   fetchCustomers();
  // }, []);

  // Using useEffect instead of useState for the fetch
  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewHistory = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customer.id}/sales`);
      if (response.ok) {
        const sales = await response.json();
        setSelectedCustomerHistory({ customer, sales });
        setIsHistoryDialogOpen(true);
      }
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Calcular totais convertendo para número
  const totalPoints = customers.reduce(
    (sum, c) => sum + (parseFloat(String(c.points)) || 0),
    0
  );
  const totalSpent = customers.reduce(
    (sum, c) => sum + (parseFloat(String(c.total_spent)) || 0),
    0
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Clientes
              </CardTitle>
              <div className="p-2 rounded-full bg-blue-500">
                <User className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pontos Distribuídos
              </CardTitle>
              <div className="p-2 rounded-full bg-yellow-500">
                <Star className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Gasto
              </CardTitle>
              <div className="p-2 rounded-full bg-green-500">
                <History className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {totalSpent.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum cliente encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Tente buscar com outro termo</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead className="text-right">Histórico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {customer.phone || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {customer.address || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{customer.points || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          R$ {(parseFloat(String(customer.total_spent)) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{customer.total_orders || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(customer)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Compras - {selectedCustomerHistory?.customer?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {selectedCustomerHistory?.sales?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma compra registrada
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCustomerHistory?.sales?.map((sale: any) => (
                    <Card key={sale.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              Pedido #{String(sale.id).slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(sale.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              R$ {(parseFloat(String(sale.total_amount || sale.total || 0))).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">{sale.payment_method}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sale.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product_name}</span>
                              <span>R$ {(parseFloat(String(item.price)) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCustomers;
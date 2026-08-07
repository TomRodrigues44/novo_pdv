import { useState, useEffect } from "react";
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
  DialogFooter,
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
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Phone,
  MapPin,
  Mail,
  Star,
  History,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FilterableDropdown } from "@/components/FilterableDropdown";

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
  // Campos fiscais/endereço
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  codigo_municipio?: string;
}

interface CustomerForm {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  cpf_cnpj: string;
  inscricao_estadual: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  codigo_municipio: string;
  points: number;
  total_spent: number;
}

const emptyCustomerForm: CustomerForm = {
  id: '', name: '', phone: '', address: '', email: '', cpf_cnpj: '', inscricao_estadual: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: 'RR', codigo_municipio: '1400100',
  points: 0, total_spent: 0,
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [formData, setFormData] = useState<CustomerForm>(emptyCustomerForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Garantir schema antes de buscar
    fetch('/api/customers/ensure-schema', { method: 'POST' })
      .catch(() => console.warn('Não foi possível garantir schema'))
      .finally(() => {
        fetchCustomers();
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = formData.id ? `/api/customers/${formData.id}` : '/api/customers';
      const method = formData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id || `cust-${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          address: `${formData.logradouro}, ${formData.numero}${formData.complemento ? ` - ${formData.complemento}` : ''}`,
          email: formData.email,
          cpf_cnpj: formData.cpf_cnpj,
          inscricao_estadual: formData.inscricao_estadual,
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          municipio: formData.municipio,
          uf: formData.uf,
          codigo_municipio: formData.codigo_municipio,
          points: formData.points || 0,
          total_spent: formData.total_spent || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.statusMessage || 'Erro ao salvar cliente');
      }

      const savedCustomer = await response.json();
      setCustomers((current) => {
        const existingIndex = current.findIndex((entry) => String(entry.id) === String(savedCustomer.id));
        if (existingIndex >= 0) {
          const updated = [...current];
          updated[existingIndex] = savedCustomer;
          return updated;
        }
        return [...current, savedCustomer];
      });

      toast.success(formData.id ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      setIsDialogOpen(false);
      setFormData(emptyCustomerForm);
      setIsEditingCustomer(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar cliente.');
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      email: customer.email || '',
      cpf_cnpj: customer.cpf_cnpj || '',
      inscricao_estadual: customer.inscricao_estadual || '',
      cep: customer.cep || '',
      logradouro: customer.logradouro || '',
      numero: customer.numero || '',
      complemento: customer.complemento || '',
      bairro: customer.bairro || '',
      municipio: customer.municipio || '',
      uf: customer.uf || 'RR',
      codigo_municipio: customer.codigo_municipio || (customer.uf === 'RR' ? '1400100' : ''),
      points: customer.points || 0,
      total_spent: customer.total_spent || 0,
    });
    setIsEditingCustomer(true);
    setIsDialogOpen(true);
  };

  const handleNewCustomer = () => {
    setFormData(emptyCustomerForm);
    setIsEditingCustomer(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Cliente excluído com sucesso!');
          fetchCustomers();
        }
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const handleViewHistory = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/customers/${customer.id}/sales`);
      if (response.ok) {
        const sales = await response.json();
        setSelectedCustomerHistory({ customer, sales });
        setIsHistoryDialogOpen(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Calcular totais convertendo para número
  const totalPoints = customers.reduce((sum, c) => sum + (parseFloat(String(c.points)) || 0), 0);
  const totalSpent = customers.reduce((sum, c) => sum + (parseFloat(String(c.total_spent)) || 0), 0);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            {/* Botão igual ao do AdminNfe - laranja com Plus */}
            <Button
              onClick={handleNewCustomer}
              className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
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
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : filteredCustomers.length === 0 ? (
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
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Total Gasto</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {customer.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {customer.address || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{customer.cpf_cnpj || "-"}</TableCell>
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
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewHistory(customer)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => handleEdit(customer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              title="Editar cliente"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                            <p className="font-semibold">Pedido #{String(sale.id).slice(-6)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(sale.created_at).toLocaleString('pt-BR')}
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

        {/* Customer Form Dialog - Igual ao AdminNfe */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium mb-2">Nome / Razão Social *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">CPF ou CNPJ *</label>
                <Input
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Inscrição Estadual</label>
                <Input
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">CEP *</label>
                <Input
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium mb-2">Logradouro *</label>
                <Input
                  value={formData.logradouro}
                  onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Número *</label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Complemento</label>
                <Input
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Bairro *</label>
                <Input
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Município *</label>
                <Input
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">UF *</label>
                <Input
                  maxLength={2}
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Código IBGE do município *</label>
                <Input
                  value={formData.codigo_municipio}
                  onChange={(e) => setFormData({ ...formData, codigo_municipio: e.target.value })}
                  required
                />
              </div>
              {/* Campos de pontuação - visíveis apenas em edição */}
              {isEditingCustomer && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Pontos</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Total Gasto</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_spent}
                      onChange={(e) => setFormData({ ...formData, total_spent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700" type="submit" form={undefined} onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCustomers;
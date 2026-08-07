import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileCheck2, Loader2, PackagePlus, Plus, Search, Trash2, Truck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { DanfeDialog } from '@/components/DanfeDialog';

interface Product {
  id: string;
  name: string;
  price: number | string;
  stock?: number;
  category: string;
  fiscal?: Record<string, any> | string;
}

interface CustomerForm {
  id: string;
  name: string;
  cpf_cnpj: string;
  inscricao_estadual: string;
  phone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  codigo_municipio: string;
}

interface SelectedItem {
  product: Product;
  quantity: number;
}

interface Payment {
  id: number;
  type: string;
  amount: number;
}

const emptyCustomer: CustomerForm = {
  id: '',
  name: '',
  cpf_cnpj: '',
  inscricao_estadual: '',
  phone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  uf: 'RR',
  codigo_municipio: '1400100',
};

const paymentLabels: Record<string, string> = {
  cash: 'Dinheiro', pix: 'PIX', credit: 'Cartão de Crédito', debit: 'Cartão de Débito',
  boleto: 'Boleto', bank_transfer: 'Transferência Bancária', other: 'Outros',
};

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fiscalData = (product: Product) => {
  if (typeof product.fiscal === 'string') {
    try { return JSON.parse(product.fiscal); } catch { return {}; }
  }
  return product.fiscal || {};
};

const AdminNfe = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [freight, setFreight] = useState(0);
  const [freightMode, setFreightMode] = useState('9');
  const [payments, setPayments] = useState<Payment[]>([{ id: Date.now(), type: 'cash', amount: 0 }]);
  const [loading, setLoading] = useState(true);
  const [emitting, setEmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [motoboys, setMotoboys] = useState<{ id: string; name: string; phone?: string }[]>([]);
  const [selectedMotoboy, setSelectedMotoboy] = useState<{ id: string; name: string } | null>(null);
  const [isDanfeOpen, setIsDanfeOpen] = useState(false);
  const [fiscalEnv, setFiscalEnv] = useState<string>('homologacao');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerForm>(emptyCustomer);

  useEffect(() => {
    fetch('/api/fiscal/company-config')
      .then((res) => res.json())
      .then((data) => setFiscalEnv(data?.ambiente || 'homologacao'))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([fetch('/api/products'), fetch('/api/customers'), fetch('/api/motoboys')])
      .then(async ([productsResponse, customersResponse, motoboysResponse]) => {
        if (!productsResponse.ok || !customersResponse.ok) throw new Error('Falha ao carregar dados');
        const [productsData, customersData, motoboysData] = await Promise.all([
          productsResponse.json(),
          customersResponse.json(),
          motoboysResponse.ok ? motoboysResponse.json() : [],
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setMotoboys(Array.isArray(motoboysData) ? motoboysData : []);
      })
      .catch(() => toast.error('Não foi possível carregar clientes e produtos'))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase()) ||
    entry.cpf_cnpj?.includes(search)
  );

  const selectCustomer = (id: string) => {
    if (id === 'new') {
      setCustomer(emptyCustomer);
      setShowCustomerForm(true);
      return;
    }

    const selected = customers.find((entry) => String(entry.id) === id);
    if (!selected) return;

    setCustomer({
      id: String(selected.id),
      name: selected.name || '',
      cpf_cnpj: selected.cpf_cnpj || '',
      inscricao_estadual: selected.inscricao_estadual || '',
      phone: selected.phone || '',
      email: selected.email || '',
      cep: selected.cep || '',
      logradouro: selected.logradouro || '',
      numero: selected.numero || '',
      complemento: selected.complemento || '',
      bairro: selected.bairro || '',
      municipio: selected.municipio || '',
      uf: selected.uf || 'RR',
      codigo_municipio: selected.codigo_municipio || (selected.uf === 'RR' ? '1400100' : ''),
    });
  };

  const handleCustomerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `cust-${Date.now()}`,
          ...customerForm,
        }),
      });

      if (response.ok) {
        toast.success('Cliente cadastrado com sucesso!');
        setShowCustomerForm(false);
        selectCustomer('new');
      }
    } catch (error) {
      toast.error('Erro ao cadastrar cliente');
    }
  };

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }
      return [...current, { product, quantity: 1 }];
    });
    setSearch('');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const addPayment = () => {
    setPayments((current) => [...current, {
      id: Date.now(),
      type: 'pix',
      amount: Math.max(total - current.reduce((sum, payment) => sum + payment.amount, 0), 0),
    }]);
  };

  const emitNfe = async () => {
    if (freight > 0 && !selectedMotoboy) {
      toast.error('Selecione um motoboy para a entrega com frete.');
      return;
    }

    setEmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/nfe/emitir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          freight,
          freightMode,
          payments: payments.map(({ type, amount }) => ({ type, amount })),
          motoboy: selectedMotoboy,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.statusMessage || data.message || 'Erro ao emitir NF-e');

      setResult(data);
      setIsDanfeOpen(true);
      toast.success('NF-e autorizada e DANFE gerado!');

      if (data.sangriaCreated) {
        toast.info('Sangria de frete registrada no fluxo de caixa.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao emitir NF-e.');
    } finally {
      setEmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="ml-64 flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </main>
      </div>
    );
  }

  const productsTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  );
  const total = productsTotal + freight;
  const paymentsTotal = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const remaining = total - paymentsTotal;

  useEffect(() => {
    if (payments.length === 1) {
      setPayments((current) => [{ ...current[0], amount: total }]);
    }
  }, [total, payments.length]);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 min-h-screen flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <FileCheck2 className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold">Emissão de NF-e</h1>
                <Badge variant="secondary">Modelo 55</Badge>
                {fiscalEnv === 'producao' ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Produção</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Homologação / Simulação</Badge>
                )}
              </div>
              <p className="mt-2 text-gray-600">
                A NF-e é assinada digitalmente e enviada para a SEFAZ. A venda só é registrada após a autorização.
              </p>
            </div>
          </div>

          {/* Adicionando botão de cliente e campo de busca */}
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6" />
            <Input
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Buscar cliente por nome ou CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                selectCustomer('new');
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded"
            >
              Novo Cliente
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> 1. Destinatário</CardTitle>
              <CardDescription>Selecione um cliente ou preencha um novo cadastro fiscal completo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xl space-y-2">
                  <Label>Buscar cliente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      placeholder="Digite o nome ou CPF/CNPJ..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  {search && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-white p-2 shadow-lg max-h-64 overflow-y-auto">
                      {filteredCustomers.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-4 rounded p-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            selectCustomer(String(entry.id));
                            setSearch('');
                          }}
                        >
                          <div><p className="font-medium">{entry.name}</p><p className="text-xs text-gray-500">{entry.cpf_cnpj ? `CPF/CNPJ: ${entry.cpf_cnpj}` : ''}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="max-w-xl space-y-2">
                  <Label>Cliente selecionado</Label>
                  <Select value={customer.id || 'new'} onValueChange={selectCustomer}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Novo Cliente</SelectItem>
                      {customers.map((entry) => (
                        <SelectItem key={entry.id} value={String(entry.id)}>{entry.name} {entry.cpf_cnpj ? `— ${entry.cpf_cnpj}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Formulário de cliente */}
              {showCustomerForm && (
                <div className="fixed top-1/2 right-1/2 w-full max-w-md bg-white shadow-lg z-50">
                  <div className="p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Novo Cliente</h2>
                    <form onSubmit={handleCustomerFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome/Razão Social *</Label>
                        <Input
                          value={customerForm.name}
                          onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF/CNPJ *</Label>
                        <Input
                          value={customerForm.cpf_cnpj}
                          onChange={(e) => setCustomerForm({ ...customerForm, cpf_cnpj: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Inscrição Estadual</Label>
                        <Input
                          value={customerForm.inscricao_estadual}
                          onChange={(e) => setCustomerForm({ ...customerForm, inscricao_estadual: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={customerForm.phone}
                          onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={customerForm.email}
                          onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CEP *</Label>
                        <Input
                          value={customerForm.cep}
                          onChange={(e) => setCustomerForm({ ...customerForm, cep: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Logradouro *</Label>
                        <Input
                          value={customerForm.logradouro}
                          onChange={(e) => setCustomerForm({ ...customerForm, logradouro: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número *</Label>
                        <Input
                          value={customerForm.numero}
                          onChange={(e) => setCustomerForm({ ...customerForm, numero: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input
                          value={customerForm.complemento}
                          onChange={(e) => setCustomerForm({ ...customerForm, complemento: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro *</Label>
                        <Input
                          value={customerForm.bairro}
                          onChange={(e) => setCustomerForm({ ...customerForm, bairro: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Município *</Label>
                        <Input
                          value={customerForm.municipio}
                          onChange={(e) => setCustomerForm({ ...customerForm, municipio: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>UF *</Label>
                        <Input
                          maxLength={2}
                          value={customerForm.uf}
                          onChange={(e) => setCustomerForm({ ...customerForm, uf: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código IBGE *</Label>
                        <Input
                          value={customerForm.codigo_municipio}
                          onChange={(e) => setCustomerForm({ ...customerForm, codigo_municipio: e.target.value })}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        Cadastrar Cliente
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2"><Label>Nome / Razão Social *</Label><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>CPF ou CNPJ *</Label><Input value={customer.cpf_cnpj} onChange={(e) => setCustomer({ ...customer, cpf_cnpj: e.target.value })} /></div>
                <div className="space-y-2"><Label>Inscrição Estadual</Label><Input value={customer.inscricao_estadual} onChange={(e) => setCustomer({ ...customer, inscricao_estadual: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>CEP *</Label><Input value={customer.cep} onChange={(e) => setCustomer({ ...customer, cep: e.target.value })} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Logradouro *</Label><Input value={customer.logradouro} onChange={(e) => setCustomer({ ...customer, logradouro: e.target.value })} /></div>
                <div className="space-y-2"><Label>Número *</Label><Input value={customer.numero} onChange={(e) => setCustomer({ ...customer, numero: e.target.value })} /></div>
                <div className="space-y-2"><Label>Complemento</Label><Input value={customer.complemento} onChange={(e) => setCustomer({ ...customer, complemento: e.target.value })} /></div>
                <div className="space-y-2"><Label>Bairro *</Label><Input value={customer.bairro} onChange={(e) => setCustomer({ ...customer, bairro: e.target.value })} /></div>
                <div className="space-y-2"><Label>Município *</Label><Input value={customer.municipio} onChange={(e) => setCustomer({ ...customer, municipio: e.target.value })} /></div>
                <div className="space-y-2"><Label>UF *</Label><Input maxLength={2} value={customer.uf} onChange={(e) => setCustomer({ ...customer, uf: e.target.value.toUpperCase() })} /></div>
                <div className="space-y-2"><Label>Código IBGE *</Label><Input value={customer.codigo_municipio} onChange={(e) => setCustomer({ ...customer, codigo_municipio: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>

          {/* ... (restante do código existente) ... */}
        </div>
      </main>

      {result && (
        <DanfeDialog
          open={isDanfeOpen}
          onClose={() => setIsDanfeOpen(false)}
          nfeData={{
            number: result.nfe.number,
            series: result.nfe.series,
            accessKey: result.nfe.accessKey,
            protocol: result.nfe.protocol,
            status: result.nfe.status,
            environment: result.nfe.environment,
            consultationUrl: result.nfe.consultationUrl,
          }}
          customer={customer}
          items={items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.product.price),
            fiscal: typeof item.product.fiscal === 'string'
              ? (() => { try { return JSON.parse(item.product.fiscal as string); } catch { return {}; } })()
              : item.product.fiscal || {},
          }))}
          payments={payments.map(({ type, amount }) => ({ type, amount }))}
          freight={freight}
          productsTotal={productsTotal}
          total={total}
          motoboy={selectedMotoboy}
        />
      )}
    </div>
  );
};

export default AdminNfe;
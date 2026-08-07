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
  id: '', name: '', cpf_cnpj: '', inscricao_estadual: '', phone: '', email: '', cep: '',
  logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: 'RR', codigo_municipio: '1400100',
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
          productsResponse.json(), customersResponse.json(),
          motoboysResponse.ok ? motoboysResponse.json() : [],
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setMotoboys(Array.isArray(motoboysData) ? motoboysData : []);
      })
      .catch(() => toast.error('Não foi possível carregar clientes e produtos.'))
      .finally(() => setLoading(false));
  }, []);

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

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();
    return term && `${product.name} ${product.category}`.toLowerCase().includes(term);
  }).slice(0, 8);

  const selectCustomer = (id: string) => {
    if (id === 'new') {
      setCustomer(emptyCustomer);
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
        <main className="ml-64 flex min-h-screen flex-1 items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </main>
      </div>
    );
  }

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> 1. Destinatário</CardTitle>
              <CardDescription>Selecione um cliente ou preencha um novo cadastro fiscal completo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="max-w-xl space-y-2">
                <Label>Cliente cadastrado</Label>
                <Select value={customer.id || 'new'} onValueChange={selectCustomer}>
                  <SelectTrigger><SelectValue placeholder="Novo cliente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Novo cliente</SelectItem>
                    {customers.map((entry) => (
                      <SelectItem key={entry.id} value={String(entry.id)}>{entry.name} {entry.cpf_cnpj ? `— ${entry.cpf_cnpj}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                <div className="space-y-2"><Label>Código IBGE do município *</Label><Input value={customer.codigo_municipio} onChange={(e) => setCustomer({ ...customer, codigo_municipio: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5" /> 2. Produtos</CardTitle>
              <CardDescription>Pesquise produtos cadastrados. Produtos sem NCM devem ser corrigidos no cadastro antes da emissão.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Buscar por nome ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-white p-2 shadow-lg">
                    {filteredProducts.map((product) => {
                      const fiscal = fiscalData(product);
                      const fiscalReady = String(fiscal.ncm || '').replace(/\D/g, '').length === 8;
                      return (
                        <div key={product.id} className="flex items-center justify-between gap-4 rounded p-2 hover:bg-gray-50">
                          <div><p className="font-medium">{product.name}</p><p className="text-xs text-gray-500">{currency(Number(product.price))} · Estoque: {product.stock ?? 0} · NCM: {fiscal.ncm || 'não informado'}</p></div>
                          <Button size="sm" disabled={!fiscalReady} onClick={() => addProduct(product)}>{fiscalReady ? 'Adicionar' : 'Fiscal incompleto'}</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">Nenhum produto selecionado.</div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="grid grid-cols-1 items-center gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_130px_140px_44px]">
                      <div><p className="font-semibold">{item.product.name}</p><p className="text-sm text-gray-500">{currency(Number(item.product.price))} por unidade</p></div>
                      <div className="space-y-1"><Label>Quantidade</Label><Input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))} /></div>
                      <div className="text-right font-semibold">{currency(Number(item.product.price) * item.quantity)}</div>
                      <Button variant="ghost" size="icon" onClick={() => setItems((current) => current.filter((entry) => entry.product.id !== item.product.id))}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Pagamento e frete</CardTitle>
              <CardDescription>Informe o frete e distribua o total entre uma ou mais formas de pagamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Valor do frete</Label><Input type="number" min={0} step="0.01" value={freight} onChange={(e) => setFreight(Math.max(Number(e.target.value) || 0, 0))} /></div>
                <div className="space-y-2"><Label>Responsável pelo frete</Label><Select value={freightMode} onValueChange={setFreightMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="9">Sem frete</SelectItem><SelectItem value="0">Frete por conta do emitente</SelectItem><SelectItem value="1">Frete por conta do destinatário</SelectItem></SelectContent></Select></div>
              </div>

              {freight > 0 && (
                <div className="space-y-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <Label className="flex items-center gap-2 text-blue-800"><Truck className="h-4 w-4" /> Selecione o motoboy para a entrega *</Label>
                  <Select
                    value={selectedMotoboy?.id || ''}
                    onValueChange={(value) => {
                      const motoboy = motoboys.find((m) => m.id === value);
                      setSelectedMotoboy(motoboy ? { id: motoboy.id, name: motoboy.name } : null);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione um motoboy" /></SelectTrigger>
                    <SelectContent>
                      {motoboys.map((motoboy) => (
                        <SelectItem key={motoboy.id} value={motoboy.id}>
                          {motoboy.name}{motoboy.phone ? ` — ${motoboy.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_220px_44px]">
                    <div className="space-y-2"><Label>Forma de pagamento</Label><Select value={payment.type} onValueChange={(type) => setPayments((current) => current.map((entry) => entry.id === payment.id ? { ...entry, type } : entry))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(paymentLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Valor</Label><Input type="number" min={0} step="0.01" value={payment.amount} onChange={(e) => setPayments((current) => current.map((entry) => entry.id === payment.id ? { ...entry, amount: Number(e.target.value) || 0 } : entry))} /></div>
                    <Button variant="ghost" size="icon" disabled={payments.length === 1} onClick={() => setPayments((current) => current.filter((entry) => entry.id !== payment.id))}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addPayment}><Plus className="mr-2 h-4 w-4" />Adicionar forma de pagamento</Button>
              </div>

              <div className="ml-auto max-w-md space-y-2 rounded-lg bg-gray-100 p-4">
                <div className="flex justify-between"><span>Produtos</span><span>{currency(productsTotal)}</span></div>
                <div className="flex justify-between"><span>Frete</span><span>{currency(freight)}</span></div>
                <Separator />
                <div className="flex justify-between text-lg font-bold"><span>Total da NF-e</span><span>{currency(total)}</span></div>
                <div className={`flex justify-between text-sm ${Math.abs(remaining) <= 0.01 ? 'text-green-700' : 'text-red-600'}`}><span>Diferença do pagamento</span><span>{currency(remaining)}</span></div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader><CardTitle className="text-green-800">NF-e autorizada em homologação</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>NF-e:</strong> {result.nfe.number} / Série {result.nfe.series}</p>
                <p><strong>Protocolo:</strong> {result.nfe.protocol}</p>
                <p className="break-all"><strong>Chave:</strong> {result.nfe.accessKey}</p>
                <p><strong>Venda:</strong> #{result.sale.id} · <strong>Senha:</strong> {result.sale.dailySaleNumber} · <strong>Total:</strong> {currency(result.sale.total)}</p>
                {result.sangriaCreated && <p className="text-blue-700"><strong>Sangria de frete registrada no fluxo de caixa.</strong></p>}
                <Button className="mt-2" onClick={() => setIsDanfeOpen(true)}>
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  Visualizar / Imprimir DANFE
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="sticky bottom-0 flex items-center justify-between rounded-lg border bg-white p-4 shadow-lg">
            <div><p className="font-semibold">Total: {currency(total)}</p><p className="text-xs text-gray-500">A operação só entra nos relatórios após a autorização.</p></div>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700" disabled={emitting || items.length === 0 || Math.abs(remaining) > 0.01} onClick={emitNfe}>
              {emitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileCheck2 className="mr-2 h-5 w-5" />}
              Emitir NF-e e registrar venda
            </Button>
          </div>
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
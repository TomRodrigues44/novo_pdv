import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/use-admin";
import { CartItemComponent } from "./CartItem";
import { PaymentDialog } from "./PaymentDialog";
import { DocumentDialog } from "./DocumentDialog";
import { CustomerSelector } from "./CustomerSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Trash2,
  Receipt,
  Truck,
  Plus,
  X,
  User,
  Lock,
  Bike,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  points: number;
  total_spent: number;
}

interface Motoboy {
  id: string;
  name: string;
  phone: string;
}

interface CartPanelProps {
  selectedCustomer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  onOpenCustomerForm?: () => void;
  isCashRegisterOpen?: boolean;
}

export const CartPanel = ({ selectedCustomer, onCustomerChange, onOpenCustomerForm, isCashRegisterOpen = false }: CartPanelProps) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    freight,
    setFreight,
    selectedMotoboy,
    setSelectedMotoboy,
  } = useCart();
  
  const { recordSale } = useAdmin();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [currentPayments, setCurrentPayments] = useState<any[]>([]);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const [isFreightDialogOpen, setIsFreightDialogOpen] = useState(false);
  const [freightValue, setFreightValue] = useState("");
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);

  const totalWithFreight = cartTotal + freight;

  // Buscar motoboys
  useEffect(() => {
    const fetchMotoboys = async () => {
      try {
        const response = await fetch('/api/motoboys');
        if (response.ok) {
          const data = await response.json();
          setMotoboys(data);
        }
      } catch (error) {
        console.error('Error fetching motoboys:', error);
      }
    };
    fetchMotoboys();
  }, []);

  const handleAddFreight = async () => {
    const value = parseFloat(freightValue);
    if (!value || value <= 0) {
      toast.error('Informe um valor válido para o frete');
      return;
    }
    
    if (!selectedMotoboy) {
      toast.error('Selecione um motoboy para a entrega');
      return;
    }

    // Criar sangria automática
    try {
      const response = await fetch('/api/cash-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'withdrawal',
          amount: value,
          description: `Taxa Entrega - ${selectedMotoboy.name}`,
        }),
      });

      if (response.ok) {
        toast.success(`Frete de R$ ${value.toFixed(2)} adicionado para ${selectedMotoboy.name}`);
        setFreight(value);
        setFreightValue("");
        setIsFreightDialogOpen(false);
      } else {
        toast.error('Erro ao registrar frete');
      }
    } catch (error) {
      toast.error('Erro ao registrar frete');
    }
  };

  const handleRemoveFreight = async () => {
    // Remover a sangria correspondente
    try {
      const response = await fetch('/api/cash-transactions');
      if (response.ok) {
        const data = await response.json();
        const transactions = data.transactions || [];
        
        // Encontrar a sangria de frete mais recente
        const freightTransaction = transactions.find((t: any) => 
          t.description?.startsWith('Taxa Entrega') && 
          t.amount === freight
        );

        if (freightTransaction) {
          await fetch(`/api/cash-transactions/${freightTransaction.id}`, {
            method: 'DELETE',
          });
          toast.success('Frete removido');
        }
      }
    } catch (error) {
      console.error('Error removing freight:', error);
    }

    setFreight(0);
    setSelectedMotoboy(null);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!isCashRegisterOpen) {
      alert("Caixa fechado! Abra o caixa para iniciar as vendas.");
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = (payments: any[], saleId: string) => {
    // Registrar a venda
    setCurrentSaleId(saleId);
    
    recordSale({
      id: saleId,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        flavors: (item as any).flavors,
      })),
      total: totalWithFreight,
      payments: payments,
      type: "pending",
      freight: freight,
      customerId: selectedCustomer?.id || null,
    });

    setCurrentPayments(payments);
    setIsPaymentDialogOpen(false);
    setIsDocumentDialogOpen(true);
  };

  const handleGenerateDocument = (type: "quote" | "fiscal") => {
    if (type === "quote") {
      const documentType = type === "quote" ? "Orçamento" : "Cupom Fiscal";
      alert(`${documentType} gerado com sucesso!\nTotal: R$ ${totalWithFreight.toFixed(2)}`);
      
      setIsDocumentDialogOpen(false);
      clearCart();
      setCurrentPayments([]);
      setCurrentSaleId(null);
      onCustomerChange(null);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
            {cartCount > 0 && (
              <span className="ml-auto bg-white text-orange-600 px-2 py-1 rounded-full text-sm font-bold">
                {cartCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4">
          {/* Seleção de Cliente */}
          <div className="mb-4">
            {selectedCustomer ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">{selectedCustomer.name}</p>
                      <p className="text-xs text-blue-700">
                        {selectedCustomer.points} pontos • R$ {parseFloat(String(selectedCustomer.total_spent)).toFixed(2)} gasto
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomerSelectorOpen(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Trocar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2"
                  onClick={() => setIsCustomerSelectorOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Selecionar Cliente
                </Button>
              )}
            </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-center">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <>
            <Separator />
            <div className="p-4 space-y-3">
              {/* Botão de Frete */}
              <div className="flex gap-2">
                <Dialog open={isFreightDialogOpen} onOpenChange={setIsFreightDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Adicionar Frete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Frete</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valor do Frete
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={freightValue}
                          onChange={(e) => setFreightValue(e.target.value)}
                          placeholder="Ex: 10.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Motoboy Responsável
                        </label>
                        <Select
                          value={selectedMotoboy?.id || ""}
                          onValueChange={(value) => {
                            const motoboy = motoboys.find(m => m.id === value);
                            setSelectedMotoboy(motoboy || null);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um motoboy" />
                          </SelectTrigger>
                          <SelectContent>
                            {motoboys.map((motoboy) => (
                              <SelectItem key={motoboy.id} value={motoboy.id}>
                                <div className="flex items-center gap-2">
                                  <Bike className="h-4 w-4" />
                                  {motoboy.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddFreight} className="w-full bg-blue-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Frete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {freight > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveFreight}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Display do Frete */}
              {freight > 0 && (
                <div className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded-lg">
                  <span className="text-blue-700 font-medium">Frete (Entrega):</span>
                  <span className="text-blue-700 font-bold">R$ {freight.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">R$ {cartTotal.toFixed(2)}</span>
              </div>
              
              {freight > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Frete:</span>
                  <span>R$ {freight.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="confiscalResult.text-orange-600">R$ {totalWithFreight.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                disabled={!isCashRegisterOpen}
              >
                {!isCashRegisterOpen ? (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Caixa Fechado
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-5 w-5" />
                    Finalizar Pedido
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </Card>

      <CustomerSelector
        open={isCustomerSelectorOpen}
        onOpenChange={setIsCustomerSelectorOpen}
        onSelectCustomer={onCustomerChange}
        onAddNewCustomer={onOpenCustomerForm}
      />

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={totalWithFreight}
        freight={freight}
        cartItems={cartItems}
        customerId={selectedCustomer?.id || null}
        onPaymentConfirm={handlePaymentConfirm}
      />

      <DocumentDialog
        open={isDocumentDialogOpen}
        onClose={() => setIsDocumentDialogOpen(false)}
        total={totalWithFreight}
        freight={freight}
        cartItems={cartItems}
        payments={currentPayments}
        onGenerateDocument={handleGenerateDocument}
        saleId={currentSaleId}
      />
    </>
  );
};
</dy-write>

Agora vou atualizar o `AdminFiscal` para mudar o ambiente para produção:

<dyad-write path="src/pages/AdminFiscal.tsx" description="Updating AdminFiscal to set environment to production">
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  FileText, 
  Shield, 
  Upload, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Trash2,
  Settings,
  RefreshCw,
  Link,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const AdminFiscal = () => {
  const [activeTab, setActiveTab] = useState("empresa");
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  
  // Configuração da Empresa
  const [companyConfig, setCompanyConfig] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    cnae: "",
    cnpj_matriz: "",
    regime_tributario: "simples_nacional",
    CRT: "1",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    municipio: "",
    uf: "RR",
    telefone: "",
    email: "",
    ambiente: "producao",
  });
  
  // Certificados
  const [certificates, setCertificates] = useState<any[]>([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  
  // Formulário de upload
  const [certForm, setCertForm] = useState({
    nome: "",
    arquivo: null as File | null,
    senha: "",
  });

  // Carregar configurações
  useEffect(() => {
    fetchCompanyConfig();
    fetchCertificates();
  }, []);

  const fetchCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config');
      if (response.ok) {
        const config = await response.json();
        if (config) {
          setCompanyConfig(config);
        }
      }
    } catch (error) {
      console.error('Error fetching company config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/fiscal/certificates');
      if (response.ok) {
        const certs = await response.json();
        setCertificates(certs);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleSaveCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyConfig),
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certForm.arquivo || !certForm.senha) {
      toast.error('Selecione o arquivo e a senha do certificado');
      return;
    }

    setUploadingCert(true);

    try {
      const formData = new FormData();
      formData.append('file', certForm.arquivo);
      formData.append('nome', certForm.nome);
      formData.append('senha', certForm.senha);

      const response = await fetch('/api/fiscal/certificates', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Certificado adicionado com sucesso!');
        setCertForm({ nome: "", arquivo: null, senha: "" });
        fetchCertificates();
      } else {
        toast.error('Erro ao adicionar certificado');
      }
    } catch (error) {
      toast.error('Erro ao adicionar certificado');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este certificado?')) return;

    try {
      const response = await fetch(`/api/fiscal/certificates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Certificado excluído com sucesso!');
        fetchCertificates();
      } else {
        toast.error('Erro ao excluir certificado');
      }
    } catch (error) {
      toast.error('Erro ao excluir certificado');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const response = await fetch('/api/fiscal/test-connection', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setConnectionResult(result);
        
        if (result.success) {
          toast.success('Conexão com SEFAZ estabelecida com sucesso!');
        } else {
          toast.error('Erro na conexão: ' + result.message);
        }
      } else {
        const error = await response.json();
        toast.error('Erro ao testar conexão: ' + error.statusMessage);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-orange-600" />
            Configurações Fiscais
          </h1>
          <p className="text-gray-600 mt-1">
            Integração SEFAZ-RR para emissão de NF-e e NFC-e
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa">
              <Building2 className="h-4 w-4 mr-2" />
              Dados da Empresa
            </TabsTrigger>
            <TabsTrigger value="certificados">
              <FileText className="h-4 w-4 mr-2" />
              Certificado Digital
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dados da Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Dados Cadastrais da Empresa</CardTitle>
                <CardDescription>
                  Informações fiscais e cadastrais para emissão de notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>CNPJ *</Label>
                      <Input
                        value={companyConfig.cnpj}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div>
                      <Label>Razão Social *</Label>
                      <Input
                        value={companyConfig.razao_social}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, razao_social: e.target.value })}
                        placeholder="Nome completo da empresa"
                      />
                    </div>
                    <div>
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={companyConfig.nome_fantasia}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, nome_fantasia: e.target.value })}
                        placeholder="Nome comercial"
                      />
                    </div>
                    <div>
                      <Label>Inscrição Estadual</Label>
                      <Input
                        value={companyConfig.inscricao_estadual}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, inscricao_estadual: e.target.value })}
                        placeholder="Isento ou número"
                      />
                    </div>
                    <div>
                      <Label>Inscrição Municipal</Label>
                      <Input
                        value={companyConfig.inscricao_municipal}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, inscricao_municipal: e.target.value })}
                        placeholder="Isento ou número"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>CNAE</Label>
                      <Input
                        value={companyConfig.cnae}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnae: e.target.value })}
                        placeholder="XXXX-XX-00"
                      />
                    </div>
                    <div>
                      <Label>CNPJ da Matriz</Label>
                      <Input
                        value={companyConfig.cnpj_matriz}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnpj_matriz: e.target.value })}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div>
                      <Label>Regime Tributário *</Label>
                      <select
                        value={companyConfig.regime_tributario}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, regime_tributario: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="simples_nacional">Simples Nacional</option>
                        <option value="simples_nacional_excesso">Simples Nacional - Excesso</option>
                        <option value="lucro_presumido">Lucro Presumido</option>
                        <option value="lucro_real">Lucro Real</option>
                      </select>
                    </div>
                    <div>
                      <Label>CRT (Código de Regime Tributário)</Label>
                      <select
                        value={companyConfig.CRT}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, CRT: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="1">Simples Nacional</option>
                        <option value="2">Simples Nacional - Excesso</option>
                        <option value="3">Regime Normal</option>
                      </select>
                    </div>
                    <div>
                      <Label>Ambiente</Label>
                      <select
                        value={companyConfig.ambiente}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, ambiente: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="homologacao">Homologação (Teste)</option>
                        <option value="producao">Produção</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">Endereço Completo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>CEP</Label>
                        <Input
                          value={companyConfig.cep}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, cep: e.target.value })}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Logradouro</Label>
                        <Input
                          value={companyConfig.logradouro}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, logradouro: e.target.value })}
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={companyConfig.numero}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, numero: e.target.value })}
                          placeholder="123"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Complemento</Label>
                        <Input
                          value={companyConfig.complemento}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, complemento: e.target.value })}
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                      <div>
                        <Label>Bairro</Label>
                        <Input
                          value={companyConfig.bairro}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, bairro: e.target.value })}
                          placeholder="Centro"
                        />
                      </div>
                      <div>
                        <Label>Município</Label>
                        <Input
                          value={companyConfig.municipio}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, municipio: e.target.value })}
                          placeholder="Boa Vista"
                        />
                      </div>
                      <div>
                        <Label>UF</Label>
                        <select
                          value={companyConfig.uf}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, uf: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="RR">Roraima</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <p className="text-xs text-gray-500 mt-1">Roraima</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={companyConfig.telefone}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, telefone: e.target.value })}
                          placeholder="(95) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={companyConfig.email}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, email: e.target.value })}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </div>
                  </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveCompanyConfig} className="bg-orange-600 hover:bg-orange-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Certificado Digital */}
          <TabsContent value="certificados">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload de Certificado */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Certificado Digital</CardTitle>
                  <CardDescription>
                    Certificado A1 (.pfx) para assinatura digital das notas fiscais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadCert} className="space-y-4">
                    <div>
                      <Label>Nome do Certificado</Label>
                      <Input
                        value={certForm.nome}
                        onChange={(e) => setCertForm({ ...certForm, nome: e.target.value })}
                        placeholder="Ex: Certificado Principal"
                        required
                      />
                    </div>
                    <div>
                      <Label>Arquivo do Certificado (.pfx)</Label>
                      <Input
                        type="file"
                        accept=".pfx,.p12"
                        onChange={(e) => setCertForm({ 
                          ...certForm, 
                          arquivo: e.target.files?.[0] || null 
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Senha do Certificado</Label>
                      <Input
                        type="password"
                        value={certForm.senha}
                        onChange={(e) => setCertForm({ ...certForm, senha: e.target.value })}
                        placeholder="Digite a senha"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={uploadingCert}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingCert ? 'Enviando...' : 'Adicionar Certificado'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Lista de Certificados */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificados Cadastrados</CardTitle>
                  <CardDescription>
                    Certificados digitais disponíveis para uso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certificates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum certificado cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              cert.expirado ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {cert.expirado ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{cert.nome}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Válido até: {new Date(cert.data_validade).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {cert.expirado && (
                                <p className="text-sm text-red-600 font-medium">
                                  Certificado expirado!
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCert(cert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="configuracoes">
            <div className="space-y-6">
              {/* Teste de Conexão */}
              <Card>
                <CardHeader>
                  <CardTitle>Testar Conexão com SEFAZ-RR</CardTitle>
                  <CardDescription>
                    Verifique se o certificado digital está funcionando e se consegue se comunicar com a SEFAZ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
                      {testingConnection ? 'Testando conexão...' : 'Testar Conexão'}
                    </Button>

                    {connectionResult && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        connectionResult.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          {connectionResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              connectionResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {connectionResult.message}
                            </p>
                            
                            {connectionResult.details && (
                              <div className="mt-3 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-600">Ambiente:</span>
                                    <span className="ml-2 font-medium">
                                      {connectionResult.details.ambiente === 'producao' ? 'Produção' : 'Homologação'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">CNPJ:</span>
                                    <span className="ml-2 font-medium">{connectionResult.details.cnpj}</span>
                                  </div>
                                </div>
                                
                                {connectionResult.details.certificado && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="font-medium mb-1">Certificado:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="ml-2">{connectionResult.details.certificado.nome}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Validade:</span>
                                        <span className="ml-2">
                                          {new Date(connectionResult.details.certificado.validade).toLocaleDateString('pt-BR')}
                                        </span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-600">Dias restantes:</span>
                                        <span className={`ml-2 font-bold ${
                                          connectionResult.details.certificado.dias_restantes < 30 
                                            ? 'text-red-600' 
                                            : connectionResult.details.certificado.dias_restantes < 90 
                                              ? 'text-orange-600' 
                                              : 'text-green-600'
                                        }`}>
                                          {connectionResult.details.certificado.dias_restantes} dias
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-gray-600 text-xs">
                                    <Link className="h-3 w-3 inline mr-1" />
                                    URL SEFAZ: {connectionResult.details.sefaz_url}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1 italic">
                                    {connectionResult.details.nota}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Emissão */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Emissão</CardTitle>
                  <CardDescription>
                    Configurações específicas para NF-e e NFC-e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900">Ambiente de Produção</p>
                          <p className="text-sm text-blue-700">
                            O sistema está configurado para usar o ambiente de PRODUÇÃO da SEFAZ-RR. 
                            Notas emitidas neste ambiente têm valor fiscal e devem ser usadas apenas para emissão real.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Série NF-e</Label>
                        <Input defaultValue="1" placeholder="1" />
                        <p className="text-xs text-gray-500 mt-1">Série para Nota Fiscal Eletrônica</p>
                      </div>
                      <div>
                        <Label>Série NFC-e</Label>
                        <Input defaultValue="1" placeholder="1" />
                        <p className="text-xs text-gray-500 mt-1">Série para NFC-e</p>
                      </div>
                      <div>
                        <Label>Última NF-e</Label>
                        <Input defaultValue="0" readOnly />
                      </div>
                      <div>
                        <Label>Última NFC-e</Label>
                        <Input defaultValue="0" readOnly />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminFiscal;
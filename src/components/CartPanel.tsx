import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/use-admin";
import { CartItemComponent } from "./CartItem";
import { PaymentDialog } from "./PaymentDialog";
import { DocumentDialog, ReceiptDialog } from "./DocumentDialog";
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
  MapPin,
  Pencil,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email: string;
  points: number;
  total_spent: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
}

interface Motoboy {
  id: string;
  name: string;
  phone: string;
}

interface DeliveryData {
  name: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  notes: string;
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
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [emittingNfce, setEmittingNfce] = useState(false);
  const [currentPayments, setCurrentPayments] = useState<any[]>([]);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const [currentDailySaleNumber, setCurrentDailySaleNumber] = useState<string | null>(null);
  const [currentDocumentType, setCurrentDocumentType] = useState<"quote" | "fiscal">("quote");
  const [nfceData, setNfceData] = useState<any>(null);
  const [isFreightDialogOpen, setIsFreightDialogOpen] = useState(false);
  const [freightValue, setFreightValue] = useState("");
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryData>({
    name: "",
    phone: "",
    address: "",
    number: "",
    neighborhood: "",
    notes: "",
  });

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
  
      // Apenas definir o frete no carrinho - a sangria será criada após confirmação do pagamento
      setFreight(value);
      setFreightValue("");
      setIsFreightDialogOpen(false);
      toast.success(`Frete de R$ ${value.toFixed(2)} adicionado para ${selectedMotoboy.name}`);
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

  const handleOpenDeliveryDialog = () => {
    if (deliveryData) {
      setDeliveryForm(deliveryData);
    } else {
      setDeliveryForm({
        name: selectedCustomer?.name || "",
        phone: selectedCustomer?.phone || "",
        address: selectedCustomer?.logradouro || selectedCustomer?.address || "",
        number: selectedCustomer?.numero || "",
        neighborhood: selectedCustomer?.bairro || "",
        notes: selectedCustomer?.complemento
          ? `Complemento: ${selectedCustomer.complemento}`
          : "",
      });
    }
    setIsDeliveryDialogOpen(true);
  };

  const handleSaveDelivery = () => {
    const name = deliveryForm.name.trim();
    const phone = deliveryForm.phone.trim();
    const address = deliveryForm.address.trim();
    const number = deliveryForm.number.trim();
    const neighborhood = deliveryForm.neighborhood.trim();

    if (!name || !phone || !address || !number || !neighborhood) {
      toast.error("Preencha Nome, Telefone, Endereço, Número e Bairro");
      return;
    }

    setDeliveryData({
      name,
      phone,
      address,
      number,
      neighborhood,
      notes: deliveryForm.notes.trim(),
    });
    setIsDeliveryDialogOpen(false);
    toast.success("Dados de entrega adicionados");
  };

  const handleRemoveDelivery = () => {
    setDeliveryData(null);
    setDeliveryForm({
      name: "",
      phone: "",
      address: "",
      number: "",
      neighborhood: "",
      notes: "",
    });
    toast.success("Dados de entrega removidos");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!isCashRegisterOpen) {
      alert("Caixa fechado! Abra o caixa para iniciar as vendas.");
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (payments: any[]) => {
    try {
      // Registrar a venda
      const result = await recordSale({
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
        delivery: deliveryData,
      });

      // Usar o ID real do banco de dados
      setCurrentSaleId(String(result.id));
            setCurrentDailySaleNumber(String(result.daily_sale_number));
      
            // Criar sangria para o frete após confirmação do pagamento
            try {
              const response = await fetch('/api/cash-transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'withdrawal',
                  amount: freight,
                  description: `Taxa Entrega - ${selectedMotoboy?.name || 'Desconhecido'}`
                })
              });
      
              if (!response.ok) {
                console.error('Erro ao criar sangria para frete:', response.statusText);
                toast.error('Erro ao registrar Taxa de Delivery');
              }
            } catch (error) {
              console.error('Erro ao criar sangria para frete:', error);
              toast.error('Erro ao registrar Taxa de Delivery');
            }
      
            setCurrentPayments(payments);
            setIsPaymentDialogOpen(false);
            setIsDocumentDialogOpen(true);
    } catch (error: any) {
      console.error("Falha ao registrar a venda:", error);
      toast.error(error.message || "Ocorreu um erro inesperado ao registrar a venda.");
      setIsPaymentDialogOpen(false);
    }
  };

  const handleGenerateDocument = async (type: "quote" | "fiscal") => {
    setCurrentDocumentType(type);
    setIsDocumentDialogOpen(false);
  
    if (type === "fiscal") {
      // Emitir NFC-e
      setEmittingNfce(true);
      
      try {
        // Extrair apenas o número do ID (remover prefixo "sale-")
        const saleIdNumber = typeof currentSaleId === 'string'
          ? parseInt(currentSaleId.replace(/\D/g, ''), 10)
          : currentSaleId;
        
        const response = await fetch('/api/nfce/emitir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sale_id: saleIdNumber,
            valor_total: totalWithFreight,
            itens: cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0)),
              quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity || 0)),
              flavors: (item as any).flavors,
            })),
            cliente: selectedCustomer ? {
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              cpf_cnpj: selectedCustomer.phone,
            } : undefined,
            frete: freight,
            forma_pagamento: currentPayments.map((p) => ({
              tipo: p.type,
              valor: p.amount,
            })),
          }),
        });
  
        // TRATAMENTO DE ERRO DEFENSIVO COMPLETO
        if (response?.ok) {
          const data = await response.json();
          
          // Verificar se é uma NFC-e que já foi emitida anteriormente
          if (data?.message?.includes('já emitida anteriormente')) {
            toast.info('NFC-e já foi emitida anteriormente. Utilizando os dados existentes.');
            setNfceData(data?.nfce ?? null);
            setIsReceiptDialogOpen(true);
            setEmittingNfce(false);
            return;
          }
          
          setNfceData(data?.nfce ?? null);
          toast.success('NFC-e emitida e autorizada com sucesso!');
          setIsReceiptDialogOpen(true);
          setEmittingNfce(false);
          return;
        }
        
        // SE RESPONSE NÃO FOR OK - TRATAR ERRO HTTP
        const responseStatus = response?.status ?? 'desconhecido';
        const responseStatusText = String(responseStatus);
        let errorMessage = `Erro ao emitir NFC-e (Status: ${responseStatusText})`;
        
        // Tentar extrair mensagem do corpo da resposta JSON
        try {
          if (response && typeof response.json === 'function') {
            const errorData = await response.json();
            errorMessage = errorData?.message ?? 
                         errorData?.statusMessage ?? 
                         errorMessage;
          }
        } catch (jsonError) {
          // Erro ao fazer parse do JSON - manter a mensagem já definida
          console.error('Erro ao fazer parse da resposta JSON:', jsonError);
        }

        console.error('NFC-e emission error:', errorMessage);
        toast.error(errorMessage);
        
        // Abrir dialog de recibo mesmo com erro (fallback para orçamento)
        setIsReceiptDialogOpen(true);
        setEmittingNfce(false);
        
      } catch (error) {
        // TRATAMENTO DE ERRO DE CATCH
        console.error('Error emitting NFC-e (catch block):', error);
        
        // Verificar se há uma mensagem específica no erro
        const errorMessage = error?.message || 
                         error?.statusMessage || 
                         error?.response?.data?.message ||
                         'Erro desconhecido ao emitir NFC-e';
        
        console.error('NFC-e emission error (final):', errorMessage);
        toast.error(errorMessage);
        
        // Abrir dialog de recibo com fallback para orçamento
        setIsReceiptDialogOpen(true);
        setEmittingNfce(false);
      }
    } else {
      // Orçamento - abrir diretamente
      setIsReceiptDialogOpen(true);
    }
  };
  
  const handleReceiptClose = () => {
    setIsReceiptDialogOpen(false);
    clearCart();
    setCurrentPayments([]);
    setCurrentSaleId(null);
    setCurrentDailySaleNumber(null);
    setNfceData(null);
    setDeliveryData(null);
    setDeliveryForm({ name: "", phone: "", address: "", number: "", neighborhood: "", notes: "" });
    onCustomerChange(null);
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
                        Adicionar Freite
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

              {/* Dados da Entrega */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={handleOpenDeliveryDialog}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {deliveryData ? "Editar Entrega" : "Adicionar Entrega"}
              </Button>

              {deliveryData && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-800 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        ENTREGA
                      </p>
                      <p className="font-semibold text-emerald-900">{deliveryData.name}</p>
                      <p className="text-emerald-800">{deliveryData.phone}</p>
                      <p className="text-emerald-800">
                        {deliveryData.address}, {deliveryData.number} - {deliveryData.neighborhood}
                      </p>
                      {deliveryData.notes && (
                        <p className="mt-1 text-emerald-700">
                          Obs.: {deliveryData.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={handleOpenDeliveryDialog}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveDelivery} className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                <span className="text-orange-600">R$ {totalWithFreight.toFixed(2)}</span>
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
                onClick={() => {
                  clearCart();
                  setDeliveryData(null);
                  setDeliveryForm({ name: "", phone: "", address: "", number: "", neighborhood: "", notes: "" });
                }}
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

      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Dados para Entrega
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <Input
                value={deliveryForm.name}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                placeholder="Nome de quem receberá"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <Input
                value={deliveryForm.phone}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                placeholder="(95) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Endereço *</label>
              <Input
                value={deliveryForm.address}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                placeholder="Rua / Avenida"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nº *</label>
                <Input
                  value={deliveryForm.number}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, number: e.target.value })}
                  placeholder="123"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Bairro *</label>
                <Input
                  value={deliveryForm.neighborhood}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, neighborhood: e.target.value })}
                  placeholder="Bairro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observação</label>
              <textarea
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                placeholder="Referência, instruções de entrega, portão, apartamento..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveDelivery} className="bg-emerald-600 hover:bg-emerald-700">
              <MapPin className="mr-2 h-4 w-4" />
              Salvar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        onGenerateDocument={handleGenerateDocument}
        isEmitting={emittingNfce}
      />
      
      <ReceiptDialog
        open={isReceiptDialogOpen}
        onClose={handleReceiptClose}
        total={totalWithFreight}
        freight={freight}
        cartItems={cartItems}
        payments={currentPayments}
        documentType={currentDocumentType}
        saleId={currentDailySaleNumber || undefined}
        nfceData={nfceData}
        delivery={deliveryData}
      />
    </>
  );
};
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
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [emittingNfce, setEmittingNfce] = useState(false);
  const [currentPayments, setCurrentPayments] = useState<any[]>([]);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const [currentDocumentType, setCurrentDocumentType] = useState<"quote" | "fiscal">("quote");
  const [nfceData, setNfceData] = useState<any>(null);
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
      console.error('Error adding freight:', error);
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

  const handlePaymentConfirm = async (payments: any[]) => {
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
    });

    // Usar o ID real do banco de dados
    setCurrentSaleId(String(result.id));

    setCurrentPayments(payments);
    setIsPaymentDialogOpen(false);
    setIsDocumentDialogOpen(true);
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
  
        if (response.ok) {
          const data = await response.json();
          
          // Verificar se é uma NFC-e que já foi emitida anteriormente
          if (data.message && data.message.includes('já emitida anteriormente')) {
            toast.info('NFC-e já foi emitida anteriormente. Utilizando os dados existentes.');
            setNfceData(data.nfce);
            setIsReceiptDialogOpen(true);
            setEmittingNfce(false);
          } else {
            setNfceData(data.nfce);
            toast.success('NFC-e emitida e autorizada com sucesso!');
            setIsReceiptDialogOpen(true);
            setEmittingNfce(false);
          }
        } else {
          let errorMessage = 'Erro ao emitir NFC-e (Status: ' + response.status + ')';
          
          // Tentar extrair uma mensagem mais detalhada
          try {
            const errorData = await response.json();
            if (errorData) {
              errorMessage = errorData.message || errorData.statusMessage || errorMessage;
            }
          } catch (e) {
            // Se falhar o parse JSON, manter a mensagem padrão
          }
          
          console.error('NFC-e emission error:', errorMessage);
          toast.error(errorMessage);
          setIsReceiptDialogOpen(true);
          setEmittingNfce(false);
        }
      } catch (error) {
        console.error('Error emitting NFC-e:', error);
        toast.error('Erro ao emitir NFC-e');
        // Mesmo com erro, abrir o dialog para orçamento
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
    setNfceData(null);
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
        saleId={currentSaleId || undefined}
        nfceData={nfceData}
      />
    </>
  );
};
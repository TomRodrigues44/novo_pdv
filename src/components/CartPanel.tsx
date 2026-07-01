import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/use-admin";
import { CartItemComponent } from "./CartItem";
import { PaymentDialog } from "./PaymentDialog";
import { DocumentDialog } from "./DocumentDialog";
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
import { ShoppingCart, Trash2, Receipt, Truck, Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const CartPanel = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();
  
  const { recordSale } = useAdmin();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [currentPayments, setCurrentPayments] = useState<any[]>([]);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const [freight, setFreight] = useState<number>(0);
  const [isFreightDialogOpen, setIsFreightDialogOpen] = useState(false);
  const [freightValue, setFreightValue] = useState("");

  const totalWithFreight = cartTotal + freight;

  const handleAddFreight = () => {
    const value = parseFloat(freightValue);
    if (value && value >= 0) {
      setFreight(value);
      setFreightValue("");
      setIsFreightDialogOpen(false);
    }
  };

  const handleRemoveFreight = () => {
    setFreight(0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = (payments: any[]) => {
    // Registrar a venda
    const saleId = `sale-${Date.now()}`;
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
    });

    setCurrentPayments(payments);
    setIsPaymentDialogOpen(false);
    setIsDocumentDialogOpen(true);
  };

  const handleGenerateDocument = (type: "quote" | "fiscal") => {
    const documentType = type === "quote" ? "Orçamento" : "Cupom Fiscal";
    alert(`${documentType} gerado com sucesso!\nTotal: R$ ${totalWithFreight.toFixed(2)}`);
    
    setIsDocumentDialogOpen(false);
    clearCart();
    setFreight(0);
    setCurrentPayments([]);
    setCurrentSaleId(null);
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
                      <Button onClick={handleAddFreight} className="w-full bg-blue-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
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
              >
                <Receipt className="mr-2 h-5 w-5" />
                Finalizar Pedido
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

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={totalWithFreight}
        cartItems={cartItems}
        onPaymentConfirm={handlePaymentConfirm}
      />

      <DocumentDialog
        open={isDocumentDialogOpen}
        onClose={() => setIsDocumentDialogOpen(false)}
        total={totalWithFreight}
        cartItems={cartItems}
        payments={currentPayments}
        onGenerateDocument={handleGenerateDocument}
      />
    </>
  );
};
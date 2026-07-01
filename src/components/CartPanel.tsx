import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/use-admin";
import { CartItemComponent } from "./CartItem";
import { PaymentDialog } from "./PaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2, Receipt } from "lucide-react";
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

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = (payments: any[]) => {
    // Registrar a venda
    recordSale({
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: cartTotal,
      payments: payments,
    });

    alert(`Pedido finalizado! Total: R$ ${cartTotal.toFixed(2)}`);
    clearCart();
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
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">R$ {cartTotal.toFixed(2)}</span>
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
        total={cartTotal}
        onConfirm={handlePaymentConfirm}
      />
    </>
  );
};
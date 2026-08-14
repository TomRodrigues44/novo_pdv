import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreditCard, QrCode, Banknote, Plus, Trash2, Check, Truck, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/product";

interface PaymentMethod {
  id: string;
  type: "debit" | "credit" | "pix" | "cash";
  amount: number;
  cashReceived?: number;
  change?: number;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freight: number;
  cartItems: CartItem[];
  customerId: string | null;
  onPaymentConfirm: (payments: PaymentMethod[]) => void;
}

export const PaymentDialog = ({ open, onClose, total, freight, cartItems, customerId, onPaymentConfirm }: PaymentDialogProps) => {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<"debit" | "credit" | "pix" | "cash">("debit");
  const [amount, setAmount] = useState("");

  const subtotal = total - freight;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;
  const isComplete = remaining <= 0.01;

  const addPayment = () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) return;

    const newPayment: PaymentMethod = {
      id: `pay-${Date.now()}`,
      type: selectedType,
      amount: paymentAmount,
    };

    // Se for dinheiro e o valor for maior que o restante, calcular troco
    if (selectedType === "cash" && paymentAmount > remaining) {
      newPayment.cashReceived = paymentAmount;
      newPayment.change = paymentAmount - remaining;
    }

    setPayments([...payments, newPayment]);
    setAmount("");
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleConfirmPayment = () => {
    if (!isComplete || payments.length === 0) {
      return;
    }
    onPaymentConfirm(payments);
    setPayments([]);
    onClose();
  };

  const handleClose = () => {
    setPayments([]);
    setAmount("");
    onClose();
  };

  // Auto-avançar quando o pagamento estiver completo
  useEffect(() => {
    if (isComplete && payments.length > 0 && open) {
      const timer = setTimeout(() => {
        handleConfirmPayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, payments.length, open]);

  // Calcular troco total
  const totalChange = payments.reduce((sum, p) => {
    return sum + (p.change || 0);
  }, 0);

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case "debit": return "Cartão de Débito";
      case "credit": return "Cartão de Crédito";
      case "pix": return "Pix";
      case "cash": return "Dinheiro";
      default: return type;
    }
  };

  // Ícones para cada tipo de pagamento
  const getPaymentIcon = (type: "debit" | "credit" | "pix" | "cash") => {
    switch (type) {
      case "debit": return <CreditCard className="h-4 w-4" />;
      case "credit": return <CreditCard className="h-4 w-4" />;
      case "pix": return <QrCode className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
    }
  };

  // Cores para cada tipo quando selecionado
  const getSelectedColors = (type: "debit" | "credit" | "pix" | "cash") => {
    if (selectedType === type) {
      return "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25";
    }
    return "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">Pagamento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Resumo do Pedido */}
            <div className="space-y-4">
              {/* Cliente Selecionado */}
              {customerId && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <User className="h-5 w-5" />
                      <span className="font-semibold">Venda vinculada a cliente</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="bg-orange-50 pb-3">
                  <h3 className="font-bold text-lg text-orange-800">Resumo do Pedido</h3>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.quantity}x {item.name}
                          </p>
                          {(item as any).flavors && (item as any).flavors.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Sabores: {(item as any).flavors.join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-sm">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {index < cartItems.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                  <Separator className="my-3" />
                  
                  {/* Discriminação de Valores */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {freight > 0 && (
                      <div className="flex justify-between items-center text-blue-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Frete (Entrega):
                        </span>
                        <span>R$ {freight.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total a Pagar */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total a Pagar:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Pagamentos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pagamentos</h3>

              {/* Pagamentos Adicionados */}
              {payments.length > 0 && (
                <div className="space-y-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(payment.type)}
                          <div>
                            <p className="font-medium text-sm">
                              {getPaymentTypeName(payment.type)}
                            </p>
                            {payment.type === "cash" && payment.change && payment.change > 0 && (
                              <p className="text-xs text-green-600">
                                Troco: R$ {payment.change.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">R$ {payment.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePayment(payment.id)}
                            className="h-6 w-6 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Total Pago:</span>
                    <span className="font-bold text-green-600">R$ {totalPaid.toFixed(2)}</span>
                  </div>
                  {remaining > 0.01 && (
                    <div className="flex justify-between items-center text-sm text-red-600">
                      <span className="font-medium">Restante:</span>
                      <span className="font-bold">R$ {remaining.toFixed(2)}</span>
                    </div>
                  )}
                  {totalChange > 0 && (
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <span className="font-medium text-green-700 text-sm">Troco Total: R$ {totalChange.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Adicionar Pagamento - Botões customizados ao invés de TabsTrigger */}
              {!isComplete && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Adicionar Pagamento</h4>
                  
                  {/* Grid de botões de pagamento customizados */}
                  <div className="grid grid-cols-4 gap-2">
                    {(["debit", "credit", "pix", "cash"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`
                          flex flex-col items-center justify-center gap-2
                          px-3 py-4 rounded-lg border-2 transition-all duration-200
                          font-medium text-sm
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                          ${getSelectedColors(type)}
                        `}
                      >
                        <div className="flex items-center gap-1">
                          {getPaymentIcon(type)}
                          <span>{type === "debit" ? "Débito" : type === "credit" ? "Crédito" : type === "pix" ? "Pix" : "Dinheiro"}</span>
                        </div>
                        {selectedType === type && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Input de valor */}
                  <div className="space-y-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={selectedType === "cash" ? "Valor recebido" : `Máximo: R$ ${remaining.toFixed(2)}`}
                      className="text-lg text-center font-medium"
                    />
                    {selectedType === "cash" && amount && parseFloat(amount) > 0 && (
                      <div className="mt-2 space-y-1">
                        {remaining > 0 && parseFloat(amount) < remaining && (
                          <p className="text-sm text-orange-600 text-center">
                            Ainda faltam: R$ {(remaining - parseFloat(amount)).toFixed(2)}
                          </p>
                        )}
                        {parseFloat(amount) >= remaining && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-orange-700 font-medium">
                              Troco: R$ {(parseFloat(amount) - remaining).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={addPayment}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3"
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Adicionar Pagamento
                  </Button>
                </div>
              )}

              {isComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Check className="h-10 w-10 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">Pagamento Completo!</p>
                  {totalChange > 0 && (
                    <p className="text-green-600 text-sm mt-1">Troco: R$ {totalChange.toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Fixo com Botão de Confirmar Pagamento */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmPayment}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={!isComplete || payments.length === 0}
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
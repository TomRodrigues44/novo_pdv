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
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, QrCode, Banknote, Plus, Trash2, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaymentMethod {
  id: string;
  type: "debit" | "credit" | "pix" | "cash";
  amount: number;
  cashReceived?: number;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (payments: PaymentMethod[]) => void;
}

export const PaymentDialog = ({ open, onClose, total, onConfirm }: PaymentDialogProps) => {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<"debit" | "credit" | "pix" | "cash">("debit");
  const [amount, setAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

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

    if (selectedType === "cash") {
      const received = parseFloat(cashReceived);
      if (received && received >= paymentAmount) {
        newPayment.cashReceived = received;
      }
    }

    setPayments([...payments, newPayment]);
    setAmount("");
    setCashReceived("");
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    if (isComplete && payments.length > 0) {
      onConfirm(payments);
      setPayments([]);
      onClose();
    }
  };

  const handleClose = () => {
    setPayments([]);
    setAmount("");
    setCashReceived("");
    onClose();
  };

  // Calcular troco total
  const totalChange = payments.reduce((sum, p) => {
    if (p.type === "cash" && p.cashReceived) {
      return sum + (p.cashReceived - p.amount);
    }
    return sum;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total do Pedido:</span>
                <span className="text-2xl font-bold text-orange-600">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos Adicionados */}
          {payments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Pagamentos Realizados</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {payment.type === "debit" && <CreditCard className="h-5 w-5 text-blue-600" />}
                      {payment.type === "credit" && <CreditCard className="h-5 w-5 text-purple-600" />}
                      {payment.type === "pix" && <QrCode className="h-5 w-5 text-green-600" />}
                      {payment.type === "cash" && <Banknote className="h-5 w-5 text-amber-600" />}
                      <div>
                        <p className="font-medium">
                          {payment.type === "debit" && "Cartão de Débito"}
                          {payment.type === "credit" && "Cartão de Crédito"}
                          {payment.type === "pix" && "Pix"}
                          {payment.type === "cash" && "Dinheiro"}
                        </p>
                        {payment.type === "cash" && payment.cashReceived && (
                          <p className="text-sm text-gray-500">
                            Recebido: R$ {payment.cashReceived.toFixed(2)} • Troco: R$ {(payment.cashReceived - payment.amount).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">R$ {payment.amount.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePayment(payment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total Pago:</span>
                <span className="font-bold text-green-600">R$ {totalPaid.toFixed(2)}</span>
              </div>
              {remaining > 0.01 && (
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Restante:</span>
                  <span className="font-bold text-red-600">R$ {remaining.toFixed(2)}</span>
                </div>
              )}
              {totalChange > 0 && (
                <div className="flex justify-between items-center text-lg bg-green-50 p-3 rounded-lg">
                  <span className="font-medium text-green-700">Troco Total:</span>
                  <span className="font-bold text-green-700">R$ {totalChange.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Adicionar Pagamento */}
          {!isComplete && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Adicionar Pagamento</h3>
              
              <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="debit">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Débito
                  </TabsTrigger>
                  <TabsTrigger value="credit">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Crédito
                  </TabsTrigger>
                  <TabsTrigger value="pix">
                    <QrCode className="h-4 w-4 mr-2" />
                    Pix
                  </TabsTrigger>
                  <TabsTrigger value="cash">
                    <Banknote className="h-4 w-4 mr-2" />
                    Dinheiro
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="debit" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor do Pagamento
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Máximo: R$ ${remaining.toFixed(2)}`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="credit" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor do Pagamento
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Máximo: R$ ${remaining.toFixed(2)}`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pix" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor do Pagamento
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Máximo: R$ ${remaining.toFixed(2)}`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="cash" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor do Pagamento
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Máximo: R$ ${remaining.toFixed(2)}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor Recebido
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Valor que o cliente entregou"
                    />
                    {amount && cashReceived && parseFloat(cashReceived) < parseFloat(amount) && (
                      <p className="text-sm text-red-600 mt-1">
                        Valor recebido é menor que o pagamento!
                      </p>
                    )}
                    {amount && cashReceived && parseFloat(cashReceived) >= parseFloat(amount) && (
                      <p className="text-sm text-green-600 mt-1">
                        Troco: R$ {(parseFloat(cashReceived) - parseFloat(amount)).toFixed(2)}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={addPayment}
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Pagamento
              </Button>
            </div>
          )}

          {isComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-700">Pagamento Completo!</p>
              {totalChange > 0 && (
                <p className="text-green-600 mt-1">Troco a devolver: R$ {totalChange.toFixed(2)}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={!isComplete || payments.length === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Receipt, FileText, Printer, CheckCircle, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/product";

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freight: number;
  cartItems: CartItem[];
  payments: any[];
  onGenerateDocument: (type: "quote" | "fiscal") => void;
}

export const DocumentDialog = ({ open, onClose, total, freight, cartItems, payments, onGenerateDocument }: DocumentDialogProps) => {
  const totalChange = payments.reduce((sum: number, p: any) => {
    if (p.type === "cash" && p.cashReceived) {
      return sum + (p.cashReceived - p.amount);
    }
    return sum;
  }, 0);

  const subtotal = total - freight;

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case "debit": return "Cartão de Débito";
      case "credit": return "Cartão de Crédito";
      case "pix": return "Pix";
      case "cash": return "Dinheiro";
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-green-50">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Pagamento Confirmado!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Resumo da Venda */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="bg-orange-50 pb-3">
                  <h3 className="font-bold text-lg text-orange-800">Resumo da Venda</h3>
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {freight > 0 && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Frete (Entrega):
                        </span>
                        <span>R$ {freight.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-orange-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pagamentos Realizados */}
              <Card>
                <CardHeader className="bg-blue-50 pb-3">
                  <h3 className="font-bold text-lg text-blue-800">Pagamentos Realizados</h3>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <span className="text-sm">{getPaymentTypeName(payment.type)}</span>
                      <span className="font-semibold">R$ {payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {totalChange > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center text-green-600 font-bold">
                        <span>Troco:</span>
                        <span>R$ {totalChange.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Opções de Documento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-center">Escolha o Tipo de Documento</h3>
              
              <div className="space-y-4">
                {/* Opção Orçamento */}
                <Card 
                  className="cursor-pointer hover:border-orange-400 hover:shadow-lg transition-all border-2"
                  onClick={() => onGenerateDocument("quote")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-4 rounded-full">
                        <FileText className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">Orçamento</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Documento não fiscal para controle interno
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opção Cupom Fiscal */}
                <Card 
                  className="cursor-pointer hover:border-green-400 hover:shadow-lg transition-all border-2"
                  onClick={() => onGenerateDocument("fiscal")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-4 rounded-full">
                        <Receipt className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">Cupom Fiscal</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Documento fiscal enviado ao FISCO
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Printer className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Impressão</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Após escolher o tipo de documento, o cupom será gerado e estará pronto para impressão.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
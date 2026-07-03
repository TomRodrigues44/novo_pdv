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
import { Receipt, FileText, Printer, CheckCircle, Truck, Store, Phone, MapPin } from "lucide-react";
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

  const now = new Date();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-green-50">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Pagamento Confirmado!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Cupom Térmico */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-center">Pré-visualização do Cupom</h3>
              
              {/* Cupom Térmico */}
              <Card className="bg-white border-2 border-gray-300">
                <CardContent className="p-6">
                  {/* Container do cupom com largura fixa para simular impressora térmica */}
                  <div className="max-w-[280px] mx-auto font-mono text-xs leading-tight">
                    {/* Cabeçalho */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold">EMPÓRIO DAS COXINHAS</div>
                      <div className="text-xs mt-1">Salgados, Bolos e Doces</div>
                      <div className="flex items-center justify-center gap-1 mt-1 text-[10px]">
                        <MapPin className="h-3 w-3" />
                        <span>Rua das Coxinhas, 123</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[10px]">
                        <Phone className="h-3 w-3" />
                        <span>(95) 99999-9999</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Data e Hora */}
                    <div className="text-center mb-3">
                      <div className="text-[10px]">
                        {now.toLocaleDateString('pt-BR')} {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px]">CUPOM NÃO FISCAL</div>
                    </div>

                    <Separator className="my-3" />

                    {/* Itens */}
                    <div className="space-y-2 mb-3">
                      {cartItems.map((item, index) => {
                        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));
                        return (
                          <div key={index} className="border-b border-dotted border-gray-300 pb-1">
                            <div className="flex justify-between">
                              <span className="font-semibold">{item.quantity}x {item.name}</span>
                              <span>R$ {(price * item.quantity).toFixed(2)}</span>
                            </div>
                            {(item as any).flavors && (item as any).flavors.length > 0 && (
                              <div className="text-[10px] text-gray-600 mt-0.5">
                                Sabores: {(item as any).flavors.join(", ")}
                              </div>
                            )}
                            <div className="text-[10px] text-gray-500">
                              R$ {price.toFixed(2)} un.
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator className="my-3" />

                    {/* Totais */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {freight > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            Frete:
                          </span>
                          <span>R$ {freight.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Pagamentos */}
                    <div className="space-y-1 mb-3">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between">
                          <span>{getPaymentTypeName(payment.type)}</span>
                          <span>R$ {payment.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      {totalChange > 0 && (
                        <div className="flex justify-between font-bold text-green-600">
                          <span>Troco:</span>
                          <span>R$ {totalChange.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-3" />

                    {/* Rodapé */}
                    <div className="text-center text-[10px] text-gray-600 space-y-1">
                      <div>*** OBRIGADO PELA PREFERÊNCIA ***</div>
                      <div>Volte sempre!</div>
                      <div className="mt-2">Empório das Coxinhas</div>
                      <div>CNPJ: 00.000.000/0001-00</div>
                    </div>
                  </div>
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
                      Após escolher o tipo de documento, o cupom será gerado e estará pronto para impressão em impressora térmica não fiscal.
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
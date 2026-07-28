import { useState, useEffect } from "react";
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

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freight: number;
  cartItems: CartItem[];
  payments: any[];
  documentType: "quote" | "fiscal";
  saleId?: string;
  nfceData?: any;
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

export const ReceiptDialog = ({ open, onClose, total, freight, cartItems, payments, documentType, saleId, nfceData }: ReceiptDialogProps) => {
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
  const isFiscal = documentType === "fiscal";
  const documentTitle = isFiscal ? "NFC-e AUTORIZADA" : "ORÇAMENTO";
  
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  // Buscar QR Code quando for NFC-e
  useEffect(() => {
    const fetchQrCode = async () => {
      if (isFiscal && nfceData?.id) {
        try {
          const response = await fetch(`/api/nfce/${nfceData.id}/qr-code`);
          if (response.ok) {
            const data = await response.json();
            setQrCodeImage(data.image);
          }
        } catch (error) {
          console.error('Error fetching QR code:', error);
        }
      }
    };

    fetchQrCode();
  }, [isFiscal, nfceData?.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-orange-50">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            {documentTitle} Gerado!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">Cupom Não Fiscal</h3>
            
            {/* Cupom Térmico */}
            <Card className="bg-white border-2 border-gray-300 printable-receipt">
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
                                        <div className="text-[10px] font-bold">{documentTitle}</div>
                                        {isFiscal && nfceData && (
                                          <div className="text-[10px] font-semibold text-green-600 mt-1">
                                            #{nfceData.numero}
                                          </div>
                                        )}
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
                                      
                                      {isFiscal && nfceData && (
                                        <>
                                          <Separator className="my-3 border-dashed" />
                                          <div className="nfce-info bg-green-50 p-2 rounded">
                                            <div className="text-[10px] font-bold text-green-800 mb-1">
                                              NFC-e AUTORIZADA
                                            </div>
                                            <div className="text-[9px] text-gray-600 mb-1">
                                              Protocolo: {nfceData.protocolo}
                                            </div>
                                            <div className="text-[9px] text-gray-600 mb-2 break-all">
                                                                        Chave: {nfceData.chave_acesso}
                                                                      </div>
                                                                      {/* QR Code Real */}
                                                                      <div className="qr-code-placeholder bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center p-2">
                                                                        {qrCodeImage ? (
                                                                          <img
                                                                            src={qrCodeImage}
                                                                            alt="QR Code NFC-e"
                                                                            className="w-[150px] h-[150px]"
                                                                          />
                                                                        ) : (
                                                                          <div className="text-center">
                                                                            <div className="text-6xl mb-1">📱</div>
                                                                            <div className="text-[8px] text-gray-500">
                                                                              Gerando QR Code...
                                                                            </div>
                                                                          </div>
                                                                        )}
                                                                      </div>
                                                                      <div className="text-[8px] text-blue-600 mt-2 break-all">
                                                                        {nfceData.url_consulta}
                                                                      </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                  
                          <DialogFooter className="px-6 py-4 border-t bg-gray-50 gap-2">
                                    <Button variant="outline" onClick={onClose}>
                                      Fechar
                                    </Button>
                                    <Button onClick={handlePrint} className="flex-1">
                                      <Printer className="h-4 w-4 mr-2" />
                                      Imprimir Cupom
                                    </Button>
                                  </DialogFooter>
        
                {isFiscal && nfceData && (
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      .printable-receipt, .printable-receipt * {
                        visibility: visible;
                      }
                      .printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        font-family: Courier New, monospace;
                        font-size: 12px;
                        padding: 5mm;
                        background: white;
                        color: black;
                        line-height: 1.4;
                      }
                      .printable-receipt .nfce-info {
                        display: block !important;
                        margin: 10px 0;
                        padding: 8px;
                        border: 2px solid #000;
                        text-align: center;
                      }
                      .printable-receipt .qr-code-placeholder {
                        display: block !important;
                        width: 150px;
                        height: 150px;
                        margin: 10px auto;
                        border: 2px dashed #000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        text-align: center;
                      }
                      .printable-receipt h2,
                      .printable-receipt h3 {
                        font-size: 16px;
                        text-align: center;
                        margin-bottom: 5px;
                        font-weight: bold;
                      }
                      .printable-receipt p {
                        margin: 2px 0;
                      }
                      .printable-receipt .border-b-2,
                      .printable-receipt .border-t {
                        border-bottom: 2px dashed black;
                        border-top: 2px dashed black;
                      }
                      .printable-receipt .flex {
                        display: flex;
                        justify-content: space-between;
                      }
                      .printable-receipt .font-bold {
                        font-weight: bold;
                      }
                      .printable-receipt .text-center {
                        text-align: center;
                      }
                      .printable-receipt .text-sm {
                        font-size: 10px;
                      }
                      .printable-receipt .text-xs {
                        font-size: 9px;
                      }
                      .printable-receipt .text-gray-500,
                      .printable-receipt .text-gray-600,
                      .printable-receipt .text-red-600,
                      .printable-receipt .text-red-700,
                      .printable-receipt .text-green-600,
                      .printable-receipt .text-green-700,
                      .printable-receipt .text-amber-600,
                      .printable-receipt .text-amber-700,
                      .printable-receipt .text-blue-600,
                      .printable-receipt .text-blue-700,
                      .printable-receipt .text-orange-600,
                      .printable-receipt .text-orange-700,
                      .printable-receipt .dialog-header,
                      .printable-receipt .dialog-footer,
                      .printable-receipt button {
                        display: none;
                      }
                    }
                  `}</style>
                )}

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-receipt, .printable-receipt * {
              visibility: visible;
            }
            .printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              font-family: Courier New, monospace;
              font-size: 12px;
              padding: 5mm;
              background: white;
              color: black;
              line-height: 1.4;
            }
            .printable-receipt h2,
            .printable-receipt h3 {
              font-size: 16px;
              text-align: center;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .printable-receipt p {
              margin: 2px 0;
            }
            .printable-receipt .border-b-2,
            .printable-receipt .border-t {
              border-bottom: 2px dashed black;
              border-top: 2px dashed black;
            }
            .printable-receipt .flex {
              display: flex;
              justify-content: space-between;
            }
            .printable-receipt .font-bold {
              font-weight: bold;
            }
            .printable-receipt .text-center {
              text-align: center;
            }
            .printable-receipt .text-sm {
              font-size: 10px;
            }
            .printable-receipt .text-xs {
              font-size: 9px;
            }
            .printable-receipt .text-gray-500,
            .printable-receipt .text-gray-600,
            .printable-receipt .text-red-600,
            .printable-receipt .text-red-700,
            .printable-receipt .text-green-600,
            .printable-receipt .text-green-700,
            .printable-receipt .text-amber-600,
            .printable-receipt .text-amber-700,
            .printable-receipt .text-blue-600,
            .printable-receipt .text-blue-700,
            .printable-receipt .text-orange-600,
            .printable-receipt .text-orange-700,
            .printable-receipt .dialog-header,
            .printable-receipt .dialog-footer,
            .printable-receipt button {
              display: none;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
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
import { Receipt, FileText, Printer, CheckCircle, Truck, Store, Phone, MapPin, AlertTriangle, Loader2, RefreshCw, Download, Copy, AlertOctagon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/types/product";
import { toast } from "sonner";

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freedom: number;
  cartItems: CartItem[];
  payments: any[];
  onGenerateDocument: (type: "quote" | "fiscal") => void;
  saleId?: string;
}

export const DocumentDialog = ({ open, onClose, total, freedom, cartItems, payments, onGenerateDocument, saleId }: DocumentDialogProps) => {
  const [isSending, setIsSending] = useState(false);
  const [fiscalResult, setFiscalResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isContingency, setIsContingency] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const totalChange = payments.reduce((sum: number, p: any) => {
    if (p.type === "cash" && p.cashReceived) {
      return sum + (p.cashReceived - p.amount);
    }
    return sum;
  }, 0);

  const subtotal = total - freedom;

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

  const handleGenerateQuote = () => {
    onGenerateDocument("quote");
    setShowPrintDialog(true);
  };

  const handlePrintQuote = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Orçamento - Empório das Coxinhas</title>
            <style>
              body {
                font-family: 'Courier New, monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                line-height: 1.4;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px dashed #000;
                padding-bottom: 10px;
              }
              .section {
                margin-bottom: 15px;
              }
              .section-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              .total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
                border-top: 2px dashed #000;
                padding-top: 10px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 2px dashed #000;
                font-size: 10px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>EMPÓRIO DAS COXINHAS</h2>
              <p>ORÇAMENTO NÃO FISCAL</p>
              <p>PARA CONTROLE INTERNO</p>
            </div>

            <div class="section">
              <div class="section-title">DADOS DO ORÇAMENTO</div>
              <div class="row">
                <span>Número:</span>
                <span>ORC-${Date.now().toString().slice(-6)}</span>
              </div>
              <div class="row">
                <span>Data:</span>
                <span>${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">CLIENTE</div>
              <div class="row">
                <span>Nome:</span>
                <span>CONSUMIDOR NÃO IDENTIFICADO</span>
              </div>
              <div class="row">
                <span>CPF/CNPJ:</span>
                <span>***.***.***-**</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ITENS DO ORÇAMENTO</div>
              ${cartItems.map((item, index) => `
                <div class="row">
                  <span>${index + 1} ${item.name}</span>
                  <span>${item.quantity}x R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                ${(item as any).flavors && (item as any).flavors.length > 0 ? `
                <div style="font-size: 10px; color: #666; margin-left: 20px;">
                  Sabores: ${(item as any).flavors.join(", ")}
                </div>
                ` : ''}
              `).join('')}
            </div>

            <div class="section">
              <div class="section-title">RESUMO</div>
              <div class="row">
                <span>Subtotal:</span>
                <span>R$ ${subtotal.toFixed(2)}</span>
              </div>
              ${freedom > 0 ? `
              <div class="row">
                <span>Frete:</span>
                <span>R$ ${freedom.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total">
                <div class="row">
                  <span>TOTAL:</span>
                  <span>R$ ${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">FORMA DE PAGAMENTO</div>
              ${payments.map((payment) => `
                <div class="row">
                  <span>${getPaymentTypeName(payment.type)}:</span>
                  <span>R$ ${payment.amount.toFixed(2)}</span>
                </div>
                ${payment.type === 'cash' && payment.change > 0 ? `
                <div class="row" style="color: green;">
                  <span>Troco:</span>
                  <span>R$ ${payment.change.toFixed(2)}</span>
                </div>
                ` : ''}
              `).join('')}
            </div>

            <div class="footer">
              <p>*** ORÇAMENTO NÃO TEM VALOR FISCAL ***</p>
              <p>Empório das Coxinhas</p>
              <p>Este documento serve apenas como orçamento e não substitui nota fiscal.</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setShowPrintDialog(false);
    }
  };

  const handleSendToFiscal = async () => {
    setIsSending(true);
    setError(null);
    setFiscalResult(null);
    setIsContingency(false);

    try {
      const response = await fetch('/api/fiscal/send-nfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId,
          saleData: {
            total,
            freedom,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              flavors: (item as any).flavors,
            })),
            payments,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFiscalResult(result);
        toast.success('Nota fiscal emitida com sucesso!');
        setShowPrintDialog(true);
      } else {
        const errorData = await response.json();
        setError(errorData.statusMessage || 'Erro ao emitir nota fiscal');
        setIsContingency(true);
        toast.error('Erro ao emitir nota fiscal. Nota armazenada em contingência.');
      }
    } catch (err) {
      console.error('Error sending to SEFAZ:', err);
      setError('Erro de comunicação com SEFAZ. Nota armazenada em contingência.');
      setIsContingency(true);
      toast.error('Erro de comunicação com SEFAZ. Nota armazenada em contingência.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePrintFiscal = () => {
    if (fiscalResult?.xml) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cupom Fiscal - Nota ${fiscalResult.numeroNota}</title>
            <style>
              body {
                font-family: 'Courier New, monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                line-height: 1.4;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px dashed #000;
                padding-bottom: 10px;
              }
              .section {
                margin-bottom: 15px;
              }
              .section-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              .total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
                border-top: 2px dashed #000;
                padding-top: 10px;
              }
              .qr-code {
                text-align: center;
                margin-top: 20px;
                padding: 10px;
                border: 2px solid #000;
              }
              .qr-code img {
                max-width: 200px;
              }
              .protocolo {
                text-align: center;
                margin-top: 10px;
                font-size: 11px;
                color: #666;
              }
              .chave {
                font-size: 9px;
                word-break: break-all;
                margin-top: 10px;
                text-align: center;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>DANFE SEFAZ-RR</h2>
              <p>DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
              <p>PARA USO DO FISCO</p>
            </div>

            <div class="section">
              <div class="section-title">DADOS DA NOTA FISCAL</div>
              <div class="row">
                <span>Número:</span>
                <span>${fiscalResult.numeroNota}</span>
              </div>
              <div class="row">
                <span>Série:</span>
                <span>${fiscalResult.serie}</span>
              </div>
              <div class="row">
                <span>Data Emissão:</span>
                <span>${now.toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="row">
                <span>Protocolo:</span>
                <span>${fiscalResult.protocolo}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DADOS DO DESTINATÁRIO</div>
              <div class="row">
                <span>CPF/CNPJ:</span>
                <span>***.***.***-**</span>
              </div>
              <div class="row">
                <span>Nome:</span>
                <span>CONSUMIDOR NÃO IDENTIFICADO</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ITENS DA NOTA</div>
              ${cartItems.map((item, index) => `
                <div class="row">
                  <span>${index + 1} ${item.name}</span>
                  <span>${item.quantity}x R$ ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                ${(item as any).flavors && (item as any).flavors.length > 0 ? `
                  <div style="font-size: 10px; color: #666; margin-left: 20px;">
                    Sabores: ${(item as any).flavors.join(", ")}
                  </div>
                ` : ''}
              `).join('')}
            </div>

            <div class="total">
              <div class="row">
                <span>Total da Nota:</span>
                <span>R$ ${total.toFixed(2)}</span>
              </div>
              ${freedom > 0 ? `
              <div class="row">
                <span>Frete:</span>
                <span>R$ ${freedom.toFixed(2)}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">FORMA DE PAGAMENTO</div>
              ${payments.map((payment) => `
                <div class="row">
                  <span>${getPaymentTypeName(payment.type)}:</span>
                  <span>R$ ${payment.amount.toFixed(2)}</span>
                </div>
                ${payment.type === 'cash' && payment.change > 0 ? `
                <div class="row" style="color: green;">
                  <span>Troco:</span>
                  <span>R$ ${payment.change.toFixed(2)}</span>
                </div>
                ` : ''}
              `).join('')}
            </div>

            <div class="qr-code">
              <p style="font-size: 10px; margin-bottom: 5px;">QR Code para consulta:</p>
              <img src="${fiscalResult.qrCode}" alt="QR Code" />
            </div>

            <div class="protocolo">
              <p>Consulta pela chave de acesso em:</p>
              <p>https://www.sefaz.rs.gov.br/nfce/consulta</p>
            </div>

            <div class="chave">
              <p>Chave de Acesso:</p>
              <p>${fiscalResult.chaveAcesso}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setShowPrintDialog(false);
    }
  };

  const handleCopyChave = () => {
    if (fiscalResult?.chaveAcesso) {
      navigator.clipboard.writeText(fiscalResult.chaveAcesso);
      toast.success('Chave de acesso copiada!');
    }
  };

  const handleDownloadXML = () => {
    if (fiscalResult?.xml) {
      const blob = new Blob([fiscalResult.xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfe-${fiscalResult.numeroNota}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('XML baixado com sucesso!');
    }
  };

  const handleRetryFiscal = () => {
    handleSendToFiscal();
  };

  const handlePrintQuote = () => {
    handlePrintQuote();
  };

  return (
    <>
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
              {/* Coluna Esquerda - Resumo do Pedido */}
              <div className="space-y-4">
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
                      {freedom > 0 && (
                        <div className="flex justify-between items-center text-blue-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            Frete (Entrega):
                          </span>
                          <span>R$ {freedom.toFixed(2)}</span>
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

              {/* Coluna Direita - Opções de Documento */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-center">Escolha o Tipo de Documento</h3>
                
                <div className="space-y-4">
                  {/* Opção Orçamento */}
                  <Card 
                    className="cursor-pointer hover:border-orange-400 hover:shadow-lg transition-all border-2"
                    onClick={handleGenerateQuote}
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
                    onClick={handleSendToFiscal}
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

                {/* Status do Envio Fiscal */}
                {isSending && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <div>
                          <p className="font-semibold text-blue-900">Enviando para SEFAZ...</p>
                          <p className="text-sm text-blue-700">Aguarde enquanto a nota é processada</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Erro / Contingência */}
                {error && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertOctagon className="h-6 w-6 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">Nota em Contingência</p>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                          <div className="mt-4">
                            <Button
                              onClick={handleRetryFiscal}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Tentar Novamente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contingência */}
                {isContingency && !error && !isSending && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900">Nota em Contingência</p>
                          <p className="text-sm text-amber-700 mt-1">
                            A nota foi armazenada em contingência. Você poderá tentar o envio novamente dentro do prazo vigente.
                          </p>
                          <div className="mt-4">
                            <Button
                              onClick={handleRetryFiscal}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Tentar Novamente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Resultado Sucesso */}
                {fiscalResult && !isSending && !isContingency && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900">Nota Fiscal Emitida com Sucesso!</p>
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Número:</span>
                              <span className="font-semibold">{fiscalResult.numeroNota}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Série:</span>
                              <span className="font-semibold">{fiscalResult.serie}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Protocolo:</span>
                              <span className="font-semibold">{fiscalResult.protocolo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Chave de Acesso:</span>
                              <span className="font-mono text-xs">{fiscalResult.chaveAcesso.slice(0, 20)}...</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => setShowPrintDialog(true)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Imprimir Cupom
                            </Button>
                            <Button
                              onClick={handleCopyChave}
                              variant="outline"
                              className="flex-1"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Chave
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Printer className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Impressão</p>
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

      {/* Dialog de Impressão */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imprimir Documento</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {fiscalResult ? 'Cupom Fiscal' : 'Orçamento'}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (fiscalResult) {
                      handlePrintFiscal();
                    } else {
                      handlePrintQuote();
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                
                {fiscalResult && (
                  <Button
                    onClick={handleDownloadXML}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar XML
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
    </>
  );
};
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
import {
  Receipt,
  FileText,
  Printer,
  CheckCircle,
  Truck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download,
  Copy,
  AlertOctagon,
} from "lucide-react";
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

interface FiscalResult {
  xml?: string;
  numeroNota: string;
  serie: string;
  protocolo: string;
  chaveAcesso: string;
  qrCode: string;
}

export const DocumentDialog = ({
  open,
  onClose,
  total,
  freedom,
  cartItems,
  payments,
  onGenerateDocument,
  saleId,
}: DocumentDialogProps) => {
  const [isSending, setIsSending] = useState(false);
  const [fiscalResult, setFiscalResult] = useState<FiscalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isContingency, setIsContingency] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const subtotal = total - freedom;
  const now = new Date();

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case "debit":
        return "Cartão de Débito";
      case "credit":
        return "Cartão de Crédito";
      case "pix":
        return "Pix";
      case "cash":
        return "Dinheiro";
      default:
        return type;
    }
  };

  const buildItemsHtml = () =>
    cartItems
      .map((item, index) => {
        let html = `
          <tr>
            <td>${index + 1} - ${item.name}</td>
            <td>${item.quantity}x</td>
            <td>R$ ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
        const flavors = (item as any).flavors;
        if (flavors && flavors.length > 0) {
          html += `<tr><td colspan="3">Sabores: ${flavors.join(", ")}</td></tr>`;
        }
        return html;
      })
      .join("");

  const buildPaymentsHtml = () =>
    payments
      .map((payment) => {
        let html = `<p>${getPaymentTypeName(payment.type)}: R$ ${payment.amount.toFixed(2)}</p>`;
        if (payment.type === "cash" && payment.change > 0) {
          html += `<p>Troco: R$ ${payment.change.toFixed(2)}</p>`;
        }
        return html;
      })
      .join("");

  const handleGenerateQuote = () => {
    onGenerateDocument("quote");
    setShowPrintDialog(true);
  };

  const handleGenerateFiscal = () => {
    onGenerateDocument("fiscal");
    handleSendToFiscal();
  };

  const handlePrintQuote = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Orçamento</title></head>
        <body>
          <h2>EMPÓRIO DAS COXINHAS</h2>
          <h3>ORÇAMENTO NÃO FISCAL</h3>
          <p>Número: ORC-${Date.now().toString().slice(-6)}</p>
          <p>Data: ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
          <hr/>
          <table>${buildItemsHtml()}</table>
          <hr/>
          <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
          ${freedom > 0 ? `<p>Frete: R$ ${freedom.toFixed(2)}</p>` : ""}
          <p><strong>TOTAL: R$ ${total.toFixed(2)}</strong></p>
          <hr/>
          ${buildPaymentsHtml()}
          <hr/>
          <p><em>*** ORÇAMENTO NÃO TEM VALOR FISCAL ***</em></p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowPrintDialog(false);
  };

  const handleSendToFiscal = async () => {
    setIsSending(true);
    setError(null);
    setFiscalResult(null);
    setIsContingency(false);

    try {
      const response = await fetch("/api/fiscal/send-nfe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId,
          saleData: {
            total,
            freedom,
            items: cartItems.map((item) => ({
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
        const result = (await response.json()) as FiscalResult;
        setFiscalResult(result);
        toast.success("Nota fiscal emitida com sucesso!");
        setShowPrintDialog(true);
      } else {
        const errorData = await response.json();
        setError(errorData.statusMessage || "Erro ao emitir nota fiscal");
        setIsContingency(true);
        toast.error("Erro ao emitir nota fiscal. Nota armazenada em contingência.");
      }
    } catch (err) {
      console.error("Error sending to SEFAZ:", err);
      setError("Erro de comunicação com SEFAZ. Nota armazenada em contingência.");
      setIsContingency(true);
      toast.error("Erro de comunicação com SEFAZ. Nota armazenada em contingência.");
    } finally {
      setIsSending(false);
    }
  };

  const handlePrintFiscal = () => {
    if (!fiscalResult) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>DANFE</title></head>
        <body>
          <h2>DANFE SEFAZ-RR</h2>
          <p>Número: ${fiscalResult.numeroNota}</p>
          <p>Série: ${fiscalResult.serie}</p>
          <p>Data Emissão: ${now.toLocaleDateString("pt-BR")}</p>
          <p>Protocolo: ${fiscalResult.protocolo}</p>
          <hr/>
          <table>${buildItemsHtml()}</table>
          <hr/>
          <p>Total: R$ ${total.toFixed(2)}</p>
          ${freedom > 0 ? `<p>Frete: R$ ${freedom.toFixed(2)}</p>` : ""}
          <hr/>
          ${buildPaymentsHtml()}
          <hr/>
          <p>Chave de Acesso: ${fiscalResult.chaveAcesso}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowPrintDialog(false);
  };

  const handleCopyChave = () => {
    if (fiscalResult?.chaveAcesso) {
      navigator.clipboard.writeText(fiscalResult.chaveAcesso);
      toast.success("Chave de acesso copiada!");
    }
  };

  const handleDownloadXML = () => {
    if (!fiscalResult?.xml) return;
    const blob = new Blob([fiscalResult.xml], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nfe-${fiscalResult.numeroNota}.xml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("XML baixado com sucesso!");
  };

  const handleRetryFiscal = () => {
    handleSendToFiscal();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Pagamento Confirmado!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Resumo do Pedido</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {cartItems.map((item, index) => (
                  <div key={item.id ?? index}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        {(item as any).flavors && (item as any).flavors.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Sabores: {(item as any).flavors.join(", ")}
                          </p>
                        )}
                      </div>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {index < cartItems.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                {freedom > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Frete (Entrega):
                    </span>
                    <span>R$ {freedom.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="font-semibold mb-2">Escolha o Tipo de Documento</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className="cursor-pointer hover:border-blue-500"
                  onClick={handleGenerateQuote}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Orçamento</p>
                      <p className="text-xs text-gray-500">
                        Documento não fiscal para controle interno
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-green-500"
                  onClick={handleGenerateFiscal}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Receipt className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold">Cupom Fiscal</p>
                      <p className="text-xs text-gray-500">
                        Documento fiscal enviado ao FISCO
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {isSending && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-semibold">Enviando para SEFAZ...</p>
                    <p className="text-xs text-gray-500">
                      Aguarde enquanto a nota é processada
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-red-300">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertOctagon className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Nota em Contingência</p>
                    <p className="text-sm text-gray-600">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={handleRetryFiscal}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isContingency && !error && !isSending && (
              <Card className="border-yellow-300">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Nota em Contingência</p>
                    <p className="text-sm text-gray-600">
                      A nota foi armazenada em contingência. Você poderá tentar o envio
                      novamente dentro do prazo vigente.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={handleRetryFiscal}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {fiscalResult && !isSending && !isContingency && (
              <Card className="border-green-300">
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Nota Fiscal Emitida com Sucesso!</p>
                    <p className="text-sm">
                      <span className="text-gray-500">Número: </span>
                      {fiscalResult.numeroNota}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Série: </span>
                      {fiscalResult.serie}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Protocolo: </span>
                      {fiscalResult.protocolo}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Chave de Acesso: </span>
                      {fiscalResult.chaveAcesso.slice(0, 20)}...
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setShowPrintDialog(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir Cupom
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopyChave}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar Chave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-50">
              <CardContent className="p-4 flex items-start gap-3">
                <Printer className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Impressão</p>
                  <p className="text-xs text-gray-500">
                    Após escolher o tipo de documento, o cupom será gerado e estará
                    pronto para impressão em impressora térmica não fiscal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Imprimir Documento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {fiscalResult ? "Cupom Fiscal" : "Orçamento"}
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
    </>
  );
};

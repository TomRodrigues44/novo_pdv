"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Printer, FileText, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";

interface CashRegisterPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closedRegisterData: any;
  closeResult: any;
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR');
};

export const CashRegisterPrintDialog = ({ open, onOpenChange, closedRegisterData, closeResult }: CashRegisterPrintDialogProps) => {
  const [printMode, setPrintMode] = useState<'receipt' | 'detailed'>('receipt');
  const printRef = useState<HTMLDivElement>(null)[0];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Fechamento-Caixa-${closedRegisterData?.id || Date.now()}`,
  });

  const handlePrintClick = () => {
    setPrintMode('receipt');
    handlePrint();
  };

  const handleDetailedPrint = () => {
    setPrintMode('detailed');
    handlePrint();
  };

  if (!closedRegisterData) return null;

  const totalWithdrawals = (closedRegisterData.transactions || [])
    .filter((t: any) => t.type === 'withdrawal')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const totalAdditions = (closedRegisterData.transactions || [])
    .filter((t: any) => t.type === 'addition')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const totalVouchers = (closedRegisterData.transactions || [])
    .filter((t: any) => t.type === 'voucher')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório de Fechamento de Caixa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Botões de ação */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDetailedPrint}
              >
                <Download className="mr-2 h-4 w-4" />
                Versão Detalhada
              </Button>
              <Button
                onClick={handlePrintClick}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>

            {/* Conteúdo do relatório */}
            <div ref={printRef} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="border-2 border-orange-200 rounded-lg p-6">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b border-dashed">
                  <h2 className="text-2xl font-bold text-orange-600">EMPÓRIO DAS COXINHAS</h2>
                  <p className="text-sm text-gray-600 mt-1">Relatório de Fechamento de Caixa</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(closedRegisterData.closed_at)}
                  </p>
                </div>

                {/* Resumo financeiro */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-blue-600 font-medium">Abertura</p>
                    <p className="text-lg font-bold text-blue-700">
                      {currency(parseFloat(closedRegisterData.opening_amount))}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-green-600 font-medium">Vendas</p>
                    <p className="text-lg font-bold text-green-700">
                      {currency(closeResult?.salesTotal || 0)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-orange-600 font-medium">Contado</p>
                    <p className="text-lg font-bold text-orange-700">
                      {currency(closeResult?.closingCash || 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-xs text-purple-600 font-medium">Diferença</p>
                    <p className={`text-lg font-bold ${
                      (closeResult?.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currency(closeResult?.difference || 0)}
                    </p>
                  </div>
                </div>

                {/* Detalhamento de transações */}
                <div className="space-y-4">
                  {/* Vendas por forma de pagamento */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Vendas por Forma de Pagamento</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(closedRegisterData.salesByPayment || {}).map(([type, amount]) => (
                        <div key={type} className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-500 capitalize">{type}</p>
                          <p className="font-medium">{currency(Number(amount))}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sangrias */}
                  {totalWithdrawals > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-red-700">Sangrias</h3>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Total: {currency(totalWithdrawals)}</p>
                        <div className="space-y-2">
                          {(closedRegisterData.transactions || [])
                            .filter((t: any) => t.type === 'withdrawal')
                            .map((trans: any) => (
                              <div key={trans.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{trans.description}</span>
                                <span className="text-red-600">-{currency(parseFloat(trans.amount))}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Adições */}
                  {totalAdditions > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-green-700">Adições</h3>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Total: {currency(totalAdditions)}</p>
                        <div className="space-y-2">
                          {(closedRegisterData.transactions || [])
                            .filter((t: any) => t.type === 'addition')
                            .map((trans: any) => (
                              <div key={trans.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{trans.description}</span>
                                <span className="text-green-600">+{currency(parseFloat(trans.amount))}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vales */}
                  {totalVouchers > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-amber-700">Vales</h3>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Total: {currency(totalVouchers)}</p>
                        <div className="space-y-2">
                          {(closedRegisterData.transactions || [])
                            .filter((t: any) => t.type === 'voucher')
                            .map((trans: any) => (
                              <div key={trans.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{trans.description}</span>
                                <span className="text-amber-600">-{currency(parseFloat(trans.amount))}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {closedRegisterData.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Observações:</strong> {closedRegisterData.notes}
                    </p>
                  </div>
                )}

                {/* Rodapé */}
                <div className="mt-6 pt-4 border-t border-dashed text-center text-xs text-gray-500">
                  <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
                  <p>Empório das Coxinhas</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
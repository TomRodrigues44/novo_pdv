import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: any[];
  total: number;
  onSuccess: () => void;
}

export const PaymentDialog = ({ open, onOpenChange, items, total, onSuccess }: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const result = await response.json();
      toast.success('Venda realizada com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro', icon: DollarSign },
    { value: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
    { value: 'debit', label: 'Cartão de Débito', icon: CreditCard },
    { value: 'pix', label: 'PIX', icon: QrCode },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total a pagar</span>
              <span className="text-2xl font-bold text-orange-600">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label
                      htmlFor={method.value}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Icon className="h-4 w-4" />
                      {method.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
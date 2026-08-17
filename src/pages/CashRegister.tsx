import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, Plus, Lock, Unlock, Minus, CreditCard, QrCode, Banknote, Printer, Receipt, Bike, Utensils, Smartphone } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CashRegister = () => {
  // ... existing hooks and state ...
  
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // ... existing useQuery for cashData ...

  useEffect(() => {
    // Verificar se email foi enviado no close result
    if (closeResult?.emailSent) {
      setEmailSent(true);
    }
    if (closeResult?.emailMessage) {
      toast.success(closeResult.emailMessage);
    }
    if (closeResult?.emailError) {
      setEmailError(closeResult.emailError);
      toast.error(closeResult.emailError);
    }
  }, [closeResult]);

  // No Card de Fechamento de Caixa, adicionar status do email:
  {currentRegister && (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-green-600" />
          Envio de Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Email enviado com sucesso para tom.santanna@gmail.com</span>
          </div>
        ) : emailError ? (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Erro ao enviar email: {emailError}</span>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">
            O relatório será enviado por email automaticamente após o fechamento do caixa.
          </p>
        )}
      </CardContent>
    </Card>
  )}

  // No Dialog de sucesso do fechamento, adicionar informação:
  {isCloseSuccessDialogOpen && closeResult && (
    <>
      <p className="text-sm text-gray-500 mb-4">
        <strong>Email:</strong> {emailSent ? 'Enviado com sucesso!' : 'Em processamento...'}
      </p>
      {emailError && (
        <p className="text-red-500 mb-4">Erro: {emailError}</p>
      )}
    </>
  )}

  // No DialogFooter do close success, manter os botões normais
  // ... rest of component
}
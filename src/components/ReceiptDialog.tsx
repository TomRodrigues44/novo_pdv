import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { useRef } from 'react';

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freight: number;
  cartItems: any[];
  payments: any[];
  documentType: 'quote' | 'fiscal';
  saleId?: string;
  nfceData: any;
}

const paymentLabels: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  other: 'Outros',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (date: string | undefined) =>
  date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '';

const ReceiptDialog = ({
  open,
  onClose,
  total,
  freight,
  cartItems,
  payments,
  documentType,
  saleId,
  nfceData,
}: ReceiptDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { print } = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${documentType} - ${saleId || 'NF-e'}`,
  });

  // Simple monospaced layout for 80 mm printer
  const printableStyle: React.CSSProperties = {
    width: '100mm',               // fits 80 mm printer
    fontFamily: 'Courier New, monospace',
    fontSize: '10px',
    lineHeight: '1.3',
    padding: '2mm',
    margin: '0 auto',
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-[100mm] mx-auto p-2">
        {/* Header */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold">
            {documentType === 'fiscal' ? 'NF‑e' : 'Orçamento'}
          </DialogTitle>
        </DialogHeader>

        {/* Body – printable area */}
        <div style={printableStyle}>
          {/* Empresa */}
          <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
            <strong>{nfceData?.emitente?.razao_social || 'EMPÓRIO DAS COXINHAS'}</strong>
            <div style={{ fontSize: '9px', color: '#555' }}>
              {nfceData?.logradouro}, {nfceData?.numero} - {nfceData?.bairro}
              <br />
              {nfceData?.municipio}/{nfceData?.uf} - CEP {nfceData?.cep}
              <br />
              Fone: {nfceData?.telefone}
            </div>
          </div>

          {/* Cliente */}
          <div style={{ marginBottom: '2mm' }}>
            <strong>Cliente:</strong> {nfceData?.destinatario?.nome || 'Consumidor'}</div>
            <div style={{ fontSize: '9px', color: '#555' }}>
              CPF/CNPJ: {nfceData?.destinatario?.cpf_cnpj || '-'}<br />
              Endereço: {nfceData?.destinatario?.logradouro}, {nfceData?.destinatario?.numero}<br />
              {nfceData?.destinatario?.bairro}, {nfceData?.destinatario?.municipio}/{nfceData?.destinatario?.uf}
            </div>
          </div>

          {/* Itens */}
          <div style={{ marginBottom: '2mm' }}>
            <strong>Itens</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000' }}>
                  <th style="width: 60%; text-align: left;">Produto</th>
                  <th style="width: 15%; text-align: right;">Qtd</th>
                  <th style="width: 25%; text-align: right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item: any) => (
                  <tr key={item.id}>
                    <td style="padding-left: 2mm;">{item.name}{item.flavors ? ` – ${item.flavors.join(', ')}` : ''}</td>
                    <td style="text-align: right; padding-right: 2mm;">{item.quantity}</td>
                    <td style="text-align: right; padding-right: 2mm;">{formatCurrency(parseFloat(item.price) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagamentos */}
          <div style={{ marginBottom: '2mm' }}>
            <strong>Pagamentos</strong>
            <div style={{ fontSize: '9px' }}>
              {payments.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{paymentLabels[p.type] || p.type}</span>
                  <span className="text-right">{formatCurrency(p.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Totais */}
          <div style={{ marginBottom: '2mm' }}>
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>{formatCurrency(total - freight)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete:</span>
              <span>{formatCurrency(freight)}</span>
            </div>
            <div className="font-semibold">
              <div>Total:</div>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Informações complementares */}
          <div style={{ marginBottom: '2mm' }}>
            <p style={{ fontSize: '9px', color: '#555' }}>
              {nfceData?.observacao || 'Documento auxiliar da NF‑e.'}
              {nfceData?.url_consulta && (
                <br />
                <span>URL de consulta: {nfceData.url_consulta}</span>
              )}
            </p>
          </div>

          {/* QR Code (optional) */}
          {nfceData?.qr_code && (
            <div style={{ marginTop: '2mm', textAlign: 'center' }}>
              <img src={nfceData.qr_code} alt="QR Code" style={{ width: '80px', height: '80px' }} />
            </div>
            <p style={{ fontSize: '8px', color: '#555' }}>
              Escaneie este QR‑code para validar a NF‑e.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter style={{ textAlign: 'center', fontSize: '9px' }}>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={print}>
            <Printer className="mr-1" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
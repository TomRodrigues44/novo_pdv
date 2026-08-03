import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { QRCode } from 'react-qrcode-logo';

interface NfceData {
  id: number;
  chave_acesso: string;
  numero: number;
  serie: number;
  data_autorizacao: string;
  protocolo: string;
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente';
  qr_code: string;
  xml_retorno: string;
  url_consulta: string;
  ambiente: string;
  mensagem_status: string;
}

interface SaleData {
  id: number;
  customer_name?: string;
  total_amount: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  payments: {
    tipo: string;
    valor: number;
  }[];
  created_at: string;
}

interface CompanyConfig {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  inscricao_estadual: string;
}

const paymentTypeMap: Record<string, string> = {
  cash: 'Dinheiro',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
  other: 'Outros',
};

export function DocumentDialog({ open, onOpenChange, nfce, sale, isBudget = false }: { open: boolean, onOpenChange: (open: boolean) => void, nfce: NfceData | null, sale: SaleData | null, isBudget?: boolean }) {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/fiscal/company-config')
        .then(res => res.json())
        .then(data => setCompanyConfig(data))
        .catch(err => console.error("Failed to fetch company config:", err));
    }
  }, [open]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `NFC-e-${nfce?.numero || sale?.id}`,
  });

  const formatCnpj = (cnpj: string) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    if (phone.length === 11) {
      return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    if (phone.length === 10) {
      return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return phone;
  }

  const isNfceAuthorized = nfce && nfce.status === 'autorizada';
  const title = isBudget ? 'Orçamento' : (isNfceAuthorized ? 'NFC-e Autorizada' : 'Comprovante de Venda');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="p-4 font-mono text-xs bg-white text-black">
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="font-bold text-sm">{companyConfig?.nome_fantasia || 'Carregando...'}</h2>
            {isBudget && <p className="font-bold">** SEM VALOR FISCAL **</p>}
            {nfce && !isBudget && <p className="font-bold">DANFE NFC-e - Cupom Fiscal Eletrônico</p>}
            <p>{`${companyConfig?.logradouro || ''}, ${companyConfig?.numero || ''}`}</p>
            <p>{`${companyConfig?.bairro || ''} - ${companyConfig?.municipio || ''}/${companyConfig?.uf || ''}`}</p>
            <p>{formatPhone(companyConfig?.telefone || '')}</p>
            <p>CNPJ: {formatCnpj(companyConfig?.cnpj || '')}</p>
            <p>IE: {companyConfig?.inscricao_estadual || ''}</p>
          </div>

          <hr className="border-dashed border-black my-2" />

          {/* Sale Info */}
          <div className="mb-2">
            <p>NFC-e Nº: {nfce?.numero || 'N/A'} Série: {nfce?.serie || 'N/A'}</p>
            <p>Emissão: {format(new Date(nfce?.data_autorizacao || sale?.created_at || new Date()), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>

          <hr className="border-dashed border-black my-2" />

          {/* Items */}
          <div className="mb-2">
            <div className="grid grid-cols-12 gap-1 font-bold">
              <div className="col-span-6">DESC</div>
              <div className="col-span-2 text-right">QTD</div>
              <div className="col-span-2 text-right">V.UN</div>
              <div className="col-span-2 text-right">V.TOT</div>
            </div>
            {sale?.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-1">
                <div className="col-span-6">{item.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right">{(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <hr className="border-dashed border-black my-2" />

          {/* Totals */}
          <div className="flex justify-between font-bold">
            <span>TOTAL:</span>
            <span>R$ {sale?.total_amount.toFixed(2)}</span>
          </div>

          <div className="mt-1">
            {sale?.payments.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{paymentTypeMap[p.tipo] || 'Outro'}</span>
                <span>R$ {p.valor.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <hr className="border-dashed border-black my-2" />

          {/* Footer */}
          <div className="text-center mb-2">
            <p className="font-bold">*** OBRIGADO PELA PREFERÊNCIA ***</p>
            <p>Volte sempre!</p>
          </div>

          {isNfceAuthorized && (
            <>
              <hr className="border-dashed border-black my-2" />
              <div className="text-center text-[10px] break-all">
                <p className="font-bold">Consulte pela Chave de Acesso em:</p>
                <p>{nfce.url_consulta}</p>
                <p className="mt-1 font-bold">Chave de Acesso:</p>
                <p>{nfce.chave_acesso.replace(/(.{4})/g, '$1 ').trim()}</p>
              </div>
              <div className="flex justify-center my-2">
                {nfce.qr_code && <QRCode value={nfce.qr_code} size={120} />}
              </div>
              <div className="text-center">
                <p>Protocolo: {nfce.protocolo}</p>
                <p>Ambiente: {nfce.ambiente === 'producao' ? 'Produção' : 'Homologação'}</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handlePrint}>Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
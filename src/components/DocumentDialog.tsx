import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { QRCode } from 'react-qrcode-logo';
import { Loader2, FileText, FileWarning } from 'lucide-react';

// --- TYPE DEFINITIONS ---

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

interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  flavors?: string[];
}

interface Payment {
  type: string;
  amount: number;
}

interface DeliveryData {
  name: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  notes?: string;
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

// --- DIALOG 1: DOCUMENT TYPE CHOICE ---

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerateDocument: (type: 'quote' | 'fiscal') => void;
  isEmitting: boolean;
}

export function DocumentDialog({ open, onClose, onGenerateDocument, isEmitting }: DocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Documento</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p>Escolha o tipo de documento para esta venda.</p>
        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => onGenerateDocument('quote')}
            disabled={isEmitting}
          >
            <FileWarning className="mr-2 h-4 w-4" />
            Apenas Orçamento
          </Button>
          <Button
            onClick={() => onGenerateDocument('fiscal')}
            disabled={isEmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isEmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Gerar Cupom Fiscal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- DIALOG 2: FINAL RECEIPT/NFC-e VIEW ---

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  freight: number;
  cartItems: SaleItem[];
  payments: Payment[];
  documentType: 'quote' | 'fiscal';
  saleId?: string;
  nfceData: NfceData | null;
  delivery?: DeliveryData | null;
}

export function ReceiptDialog({ open, onClose, total, freight, cartItems, payments, documentType, saleId, nfceData, delivery }: ReceiptDialogProps) {
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
    contentRef: printRef,
    documentTitle: `${documentType === 'fiscal' ? 'NFC-e' : 'Orcamento'}-${nfceData?.numero || saleId}`,
  });

  const formatCnpj = (cnpj: string = '') => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  const formatPhone = (phone: string = '') => {
    if (phone.length === 11) return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    if (phone.length === 10) return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    return phone;
  }

  const isNfceAuthorized = documentType === 'fiscal' && nfceData && nfceData.status === 'autorizada';
  const isBudget = documentType === 'quote' || !isNfceAuthorized;
  const title = isBudget ? 'Orçamento / Comprovante' : 'NFC-e Autorizada';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm md:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="p-4 font-mono text-xs bg-white text-black">
          <div className="text-center mb-2">
            <h2 className="font-bold text-sm">{companyConfig?.nome_fantasia || 'Carregando...'}</h2>
            {isBudget && <p className="font-bold">** SEM VALOR FISCAL **</p>}
            {isNfceAuthorized && <p className="font-bold">DANFE NFC-e - Cupom Fiscal Eletrônico</p>}
            <p>{`${companyConfig?.logradouro || ''}, ${companyConfig?.numero || ''}`}</p>
            <p>{`${companyConfig?.bairro || ''} - ${companyConfig?.municipio || ''}/${companyConfig?.uf || ''}`}</p>
            <p>{formatPhone(companyConfig?.telefone)}</p>
            <p>CNPJ: {formatCnpj(companyConfig?.cnpj)}</p>
            <p>IE: {companyConfig?.inscricao_estadual || ''}</p>
          </div>

          <hr className="border-dashed border-black my-2" />

          <div className="mb-2">
            {isNfceAuthorized ? (
              <>
                <p>NFC-e Nº: {nfceData.numero} Série: {nfceData.serie}</p>
                <p>Emissão: {format(new Date(nfceData.data_autorizacao), 'dd/MM/yyyy HH:mm:ss')}</p>
              </>
            ) : (
              <p>Data: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
            )}
          </div>

          <hr className="border-dashed border-black my-2" />

          <div className="mb-2">
            <div className="grid grid-cols-12 gap-1 font-bold">
              <div className="col-span-6">DESCRIÇÃO</div>
              <div className="col-span-2 text-right">QTD</div>
              <div className="col-span-2 text-right">V.UN</div>
              <div className="col-span-2 text-right">V.TOT</div>
            </div>
            {cartItems.map((item, index) => {
              const price = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 0;
              const showFlavors = item.category === 'salgados' && item.flavors && item.flavors.length > 0;

              return (
                <div key={index} className="mb-1">
                  <div className="grid grid-cols-12 gap-1">
                    <div className="col-span-6">{item.name}</div>
                    <div className="col-span-2 text-right">{quantity}</div>
                    <div className="col-span-2 text-right">{price.toFixed(2)}</div>
                    <div className="col-span-2 text-right">{(quantity * price).toFixed(2)}</div>
                  </div>
                  {showFlavors && (
                    <div className="pl-2 mt-1 text-[11px]">
                      <p className="font-bold">Sabores:</p>
                      {item.flavors?.map((flavor) => (
                        <p key={flavor} className="pl-2">
                          • {flavor}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <hr className="border-dashed border-black my-2" />

          {freight > 0 && (
            <>
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>R$ {(total - freight).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>FRETE:</span>
                <span>R$ {freight.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between font-bold">
            <span>TOTAL:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>

          <hr className="border-dashed border-black my-2" />

          <p>
            Forma de Pagamento: {payments.length > 0
              ? payments.map((payment) => paymentTypeMap[payment.type] || 'Outro').join(' + ')
              : 'Não informado'}
          </p>

          <hr className="border-dashed border-black my-2" />

          {delivery && (
            <>
              <div className="mb-2">
                <p className="text-center font-bold text-sm">*** ENTREGA ***</p>
                <p><span className="font-bold">NOME:</span> {delivery.name}</p>
                <p><span className="font-bold">TEL:</span> {delivery.phone}</p>
                <p className="mt-1"><span className="font-bold">ENDEREÇO:</span></p>
                <p>{delivery.address}, {delivery.number}</p>
                <p>Bairro: {delivery.neighborhood}</p>
                {delivery.notes && (
                  <>
                    <p className="mt-1 font-bold">OBSERVAÇÃO:</p>
                    <p className="whitespace-pre-wrap">{delivery.notes}</p>
                  </>
                )}
              </div>
              <hr className="border-dashed border-black my-2" />
            </>
          )}

          <div className="text-center mb-2">
            <p className="font-bold">*** OBRIGADO PELA PREFERÊNCIA ***</p>
            <p>Volte sempre!</p>
            {saleId && (
              <p className="font-bold uppercase mt-2 text-lg">SENHA: {saleId}</p>
            )}
          </div>

          {isNfceAuthorized && nfceData && (
            <>
              <hr className="border-dashed border-black my-2" />
              <div className="text-center text-[10px] break-all">
                <p className="font-bold">Consulte pela Chave de Acesso em:</p>
                <p>{nfceData.url_consulta}</p>
                <p className="mt-1 font-bold">Chave de Acesso:</p>
                <p>{nfceData.chave_acesso.replace(/(.{4})/g, '$1 ').trim()}</p>
              </div>
              <div className="flex justify-center my-2">
                {nfceData.qr_code && <QRCode value={nfceData.qr_code} size={120} />}
              </div>
              <div className="text-center">
                <p>Protocolo: {nfceData.protocolo}</p>
                <p>Ambiente: {nfceData.ambiente === 'producao' ? 'Produção' : 'Homologação'}</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handlePrint}>Imprimir</Button>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
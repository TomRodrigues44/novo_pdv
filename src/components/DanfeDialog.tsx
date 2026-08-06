import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

interface DanfeItem {
  id?: string;
  name: string;
  product_name?: string;
  quantity: number;
  price: number;
  fiscal?: Record<string, any>;
  flavors?: string[];
}

interface DanfePayment {
  type: string;
  amount: number;
}

interface DanfeCustomer {
  name?: string;
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  phone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
}

interface DanfeNfeData {
  number: number;
  series: number;
  accessKey: string;
  protocol?: string;
  status: string;
  environment: string;
  consultationUrl?: string;
}

interface CompanyConfig {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  inscricao_estadual?: string;
  crt?: string;
}

interface DanfeDialogProps {
  open: boolean;
  onClose: () => void;
  nfeData: DanfeNfeData | null;
  customer: DanfeCustomer | null;
  items: DanfeItem[];
  payments: DanfePayment[];
  freight: number;
  productsTotal: number;
  total: number;
  motoboy?: { id: string; name: string } | null;
}

const paymentLabels: Record<string, string> = {
  cash: '01 - Dinheiro',
  credit: '03 - Cartão de Crédito',
  debit: '04 - Cartão de Débito',
  pix: '17 - PIX',
  boleto: '15 - Boleto',
  bank_transfer: '18 - Transferência',
  other: '99 - Outros',
};

const crtLabels: Record<string, string> = {
  '1': '1 - Simples Nacional',
  '2': '2 - Simples Nacional - Subexcesso',
  '3': '3 - Regime Normal',
};

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const digits = (value: unknown) => String(value ?? '').replace(/\D/g, '');

const formatCnpj = (cnpj: string = '') => {
  const value = digits(cnpj);

  if (value.length === 14) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  if (value.length === 11) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  return cnpj;
};

const formatCep = (cep: string = '') => {
  const value = digits(cep);
  return value.length === 8 ? value.replace(/^(\d{5})(\d{3})$/, '$1-$2') : cep;
};

const splitAccessKey = (accessKey?: string) => {
  const blocks = digits(accessKey).match(/.{1,4}/g) || [];

  return {
    firstLine: blocks.slice(0, 8).join(' '),
    secondLine: blocks.slice(8).join(' '),
  };
};

export function DanfeDialog({
  open,
  onClose,
  nfeData,
  customer,
  items,
  payments,
  freight,
  productsTotal,
  total,
  motoboy,
}: DanfeDialogProps) {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/fiscal/company-config')
        .then((response) => response.json())
        .then((data) => setCompanyConfig(data))
        .catch((error) => console.error('Failed to fetch company config:', error));
    }
  }, [open]);

  useEffect(() => {
    const accessKey = digits(nfeData?.accessKey);

    if (!open || !barcodeRef.current || accessKey.length !== 44) {
      return;
    }

    JsBarcode(barcodeRef.current, accessKey, {
      format: 'CODE128',
      displayValue: false,
      height: 32,
      margin: 0,
      width: 0.9,
      background: '#ffffff',
      lineColor: '#000000',
    });
  }, [nfeData?.accessKey, open]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DANFE-${nfeData?.number || 'NF-e'}`,
  });

  const issuedAt = new Date();
  const isHomologation = nfeData?.environment !== 'producao';
  const accessKeyLines = splitAccessKey(nfeData?.accessKey);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>DANFE — Documento Auxiliar da NF-e</DialogTitle>
        </DialogHeader>

        <div
          ref={printRef}
          className="danfe-a4 mx-auto bg-white p-8 text-black"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <div className="mb-3 flex justify-center border-2 border-black p-2">
            <img
              src="/products/logo-emporio.jpg"
              alt="Empório das Coxinhas"
              className="h-auto max-h-24 w-auto max-w-[420px] object-contain"
            />
          </div>

          <div className="grid grid-cols-[1.65fr_165px_1.65fr] gap-2 border-2 border-black p-2">
            <div className="flex flex-col justify-center">
              <p className="text-lg font-bold leading-tight">
                {companyConfig?.nome_fantasia || companyConfig?.razao_social || '—'}
              </p>
              <p className="text-xs">
                {companyConfig?.logradouro}, {companyConfig?.numero} — {companyConfig?.bairro}
              </p>
              <p className="text-xs">
                {companyConfig?.cep ? `${formatCep(companyConfig.cep)} ` : ''}
                {companyConfig?.municipio} — {companyConfig?.uf}
              </p>
              <p className="text-xs">Fone: {companyConfig?.telefone || '—'}</p>
              <p className="text-xs">CNPJ: {formatCnpj(companyConfig?.cnpj)}</p>
              <p className="text-xs">IE: {companyConfig?.inscricao_estadual || '—'}</p>
              <p className="text-xs">CRT: {crtLabels[companyConfig?.crt || ''] || companyConfig?.crt || '—'}</p>
            </div>

            <div className="flex flex-col items-center justify-center border-x-2 border-black px-1 text-center">
              <p className="text-xl font-black tracking-tighter">DANFE</p>
              <p className="text-[9px] font-bold">NFe Modelo 55</p>
              <p className="text-[9px] font-bold">Série 4.00</p>

              <div className="my-1 border-2 border-black px-1 py-1 text-center">
                <p className="text-[9px] font-semibold">
                  Nº {String(nfeData?.number || 0).padStart(6, '0')}
                </p>
                <p className="text-[9px]">Folha 1/1</p>
              </div>

              {isHomologation && (
                <p className="mt-1 text-[8px] font-bold leading-tight text-red-700">
                  HOMOLOGAÇÃO — SEM VALOR FISCAL
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center text-xs">
              <div className="border border-black p-1 text-center">
                <p className="font-semibold text-[10px]">CHAVE DE ACESSO</p>
                <p className="mt-0.5 whitespace-nowrap font-mono text-[10px] leading-tight">
                  {accessKeyLines.firstLine || '—'}
                </p>
                <p className="whitespace-nowrap font-mono text-[10px] leading-tight">
                  {accessKeyLines.secondLine}
                </p>
                <canvas
                  ref={barcodeRef}
                  aria-label="Código de barras da chave de acesso"
                  className="mt-2 max-w-full"
                />
              </div>
              <p className="mt-1">
                Protocolo de Autorização: <strong>{nfeData?.protocol || '—'}</strong>
              </p>
              <p>Data de Emissão: {format(issuedAt, 'dd/MM/yyyy')}</p>
              <p>Tipo de Operação: <strong>SAÍDA</strong></p>
            </div>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">DESTINATÁRIO / REMETENTE</p>
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1 p-2 text-xs">
              <div className="col-span-2">
                <span className="font-semibold">Nome / Razão Social: </span>
                {customer?.name || '—'}
              </div>
              <div>
                <span className="font-semibold">CNPJ/CPF: </span>
                {formatCnpj(customer?.cpf_cnpj)}
              </div>
              <div>
                <span className="font-semibold">IE: </span>
                {customer?.inscricao_estadual || '—'}
              </div>
              <div className="col-span-3">
                <span className="font-semibold">Endereço: </span>
                {customer?.logradouro}, {customer?.numero}
                {customer?.complemento ? ` - ${customer.complemento}` : ''}
              </div>
              <div>
                <span className="font-semibold">Bairro: </span>
                {customer?.bairro || '—'}
              </div>
              <div>
                <span className="font-semibold">CEP: </span>
                {formatCep(customer?.cep)}
              </div>
              <div>
                <span className="font-semibold">Município: </span>
                {customer?.municipio || '—'}
              </div>
              <div>
                <span className="font-semibold">Fone: </span>
                {customer?.phone || '—'}
              </div>
              <div>
                <span className="font-semibold">UF: </span>
                {customer?.uf || '—'}
              </div>
            </div>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">FORMA DE PAGAMENTO</p>
            </div>
            <div className="p-2 text-xs">
              {payments.length > 0
                ? payments.map((payment, index) => (
                    <span key={index} className="mr-4">
                      {paymentLabels[payment.type] || 'Outros'}: {currency(payment.amount)}
                    </span>
                  ))
                : '—'}
            </div>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">CÁLCULO DO IMPOSTO</p>
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1 p-2 text-xs">
              <div><span className="font-semibold">Base ICMS: </span>0,00</div>
              <div><span className="font-semibold">Valor ICMS: </span>0,00</div>
              <div><span className="font-semibold">Base ICMS ST: </span>0,00</div>
              <div><span className="font-semibold">Valor ICMS ST: </span>0,00</div>
              <div><span className="font-semibold">Valor Produtos: </span>{currency(productsTotal)}</div>
              <div><span className="font-semibold">Valor Frete: </span>{currency(freight)}</div>
              <div><span className="font-semibold">Valor Seguro: </span>0,00</div>
              <div><span className="font-semibold">Desconto: </span>0,00</div>
              <div className="col-span-4 text-right">
                <span className="text-sm font-black">VALOR TOTAL DA NOTA: {currency(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">TRANSPORTADOR / VOLUMES TRANSPORTADOS</p>
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1 p-2 text-xs">
              <div className="col-span-2">
                <span className="font-semibold">Frete por conta: </span>
                {freight > 0 ? 'Destinatário' : 'Sem frete'}
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Valor do Frete: </span>
                {currency(freight)}
              </div>
              {motoboy && freight > 0 && (
                <div className="col-span-4">
                  <span className="font-semibold">Transportador: </span>
                  {motoboy.name}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">DADOS DOS PRODUTOS / SERVIÇOS</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black text-[10px] font-bold">
                  <th className="p-1 text-left">CÓDIGO</th>
                  <th className="p-1 text-left">DESCRIÇÃO</th>
                  <th className="p-1 text-center">NCM</th>
                  <th className="p-1 text-center">CFOP</th>
                  <th className="p-1 text-center">UN</th>
                  <th className="p-1 text-right">QTD</th>
                  <th className="p-1 text-right">VALOR UNIT</th>
                  <th className="p-1 text-right">VALOR TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const fiscal = item.fiscal || {};

                  return (
                    <tr key={index} className="border-b border-gray-300 align-top">
                      <td className="p-1">{item.id || '—'}</td>
                      <td className="p-1">
                        {item.product_name || item.name}
                        {item.flavors && item.flavors.length > 0 && (
                          <span className="block text-[10px] text-gray-600">
                            Sabores: {item.flavors.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="p-1 text-center">{digits(fiscal.ncm) || '—'}</td>
                      <td className="p-1 text-center">{digits(fiscal.cfop) || '5102'}</td>
                      <td className="p-1 text-center">{fiscal.unidade || 'UN'}</td>
                      <td className="p-1 text-right">{Number(item.quantity).toFixed(2)}</td>
                      <td className="p-1 text-right">{Number(item.price).toFixed(2)}</td>
                      <td className="p-1 text-right">
                        {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-2 border-2 border-black">
            <div className="border-b border-black bg-gray-100 px-2 py-0.5">
              <p className="text-[11px] font-bold">INFORMAÇÕES COMPLEMENTARES</p>
            </div>
            <div className="p-2 text-[11px]">
              {isHomologation
                ? 'NF-e EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO — SEM VALOR FISCAL.'
                : 'Documento auxiliar da NF-e. Consulte a autenticidade no portal da SEFAZ.'}
              {nfeData?.consultationUrl && (
                <p className="mt-1 break-all">URL de consulta: {nfeData.consultationUrl}</p>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-[10px] text-gray-600">
            <p>Consulte pela chave de acesso em {nfeData?.consultationUrl || 'http://www.nfe.fazenda.gov.br/portal'}</p>
            <p className="mt-1 font-semibold">
              {isHomologation
                ? 'EMITIDA EM HOMOLOGAÇÃO — SEM VALOR FISCAL'
                : `Autorizada sob protocolo ${nfeData?.protocol || '—'}`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir DANFE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
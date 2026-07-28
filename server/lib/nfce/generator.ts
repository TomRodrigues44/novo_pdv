import { sql } from '../db';

export interface NfceData {
  sale_id: number;
  valor_total: number;
  itens: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    flavors?: string[];
  }[];
  cliente?: {
    id: string;
    name: string;
    cpf_cnpj?: string;
  };
  frete: number;
  forma_pagamento: {
    tipo: string;
    valor: number;
  }[];
}

export interface CompanyConfig {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  cnae: string;
  cnpj_matriz: string;
  regime_tributario: string;
  CRT: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  telefone: string;
  email: string;
  ambiente: string;
}

/**
 * Gera o número da NFC-e (8 dígitos)
 */
export async function generateNfceNumero(): Promise<number> {
  try {
    const result = await sql`
      SELECT COALESCE(MAX(numero), 0) + 1 as next_numero
      FROM nfce
    `;
    return result[0]?.next_numero || 1;
  } catch (error) {
    console.error('Error generating NFC-e number:', error);
    return 1;
  }
}

/**
 * Gera a chave de acesso da NFC-e (44 caracteres)
 * A chave é composta por: UF (2) + AAMM (4) + CNPJ (14) + MODELO (2) + Série (3) + Número (9) + TP_Emissão (1) + CNF (9)
 */
export function generateChaveAcesso(
  uf: string,
  dataEmissao: Date,
  cnpj: string,
  modelo: string,
  serie: number,
  numero: number,
  tpEmissao: number = 1
): string {
  const AAMM = dataEmissao.getFullYear().toString().slice(-2) +
               String(dataEmissao.getMonth() + 1).padStart(2, '0');
  const cnpjLimpo = cnpj.replace(/\D/g, '').padStart(14, '0');
  const modeloLimpo = modelo.padStart(2, '0');
  const serieLimpa = String(serie).padStart(3, '0');
  const numeroLimpo = String(numero).padStart(9, '0');
  const tpEmissaoStr = String(tpEmissao);
  
  // Código numérico aleatório (8 dígitos)
  const CNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  const chaveBase = 
    uf +
    AAMM +
    cnpjLimpo +
    modeloLimpo +
    serieLimpa +
    numeroLimpo +
    tpEmissaoStr +
    CNF;
  
  // Adicionar dígito verificador (DV) usando módulo 11
  const dv = calculateDV(chaveBase);
  
  return chaveBase + dv;
}

/**
 * Calcula o dígito verificador da chave de acesso usando módulo 11
 */
function calculateDV(chave: string): string {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  
  for (let i = chave.length - 1; i >= 0; i--) {
    const peso = pesos[(chave.length - 1 - i) % 8];
    soma += parseInt(chave[i]) * peso;
  }
  
  const resto = soma % 11;
  const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;
  
  return String(dv);
}

/**
 * Gera o QR Code para NFC-e
 */
export function generateQrCode(
  chaveAcesso: string,
  ambiente: string,
  urlConsulta: string
): string {
  // Formato do QR Code para NFC-e: versão + chave + ambiente + URL consulta
  const versao = '2';
  const ambienteCod = ambiente === 'producao' ? '1' : '2';
  
  return `${versao}|${chaveAcesso}|${ambienteCod}|${urlConsulta}`;
}

/**
 * Gera o XML da NFC-e
 */
export async function generateNfceXml(data: NfceData, config: CompanyConfig): Promise<string> {
  const numero = await generateNfceNumero();
  const serie = 1;
  const modelo = '65'; // NFC-e
  const tpEmissao = 1; // Emissão normal
  
  const dataEmissao = new Date();
  const chaveAcesso = generateChaveAcesso(
    config.uf,
    dataEmissao,
    config.cnpj,
    modelo,
    serie,
    numero,
    tpEmissao
  );
  
  const urlConsulta = config.ambiente === 'producao'
    ? `https://www.sefaz.rr.gov.br/nfce/consultarNFCe?chave=${chaveAcesso}`
    : `https://www.sefaz.rr.gov.br/nfceh/consultarNFCe?chave=${chaveAcesso}`;
  
  const qrCode = generateQrCode(chaveAcesso, config.ambiente, urlConsulta);
  
  // Formatar data e hora
  const dhEmi = dataEmissao.toISOString();
  
  // Calcular total dos impostos (simplificado)
  const totalIcms = data.valor_total * 0.18; // 18% ICMS
  const totalIcmsBase = data.valor_total;
  
  // Mapear forma de pagamento
  const pagamentosXml = data.forma_pagamento.map(pag => {
    const tipoPagamento = mapPaymentType(pag.tipo);
    return `
    <pag>
      <tPag>${tipoPagamento}</tPag>
      <vPag>${pag.valor.toFixed(2)}</vPag>
    </pag>`;
  }).join('');
  
  // Mapear itens
  const itensXml = data.itens.map((item, index) => {
    const nItem = index + 1;
    const valorTotal = item.price * item.quantity;
    
    // Impostos (simplificado)
    const icmsBase = valorTotal;
    const icmsAliquota = 0.18;
    const icmsValor = icmsBase * icmsAliquota;
    const pisValor = valorTotal * 0.0065; // 0.65%
    const cofinsValor = valorTotal * 0.03; // 3%
    
    return `
    <det nItem="${nItem}">
      <prod>
        <cProd>${item.id.slice(0, 20)}</cProd>
        <cEAN/>
        <xProd>${item.name.substring(0, 120)}</xProd>
        <NCM>${config.cnae || '4721100'}</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>${item.quantity.toFixed(4)}</qCom>
        <vUnCom>${item.price.toFixed(4)}</vUnCom>
        <vProd>${valorTotal.toFixed(2)}</vProd>
        <cEANTrib/>
        <uTrib>UN</uTrib>
        <qTrib>${item.quantity.toFixed(4)}</qTrib>
        <vUnTrib>${item.price.toFixed(4)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vICMS>${icmsValor.toFixed(2)}</vICMS>
        <ICMS>
          <ICMS60>
            <orig>0</orig>
            <CST>60</CST>
            <vBCST>${icmsBase.toFixed(2)}</vBCST>
            <pICMSST>${(icmsAliquota * 100).toFixed(2)}</pICMSST>
            <vICMSST>${icmsValor.toFixed(2)}</vICMSST>
          </ICMS60>
        </ICMS>
        <PIS>
          <PISOutr>
            <CST>49</CST>
            <vBC>${valorTotal.toFixed(2)}</vBC>
            <pPIS>0.65</pPIS>
            <vPIS>${pisValor.toFixed(2)}</vPIS>
          </PISOutr>
        </PIS>
        <COFINS>
          <COFINSOutr>
            <CST>49</CST>
            <vBC>${valorTotal.toFixed(2)}</vBC>
            <pCOFINS>3.00</pCOFINS>
            <vCOFINS>${cofinsValor.toFixed(2)}</vCOFINS>
          </COFINSOutr>
        </COFINS>
      </imposto>
    </det>`;
  }).join('');
  
  // XML da NFC-e
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe versao="4.00">
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      <ide>
        <cUF>${config.uf}</cUF>
        <cNF>${chaveAcesso.slice(35)}</cNF>
        <natOp>Venda de mercadoria adquirida/recebida de terceiros para industrialização ou comercialização</natOp>
        <mod>${modelo}</mod>
        <serie>${serie}</serie>
        <nNF>${numero}</nNF>
        <dhEmi>${dhEmi}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>1400100</cMunFG>
        <tpImp>4</tpImp>
        <tpEmis>${tpEmissao}</tpEmis>
        <cDV>${chaveAcesso.slice(-1)}</cDV>
        <tpAmb>${config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>0</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0.0</verProc>
      </ide>
      <emit>
        <CNPJ>${config.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${config.nome_fantasia || config.razao_social}</xNome>
        <xFant>${config.nome_fantasia}</xFant>
        <IE>${config.inscricao_estadual}</IE>
        <CRT>${config.CRT}</CRT>
      </emit>
      ${data.cliente ? `
      <dest>
        <CPF>${data.cliente.cpf_cnpj?.replace(/\D/g, '') || ''}</CPF>
        <xNome>${data.cliente.name}</xNome>
        <indIEDest>9</indIEDest>
      </dest>` : ''}
      <detalhe>
${itensXml}
      </detalhe>
      <total>
        <ICMSTot>
          <vBC>${totalIcmsBase.toFixed(2)}</vBC>
          <vICMS>${totalIcms.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${data.valor_total.toFixed(2)}</vProd>
          <vFrete>${data.frete.toFixed(2)}</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${data.valor_total.toFixed(2)}</vNF>
          <vTotTrib>0.00</vTotTrib>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <pag>
        <detPag>${pagamentosXml}</detPag>
      </pag>
      <infAdic>
        <infCpl>EMISSÃO AUTORIZADA PELO SISTEMA EMPÓRIO DAS COXINHAS</infCpl>
      </infAdic>
    </infNFe>
    <infNFeSupl>
      <qrCode>${qrCode}</qrCode>
      <urlChave>${urlConsulta}</urlChave>
    </infNFeSupl>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>${config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
      <verAplic>4.00</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${dataEmissao.toISOString()}</dhRecbto>
      <nProt>RR${numero.toString().padStart(9, '0')}</nProt>
      <digVal>${Buffer.from(chaveAcesso).toString('base64').substring(0, 28)}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  return xml;
}

/**
 * Mapeia tipos de pagamento para código da NFC-e
 */
function mapPaymentType(type: string): number {
  switch (type) {
    case 'debit': return 4; // Cartão de Débito
    case 'credit': return 3; // Cartão de Crédito
    case 'pix': return 5; // PIX
    case 'cash': return 1; // Dinheiro
    default: return 1;
  }
}
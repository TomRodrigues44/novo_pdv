import { createError } from 'h3';

const UF_CODES: Record<string, string> = {
  AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53', ES: '32',
  GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15', PB: '25', PR: '41',
  PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43', RO: '11', RR: '14', SC: '42',
  SP: '35', SE: '28', TO: '17',
};

const text = (value: unknown) => String(value ?? '').trim();
const digits = (value: unknown) => text(value).replace(/\D/g, '');
const xml = (value: unknown) => text(value)
  .replace(/&/g, '&')
  .replace(/</g, '<')
  .replace(/>/g, '>')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

function accessKeyDigit(key: string) {
  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;

  for (let index = key.length - 1; index >= 0; index -= 1) {
    sum += Number(key[index]) * weights[(key.length - 1 - index) % weights.length];
  }

  const remainder = sum % 11;
  return String(remainder < 2 ? 0 : 11 - remainder);
}

function generateAccessKey(ufCode: string, issuedAt: Date, cnpj: string, series: number, number: number) {
  const yearMonth = `${String(issuedAt.getFullYear()).slice(-2)}${String(issuedAt.getMonth() + 1).padStart(2, '0')}`;
  const numericCode = Math.floor(10000000 + Math.random() * 90000000).toString();
  const base = `${ufCode}${yearMonth}${digits(cnpj)}55${String(series).padStart(3, '0')}${String(number).padStart(9, '0')}1${numericCode}`;

  return `${base}${accessKeyDigit(base)}`;
}

function formatIssueDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Boa_Vista',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}-04:00`;
}

function paymentCode(type: string) {
  const codes: Record<string, string> = {
    cash: '01', credit: '03', debit: '04', pix: '17', boleto: '15', bank_transfer: '18', other: '99',
  };

  return codes[type] || '99';
}

export interface NfeGenerationResult {
  accessKey: string;
  xml: string;
  consultationUrl: string;
}

export function generateNfeXml(data: any, config: any, number: number, series: number): NfeGenerationResult {
  const requiredConfig = ['cnpj', 'razao_social', 'inscricao_estadual', 'crt', 'cep', 'logradouro', 'numero', 'bairro', 'municipio', 'uf'];
  const missingConfig = requiredConfig.filter((field) => !text(config[field]));

  if (missingConfig.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Complete as Configurações Fiscais antes de emitir a NF-e.',
    });
  }

  const emitterUf = text(config.uf).toUpperCase();
  const ufCode = UF_CODES[emitterUf];

  if (!ufCode) {
    throw createError({ statusCode: 400, statusMessage: 'UF do emitente inválida.' });
  }

  const issuedAt = new Date();
  const issuedAtNfe = formatIssueDate(issuedAt);
  const accessKey = generateAccessKey(ufCode, issuedAt, config.cnpj, series, number);
  const recipient = data.customer;
  const recipientDocument = digits(recipient.cpf_cnpj);
  const recipientUf = text(recipient.uf).toUpperCase();
  const interstate = recipientUf !== emitterUf;
  const productsTotal = data.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const freight = Number(data.freight) || 0;
  const total = productsTotal + freight;

  const itemsXml = data.items.map((item: any, index: number) => {
    const fiscal = item.fiscal || {};
    const itemTotal = item.price * item.quantity;
    const cfop = digits(fiscal.cfop) || (interstate ? '6102' : '5102');
    const ncm = digits(fiscal.ncm);
    const origin = Number(fiscal.origem ?? 0);

    return `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${xml(item.id)}</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>${xml(item.name)}</xProd>
          <NCM>${ncm}</NCM>
          ${digits(fiscal.cest) ? `<CEST>${digits(fiscal.cest)}</CEST>` : ''}
          <CFOP>${cfop}</CFOP>
          <uCom>${xml(fiscal.unidade || 'UN')}</uCom>
          <qCom>${Number(item.quantity).toFixed(4)}</qCom>
          <vUnCom>${Number(item.price).toFixed(10)}</vUnCom>
          <vProd>${itemTotal.toFixed(2)}</vProd>
          <cEANTrib>SEM GTIN</cEANTrib>
          <uTrib>${xml(fiscal.unidade || 'UN')}</uTrib>
          <qTrib>${Number(item.quantity).toFixed(4)}</qTrib>
          <vUnTrib>${Number(item.price).toFixed(10)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMSSN102>
              <orig>${origin}</orig>
              <CSOSN>102</CSOSN>
            </ICMSSN102>
          </ICMS>
          <PIS>
            <PISOutr>
              <CST>49</CST>
              <vBC>0.00</vBC>
              <pPIS>0.0000</pPIS>
              <vPIS>0.00</vPIS>
            </PISOutr>
          </PIS>
          <COFINS>
            <COFINSOutr>
              <CST>49</CST>
              <vBC>0.00</vBC>
              <pCOFINS>0.0000</pCOFINS>
              <vCOFINS>0.00</vCOFINS>
            </COFINSOutr>
          </COFINS>
        </imposto>
      </det>`;
  }).join('');

  const paymentsXml = data.payments.map((payment: any) => `
      <detPag><tPag>${paymentCode(payment.type)}</tPag><vPag>${Number(payment.amount).toFixed(2)}</vPag></detPag>`).join('');

  const consultationUrl = 'https://www.sefaz.rr.gov.br/nfe/consulta';
  const emitterMunicipalityCode = digits(config.codigo_municipio || '1400100');

  const generatedXml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${accessKey}" versao="4.00">
    <ide>
      <cUF>${ufCode}</cUF><cNF>${accessKey.slice(35, 43)}</cNF><natOp>VENDA DE MERCADORIA</natOp>
      <mod>55</mod><serie>${series}</serie><nNF>${number}</nNF><dhEmi>${issuedAtNfe}</dhEmi>
      <tpNF>1</tpNF><idDest>${interstate ? 2 : 1}</idDest><cMunFG>${emitterMunicipalityCode}</cMunFG>
      <tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>${accessKey.slice(-1)}</cDV>
      <tpAmb>${config.ambiente === 'producao' ? 1 : 2}</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal>
      <indPres>1</indPres><procEmi>0</procEmi><verProc>PDV-1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${digits(config.cnpj)}</CNPJ><xNome>${xml(config.razao_social)}</xNome><xFant>${xml(config.nome_fantasia)}</xFant>
      <enderEmit><xLgr>${xml(config.logradouro)}</xLgr><nro>${xml(config.numero)}</nro>${config.complemento ? `<xCpl>${xml(config.complemento)}</xCpl>` : ''}
        <xBairro>${xml(config.bairro)}</xBairro><cMun>${emitterMunicipalityCode}</cMun><xMun>${xml(config.municipio)}</xMun>
        <UF>${emitterUf}</UF><CEP>${digits(config.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais></enderEmit>
      <IE>${digits(config.inscricao_estadual)}</IE><CRT>${text(config.crt)}</CRT>
    </emit>
    <dest>
      <${recipientDocument.length === 14 ? 'CNPJ' : 'CPF'}>${recipientDocument}</${recipientDocument.length === 14 ? 'CNPJ' : 'CPF'}>
      <xNome>${xml(recipient.name)}</xNome><enderDest><xLgr>${xml(recipient.logradouro)}</xLgr><nro>${xml(recipient.numero)}</nro>
        ${recipient.complemento ? `<xCpl>${xml(recipient.complemento)}</xCpl>` : ''}<xBairro>${xml(recipient.bairro)}</xBairro>
        <cMun>${digits(recipient.codigo_municipio)}</cMun><xMun>${xml(recipient.municipio)}</xMun><UF>${recipientUf}</UF>
        <CEP>${digits(recipient.cep)}</CEP><cPais>1058</cPais><xPais>BRASIL</xPais>${digits(recipient.phone) ? `<fone>${digits(recipient.phone)}</fone>` : ''}</enderDest>
      <indIEDest>${digits(recipient.inscricao_estadual) ? 1 : 9}</indIEDest>${digits(recipient.inscricao_estadual) ? `<IE>${digits(recipient.inscricao_estadual)}</IE>` : ''}
      ${recipient.email ? `<email>${xml(recipient.email)}</email>` : ''}
    </dest>${itemsXml}
    <total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP>
      <vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet>
      <vProd>${productsTotal.toFixed(2)}</vProd><vFrete>${freight.toFixed(2)}</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc>
      <vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS>
      <vOutro>0.00</vOutro><vNF>${total.toFixed(2)}</vNF><vTotTrib>0.00</vTotTrib></ICMSTot></total>
    <transp><modFrete>${data.freightMode || (freight > 0 ? '0' : '9')}</modFrete></transp>
    <pag>${paymentsXml}</pag>
    <infAdic><infCpl>NF-e EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL.</infCpl></infAdic>
  </infNFe>
</NFe>`;

  return { accessKey, xml: generatedXml, consultationUrl };
}
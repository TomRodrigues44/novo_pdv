import { createError } from 'h3';

// --- Constants and Helpers ---

const UF_CODES: Record<string, string> = {
  AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53', ES: '32',
  GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15', PB: '25', PR: '41',
  PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43', RO: '11', RR: '14', SC: '42',
  SP: '35', SE: '28', TO: '17',
};

const RR_MUNICIPALITY_CODES: Record<string, string> = {
  'alto alegre': '1400050', amajari: '1400027', 'boa vista': '1400100', bonfim: '1400159',
  canta: '1400175', caracarai: '1400209', caroebe: '1400233', iracema: '1400282',
  mucajai: '1400308', normandia: '1400407', pacaraima: '1400456', rorainopolis: '1400472',
  'sao joao da baliza': '1400506', 'sao luiz': '1400605', uiramuta: '1400704',
};

const normalizeText = (value: unknown) => String(value ?? '').trim();
const normalizeKey = (value: unknown) => normalizeText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();
const onlyDigits = (value: unknown) => normalizeText(value).replace(/\D/g, '');
const escapeXml = (value: unknown) => normalizeText(value)
  .replace(/&/g, '&')
  .replace(/</g, '<')
  .replace(/>/g, '>')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

// --- Validation ---

const validateFiscalConfig = (config: any) => {
  const requiredFields: Record<string, string> = {
    cnpj: 'CNPJ', razao_social: 'Razão Social', inscricao_estadual: 'Inscrição Estadual',
    crt: 'CRT', cep: 'CEP', logradouro: 'Logradouro', numero: 'Número', bairro: 'Bairro',
    municipio: 'Município', uf: 'UF', ambiente: 'Ambiente',
  };
  const missing = Object.entries(requiredFields)
    .filter(([field]) => !normalizeText(config[field]))
    .map(([, label]) => label);

  if (missing.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Complete as Configurações Fiscais antes de emitir: ${missing.join(', ')}.`,
    });
  }

  const uf = normalizeText(config.uf).toUpperCase();
  const codigoUf = UF_CODES[uf];
  const codigoMunicipio = uf === 'RR' ? RR_MUNICIPALITY_CODES[normalizeKey(config.municipio)] : undefined;

  if (!codigoUf || !codigoMunicipio) {
    throw createError({
      statusCode: 400,
      statusMessage: 'UF ou município inválido para a integração SEFAZ-RR. Revise as Configurações Fiscais.',
    });
  }
  if (onlyDigits(config.cnpj).length !== 14 || onlyDigits(config.cep).length !== 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CNPJ ou CEP inválido nas Configurações Fiscais.',
    });
  }

  return { uf, codigoUf, codigoMunicipio };
};

// --- Generators ---

function generateChaveAcesso(
  ufCode: string,
  dataEmissao: Date,
  cnpj: string,
  modelo: string,
  serie: number,
  numero: number,
  tpEmissao: number = 1
): string {
  const AAMM = dataEmissao.getFullYear().toString().slice(-2) +
               String(dataEmissao.getMonth() + 1).padStart(2, '0');
  const cnpjLimpo = onlyDigits(cnpj);
  const modeloLimpo = modelo.padStart(2, '0');
  const serieLimpa = String(serie).padStart(3, '0');
  const numeroLimpo = String(numero).padStart(9, '0');
  const tpEmissaoStr = String(tpEmissao);
    
  // FIX: Generate a more random 8-digit number for the cNF to prevent collisions.
  const CNF = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  const chaveBase =
    ufCode + AAMM + cnpjLimpo + modeloLimpo + serieLimpa + numeroLimpo + tpEmissaoStr + CNF;
  
  const dv = calculateDV(chaveBase);
  return chaveBase + dv;
}

function calculateDV(chave: string): string {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  for (let i = chave.length - 1; i >= 0; i--) {
    const peso = pesos[(chave.length - 1 - i) % 8];
    soma += parseInt(chave[i]) * peso;
  }
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  return String(dv);
}

function generateQrCode(chaveAcesso: string, ambiente: string, urlConsulta: string): string {
  const versao = '2';
  const ambienteCod = ambiente === 'producao' ? '1' : '2';
  return `${versao}|${chaveAcesso}|${ambienteCod}|${urlConsulta}`;
}

function mapPaymentType(type: string): number {
  const paymentMap: Record<string, number> = {
    debit: 4, credit: 3, pix: 5, cash: 1,
  };
  return paymentMap[type] || 99; // 99 = Outros
}

// --- Main XML Generator ---

export async function generateNfceXml(data: any, config: any, numeroNfce: number, serieNfce: number): Promise<string> {
  const dataEmissao = new Date();
  const { uf: estado, codigoUf, codigoMunicipio } = validateFiscalConfig(config);
  
  const ambiente = normalizeText(config.ambiente);
  const cnpj = onlyDigits(config.cnpj);
  const razaoSocial = escapeXml(config.razao_social);
  const nomeFantasia = escapeXml(config.nome_fantasia || config.razao_social);
  const logradouro = escapeXml(config.logradouro);
  const numero = escapeXml(config.numero);
  const complemento = escapeXml(config.complemento);
  const bairro = escapeXml(config.bairro);
  const municipio = escapeXml(config.municipio);
  const inscricaoEstadual = onlyDigits(config.inscricao_estadual);
  const inscricaoMunicipal = onlyDigits(config.inscricao_municipal);
  const cnae = onlyDigits(config.cnae);
  const cep = onlyDigits(config.cep);
  const telefone = onlyDigits(config.telefone);
  const crt = normalizeText(config.crt);

  const chaveAcesso = generateChaveAcesso(codigoUf, dataEmissao, cnpj, '65', serieNfce, numeroNfce);
  const now = dataEmissao.toISOString();
  
  let itensXml = '';
  let totalIcmsBase = 0;
  let totalIcms = 0;
  
  (data.itens || []).forEach((item: any, index: number) => {
    const itemNumero = index + 1;
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    const total = preco * quantidade;
    const ncm = item.ncm || '21069090'; // Salgados e produtos de padaria
    
    const icmsBase = total;
    const icms = total * 0.12; // Simples Nacional - alíquota simbólica
    totalIcmsBase += icmsBase;
    totalIcms += icms;
    
    itensXml += `
        <det nItem="${itemNumero}">
          <prod>
            <cProd>${escapeXml(item.id)}</cProd>
            <cEAN/>
            <xProd>${escapeXml(item.name)}</xProd>
            <NCM>${ncm}</NCM>
            <CFOP>5102</CFOP>
            <uCom>UN</uCom>
            <qCom>${quantidade.toFixed(4)}</qCom>
            <vUnCom>${preco.toFixed(10)}</vUnCom>
            <vProd>${total.toFixed(2)}</vProd>
            <cEANTrib/>
            <uTrib>UN</uTrib>
            <qTrib>${quantidade.toFixed(4)}</qTrib>
            <vUnTrib>${preco.toFixed(10)}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <vTotTrib>${(total * 0.12).toFixed(2)}</vTotTrib>
            <ICMS>
              <ICMSSN102>
                <orig>0</orig>
                <CSOSN>102</CSOSN>
              </ICMSSN102>
            </ICMS>
            <PIS>
              <PISSN>
                <CST>49</CST>
              </PISSN>
            </PIS>
            <COFINS>
              <COFINSSN>
                <CST>49</CST>
              </COFINSSN>
            </COFINS>
          </imposto>
        </det>`;
  });
  
  let pagamentosXml = '';
  (data.forma_pagamento || []).forEach((pagamento: any) => {
    pagamentosXml += `
        <detPag>
          <tPag>${String(mapPaymentType(pagamento.tipo)).padStart(2, '0')}</tPag>
          <vPag>${(Number(pagamento.valor) || 0).toFixed(2)}</vPag>
        </detPag>`;
  });
  
  const urlConsulta = ambiente === 'producao'
    ? `https://www.sefaz.rr.gov.br/nfce/servlet/qrcode`
    : `https://www.sefaz.rr.gov.br/nfceh/servlet/qrcode`;

  const qrCodeData = `${chaveAcesso}|2|${ambiente === 'producao' ? 1 : 2}|${now.split('T')[0]}|${(data.valor_total || 0).toFixed(2)}|${Buffer.from(chaveAcesso).toString('hex')}`;
  const qrCode = `${urlConsulta}?p=${qrCodeData}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chaveAcesso}" versao="4.00">
    <ide>
      <cUF>${codigoUf}</cUF>
      <cNF>${chaveAcesso.slice(35, 43)}</cNF>
      <natOp>VENDA</natOp>
      <mod>65</mod>
      <serie>${serieNfce}</serie>
      <nNF>${numeroNfce}</nNF>
      <dhEmi>${now}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${codigoMunicipio}</cMunFG>
      <tpImp>4</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>${chaveAcesso.slice(-1)}</cDV>
      <tpAmb>${ambiente === 'producao' ? '1' : '2'}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0.0</verProc>
    </ide>
    <emit>
      <CNPJ>${cnpj}</CNPJ>
      <xNome>${razaoSocial}</xNome>
      <xFant>${nomeFantasia}</xFant>
      <enderEmit>
        <xLgr>${logradouro}</xLgr>
        <nro>${numero}</nro>
        ${complemento ? `<xCpl>${complemento}</xCpl>` : ''}
        <xBairro>${bairro}</xBairro>
        <cMun>${codigoMunicipio}</cMun>
        <xMun>${municipio}</xMun>
        <UF>${estado}</UF>
        <CEP>${cep}</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
        ${telefone ? `<fone>${telefone}</fone>` : ''}
      </enderEmit>
      <IE>${inscricaoEstadual}</IE>
      ${inscricaoMunicipal ? `<IM>${inscricaoMunicipal}</IM>` : ''}
      <CRT>${crt}</CRT>
    </emit>
    ${data.cliente && data.cliente.cpf_cnpj ? `
    <dest>
      <${onlyDigits(data.cliente.cpf_cnpj).length === 14 ? 'CNPJ' : 'CPF'}>${onlyDigits(data.cliente.cpf_cnpj)}</${onlyDigits(data.cliente.cpf_cnpj).length === 14 ? 'CNPJ' : 'CPF'}>
      <xNome>${escapeXml(data.cliente.name || 'CONSUMIDOR NAO IDENTIFICADO')}</xNome>
      <indIEDest>9</indIEDest>
    </dest>` : ''}
    ${itensXml}
    <total>
      <ICMSTot>
        <vBC>0.00</vBC>
        <vICMS>0.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${(data.valor_total || 0).toFixed(2)}</vProd>
        <vFrete>${(data.frete || 0).toFixed(2)}</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${(data.valor_total || 0).toFixed(2)}</vNF>
        <vTotTrib>${(totalIcms).toFixed(2)}</vTotTrib>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      ${pagamentosXml}
    </pag>
    <infAdic>
      <infCpl>Documento emitido por ME ou EPP optante pelo Simples Nacional. Nao gera direito a credito fiscal de IPI.</infCpl>
    </infAdic>
    <infNFeSupl>
      <qrCode><![CDATA[${qrCode}]]></qrCode>
      <urlChave><![CDATA[${urlConsulta}]]></urlChave>
    </infNFeSupl>
  </infNFe>
</NFe>`;
}
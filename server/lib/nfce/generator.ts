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

const isValidCpf = (value: unknown): boolean => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;
    for (const digit of base) total += Number(digit) * factor--;
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calcDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
         calcDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
};

const isValidCnpj = (value: unknown): boolean => {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const total = base.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calcDigit(cnpj.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(cnpj[12]) && second === Number(cnpj[13]);
};
const escapeXml = (value: unknown) => normalizeText(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
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
    debit: 4, credit: 3, pix: 17, cash: 1,
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
  const formatDhEmiBoaVista = (date: Date) => {
    // NFC-e/NF-e exige AAAA-MM-DDThh:mm:ssTZD.
    // Boa Vista/RR usa UTC-04:00 durante todo o ano.
    const local = new Date(date.getTime() - 4 * 60 * 60 * 1000);
    const yyyy = local.getUTCFullYear();
    const mm = String(local.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(local.getUTCDate()).padStart(2, '0');
    const hh = String(local.getUTCHours()).padStart(2, '0');
    const mi = String(local.getUTCMinutes()).padStart(2, '0');
    const ss = String(local.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}-04:00`;
  };
  const now = formatDhEmiBoaVista(dataEmissao);
  
  let itensXml = '';
  let totalProdutos = 0;

  // Rateio fiscal do frete entre os itens.
  // A soma dos vFrete dos itens deve ser exatamente igual ao vFrete total.
  const itensVenda = data.itens || [];
  const freteTotal = Math.max(0, Number(data.frete) || 0);
  const freteTotalCentavos = Math.round(freteTotal * 100);
  const totalItensParaRateio = itensVenda.reduce((sum: number, item: any) => {
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    return sum + (preco * quantidade);
  }, 0);
  let freteDistribuidoCentavos = 0;
  
  itensVenda.forEach((item: any, index: number) => {
    const itemNumero = index + 1;
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    const total = preco * quantidade;
    totalProdutos += total;

    let freteItemCentavos = 0;
    if (freteTotalCentavos > 0) {
      const ultimoItem = index === itensVenda.length - 1;
      if (ultimoItem) {
        freteItemCentavos = freteTotalCentavos - freteDistribuidoCentavos;
      } else if (totalItensParaRateio > 0) {
        freteItemCentavos = Math.round((freteTotalCentavos * total) / totalItensParaRateio);
        freteDistribuidoCentavos += freteItemCentavos;
      }
    }
    const freteItem = freteItemCentavos / 100;
    // Dados fiscais vêm do cadastro do produto (products.fiscal).
    const fiscal = item.fiscal || {};
    const ncm = onlyDigits(fiscal.ncm || item.ncm);
    const cfop = onlyDigits(fiscal.cfop || item.cfop);
    const cest = onlyDigits(fiscal.cest || item.cest);
    const unidade = normalizeText(fiscal.unidade || item.unidade || 'UN').toUpperCase();
    const origem = String(fiscal.origem ?? item.origem ?? 0);
    const csosn = onlyDigits(fiscal.csosn || item.csosn || '102');
    const cstPis = onlyDigits(fiscal.cstPis || item.cstPis || '99');
    const cstCofins = onlyDigits(fiscal.cstCofins || item.cstCofins || '99');
    const pisAliquota = Number(fiscal.pis ?? item.pis ?? 0);
    const cofinsAliquota = Number(fiscal.cofins ?? item.cofins ?? 0);
    const ean = onlyDigits(fiscal.codigoBarras || fiscal.codigo_barras || fiscal.ean || item.codigoBarras || item.codigo_barras || item.ean);

    if (ncm.length !== 8) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": NCM inválido ou não informado.` });
    if (cfop.length !== 4) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": CFOP inválido ou não informado.` });
    if (cest && cest.length !== 7) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": CEST deve possuir 7 dígitos.` });
    if (!/^\d$/.test(origem)) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": Origem inválida.` });
    if (!['102', '500'].includes(csosn)) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": CSOSN ${csosn || 'não informado'} ainda não está liberado nesta configuração.` });
    if (cstPis !== '99' || cstCofins !== '99') throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": use CST PIS/COFINS 99 nesta configuração.` });
    if (!Number.isFinite(pisAliquota) || !Number.isFinite(cofinsAliquota)) throw createError({ statusCode: 400, statusMessage: `Produto "${normalizeText(item.name)}": PIS/COFINS inválidos.` });
    
    itensXml += `
        <det nItem="${itemNumero}">
          <prod>
            <cProd>${escapeXml(item.id)}</cProd>
            <cEAN>${ean || 'SEM GTIN'}</cEAN>
            <xProd>${escapeXml(
            ambiente === 'homologacao' && index === 0
              ? 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
              : item.name
          )}</xProd>
            <NCM>${ncm}</NCM>
            ${cest ? `<CEST>${cest}</CEST>` : ''}
            <CFOP>${cfop}</CFOP>
            <uCom>${escapeXml(unidade)}</uCom>
            <qCom>${quantidade.toFixed(4)}</qCom>
            <vUnCom>${preco.toFixed(10)}</vUnCom>
            <vProd>${total.toFixed(2)}</vProd>
            <cEANTrib>${ean || 'SEM GTIN'}</cEANTrib>
            <uTrib>${escapeXml(unidade)}</uTrib>
            <qTrib>${quantidade.toFixed(4)}</qTrib>
            <vUnTrib>${preco.toFixed(10)}</vUnTrib>
            ${freteItemCentavos > 0 ? `<vFrete>${freteItem.toFixed(2)}</vFrete>` : ''}
            <indTot>1</indTot>
          </prod>
          <imposto>
            <ICMS>
              ${csosn === '500' ? `
              <ICMSSN500>
                <orig>${origem}</orig>
                <CSOSN>500</CSOSN>
              </ICMSSN500>` : `
              <ICMSSN102>
                <orig>${origem}</orig>
                <CSOSN>102</CSOSN>
              </ICMSSN102>`}
            </ICMS>
            <PIS>
              <PISOutr>
                <CST>${cstPis}</CST>
                <vBC>0.00</vBC>
                <pPIS>${pisAliquota.toFixed(4)}</pPIS>
                <vPIS>0.00</vPIS>
              </PISOutr>
            </PIS>
            <COFINS>
              <COFINSOutr>
                <CST>${cstCofins}</CST>
                <vBC>0.00</vBC>
                <pCOFINS>${cofinsAliquota.toFixed(4)}</pCOFINS>
                <vCOFINS>0.00</vCOFINS>
              </COFINSOutr>
            </COFINS>
          </imposto>
        </det>`;
  });
  
  let pagamentosXml = '';
  const trocoTotal = Math.round(
    (data.forma_pagamento || []).reduce(
      (sum: number, pagamento: any) => sum + (Number(pagamento.troco) || 0),
      0
    ) * 100
  ) / 100;

  (data.forma_pagamento || []).forEach((pagamento: any) => {
    const tPag = String(mapPaymentType(pagamento.tipo)).padStart(2, '0');

    // Crédito (03), Débito (04) e PIX (17) exigem o grupo <card>.
    // Neste PDV, o pagamento ocorre em POS/PIX não integrado ao sistema,
    // portanto informamos tpIntegra = 2.
    const exigeGrupoCard = tPag === '03' || tPag === '04' || tPag === '17';

    pagamentosXml += `
        <detPag>
          <tPag>${tPag}</tPag>
          <vPag>${(Number(pagamento.valor) || 0).toFixed(2)}</vPag>
          ${exigeGrupoCard ? `<card><tpIntegra>2</tpIntegra></card>` : ''}
        </detPag>`;
  });
  
  // URLs de consulta NFC-e específicas da SEFAZ-RR por ambiente.
  // A validação cStat 395 compara o endereço-base do QR-Code com a tabela da UF.
  const urlQrCode = ambiente === 'producao'
    ? 'https://portalweb.sefaz.rr.gov.br/nfce/servlet/qrcode'
    : 'http://200.174.88.103:8080/nfce/servlet/qrcode';

  const urlConsultaChave = ambiente === 'producao'
    ? 'https://portalweb.sefaz.rr.gov.br/nfce/servlet/wp_consulta_nfce'
    : 'http://200.174.88.103:8080/nfce/servlet/wp_consulta_nfce';

  // QR-Code v3 (NT 2025.001) para emissão ONLINE (tpEmis=1):
  // chave de acesso | versão 3 | ambiente.
  // Na versão 3 online não há CSC e não é necessário CDATA.
  const qrCodeData = `${chaveAcesso}|3|${ambiente === 'producao' ? 1 : 2}`;
  const qrCode = `${urlQrCode}?p=${qrCodeData}`;

  // Destinatário: valida CPF/CNPJ antes de gerar o XML.
  // Em homologação, a SEFAZ exige o xNome padronizado abaixo.
  let destinatarioXml = '';
  const documentoDestinatario = onlyDigits(data.cliente?.cpf_cnpj);
  if (documentoDestinatario) {
    const tipoDocumento = documentoDestinatario.length === 14 ? 'CNPJ' : documentoDestinatario.length === 11 ? 'CPF' : '';
    const documentoValido = tipoDocumento === 'CPF'
      ? isValidCpf(documentoDestinatario)
      : tipoDocumento === 'CNPJ'
        ? isValidCnpj(documentoDestinatario)
        : false;

    if (!documentoValido) {
      throw createError({
        statusCode: 400,
        statusMessage: `CPF/CNPJ do cliente inválido. Corrija o cadastro antes de emitir a NFC-e.`,
      });
    }

    const nomeDestinatario = ambiente === 'homologacao'
      ? 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
      : normalizeText(data.cliente?.name || 'CONSUMIDOR NAO IDENTIFICADO');

    destinatarioXml = `
    <dest>
      <${tipoDocumento}>${documentoDestinatario}</${tipoDocumento}>
      <xNome>${escapeXml(nomeDestinatario)}</xNome>
      <indIEDest>9</indIEDest>
    </dest>`;
  }
  
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
    ${destinatarioXml}
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
        <vProd>${totalProdutos.toFixed(2)}</vProd>
        <vFrete>${freteTotal.toFixed(2)}</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>0.00</vPIS>
        <vCOFINS>0.00</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${(totalProdutos + freteTotal).toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      ${pagamentosXml}
      ${trocoTotal > 0 ? `<vTroco>${trocoTotal.toFixed(2)}</vTroco>` : ''}
    </pag>
    <infAdic>
      <infCpl>Documento emitido por ME ou EPP optante pelo Simples Nacional. Nao gera direito a credito fiscal de IPI.</infCpl>
    </infAdic>
  </infNFe>
  <infNFeSupl>
    <qrCode>${escapeXml(qrCode)}</qrCode>
    <urlChave>${escapeXml(urlConsultaChave)}</urlChave>
  </infNFeSupl>
</NFe>`;
}
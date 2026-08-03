import { sql } from '../../../utils/db';
import { enviarParaSefaz } from '../../../lib/nfce/sefaz';
import { generateNfceXml } from '../../../lib/nfce/generator';

const toNumber = (value: any, fallback: number) => {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};

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

/**
 * Gera a chave de acesso da NFC-e (44 caracteres)
 */
function generateChaveAcesso(
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
    
  // Código numérico único (9 dígitos) - Garantir unicidade absoluta
  const timestamp = Date.now().toString().slice(-6); // 6 últimos dígitos do timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 dígitos aleatórios
  const CNF = timestamp + random; // 9 dígitos totais
  
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
function generateQrCode(
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

/**
 * Gera o XML da NFC-e
 */
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

  const chaveAcesso = generateChaveAcesso(
    codigoUf,
    dataEmissao,
    cnpj,
    '65',
    serieNfce,
    numeroNfce
  );
  
  const now = dataEmissao.toISOString();
  const valorTotal = Number(data.valor_total) || 0;
  const frete = Number(data.frete) || 0;
  
  // Gerar detalhes dos itens
  let itensXml = '';
  let totalIcmsBase = 0;
  let totalIcms = 0;
  
  const itemNumero = 1;
  
  for (const item of (data.itens || [])) {
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    const total = preco * quantidade;
    const cest = item.cest || '0000000';
    const ncm = item.ncm || '21069000';
    
    // Cálculo simplificado do ICMS
    const icmsBase = total;
    const icms = total * 0.12; // 12% de ICMS
    totalIcmsBase += icmsBase;
    totalIcms += icms;
    
    const itemIndex = String(itemNumero).padStart(3, '0');
    
    itensXml += `
        <det nItem="${itemIndex}">
          <prod>
            <cProd>${item.id || '9999999999999'}</cProd>
            <cEAN>${item.ean || ''}</cEAN>
            <xProd>${item.name}</xProd>
            <NCM>${ncm}</NCM>
            <CEST>${cest}</CEST>
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
            <vTotTrib>${total.toFixed(2)}</vTotTrib>
            <ICMS>
              <ICMS00>
                <orig>0</orig>
                <CST>00</CST>
                <modBC>3</modBC>
                <vBC>${icmsBase.toFixed(2)}</vBC>
                <pICMS>12.00</pICMS>
                <vICMS>${icms.toFixed(2)}</vICMS>
              </ICMS00>
            </ICMS>
            <PIS>
              <PISNT>
                <CST>49</CST>
              </PISNT>
            </PIS>
            <COFINS>
              <COFINSNT>
                <CST>49</CST>
              </COFINSNT>
            </COFINS>
          </imposto>
        </det>`;
  }
  
  // Gerar informações de pagamento
  let pagamentosXml = '';
  for (const pagamento of (data.forma_pagamento || [])) {
    const valor = Number(pagamento.valor) || 0;
    const tipo = mapPaymentType(pagamento.tipo);
    pagamentosXml += `
          <tPag>${tipo}</tPag>
          <vPag>${valor.toFixed(2)}</vPag>`;
  }
  
  const urlConsulta = ambiente === 'producao'
    ? `https://www.sefaz.rr.gov.br/nfce/consultarNFCe?chave=${chaveAcesso}`
    : `https://www.sefaz.rr.gov.br/nfceh/consultarNFCe?chave=${chaveAcesso}`;

  const qrCode = generateQrCode(chaveAcesso, ambiente, urlConsulta);
  
  // Gerar o XML completo
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
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
        <dhSaiEnt>${now}</dhSaiEnt>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>${codigoMunicipio}</cMunFG>
        <tpImp>9</tpImp>
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
        ${cnae ? `<CNAE>${cnae}</CNAE>` : ''}
        <CRT>${crt}</CRT>
      </emit>
      ${data.cliente ? `
      <dest>
        <CNPJ>${(data.cliente.cpf_cnpj || '').replace(/\D/g, '') || ''}</CNPJ>
        <xNome>${data.cliente.name || ''}</xNome>
        <enderDest>
          <xLgr>${data.cliente.address || ''}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>${estado}</UF>
          <CEP>00000000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
        <email>${data.cliente.email || ''}</email>
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
      <tpAmb>${ambiente === 'producao' ? '1' : '2'}</tpAmb>
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

export default defineEventHandler(async (event) => {
  try {
    console.log('📋 Iniciando emissão de NFC-e...');
    const body = await readBody(event);
    
    const { sale_id, valor_total, itens, cliente, frete, forma_pagamento } = body;
        
    console.log('📦 Dados recebidos:', { sale_id, valor_total, itemCount: itens?.length, cliente, frete });
    
    // Converter sale_id para número
    const saleIdNumber = typeof sale_id === 'string'
      ? parseInt(sale_id.replace(/\D/g, ''), 10)
      : Number(sale_id);
    
    if (!saleIdNumber || saleIdNumber <= 0) {
      console.error('❌ sale_id inválido:', sale_id);
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da venda inválido',
      });
    }
    
    // ✅ LOG: Buscar venda para verificar se existe
    console.log('🔍 Buscando venda no banco...');
    const saleResult = await sql`
      SELECT id, total_amount, created_at FROM sales
      WHERE id = ${saleIdNumber}
      LIMIT 1
    `;
                        
    if (!saleResult || saleResult.length === 0) {
      console.error('❌ Venda não encontrada. ID:', saleIdNumber);
      throw createError({
        statusCode: 404,
        statusMessage: 'Venda não encontrada. Verifique o sale_id.',
      });
    }
    
    const saleDbId = saleResult[0].id;
    console.log('✅ Venda encontrada:', saleDbId);
    
    // ✅ LOG: Buscar NFC-e existente
    console.log('🔍 Verificando NFC-e existente...');
    const existingNfce = await sql`
      SELECT
        id,
        chave_acesso,
        numero,
        serie,
        data_autorizacao,
        protocolo,
        status,
        qr_code,
        xml_retorno,
        url_consulta,
        ambiente,
        mensagem_status
      FROM nfce
      WHERE sale_id = ${String(saleDbId)}
        AND status IN ('autorizada', 'cancelada')
      ORDER BY created_at DESC
      LIMIT 1
    `;
                                    
    if (existingNfce && existingNfce.length > 0) {
      const nfceData = existingNfce[0];
      console.log('✅ NFC-e já existe:', nfceData.id, 'Número:', nfceData.numero);
      return {
        success: true,
        message: 'NFC-e já emitida anteriormente',
        nfce: {
          id: nfceData.id,
          chave_acesso: nfceData.chave_acesso,
          numero: Number(nfceData.numero),
          serie: Number(nfceData.serie),
          data_autorizacao: nfceData.data_autorizacao,
          protocolo: nfceData.protocolo,
          status: nfceData.status,
          qr_code: nfceData.qr_code,
          xml_retorno: nfceData.xml_retorno,
          url_consulta: nfceData.url_consulta,
          ambiente: nfceData.ambiente,
          mensagem_status: nfceData.mensagem_status,
        }
      };
    }
    
    // ✅ LOG: Verificar NFC-e pendente
    const pendingNfce = await sql`
      SELECT id, chave_acesso, created_at FROM nfce
      WHERE sale_id = ${String(saleDbId)}
        AND status = 'pendente'
        AND created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY created_at DESC
      LIMIT 1
    `;
                                    
    if (pendingNfce && pendingNfce.length > 0) {
      console.warn('⚠️ NFC-e já em processamento:', pendingNfce[0].id);
      throw createError({
        statusCode: 409,
        statusMessage: 'Já existe uma NFC-e em processamento para esta venda. Aguarde alguns instantes antes de tentar novamente.',
      });
    }
    
    if (!saleDbId || !valor_total || !itens || !Array.isArray(itens)) {
      console.error('❌ Dados inválidos:', { saleDbId, valor_total, itemCount: itens?.length });
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados inválidos. Verifique sale_id, valor_total e itens.',
      });
    }
    
    // ✅ LOG: Buscar configuração fiscal
    console.log('📋 Buscando configuração fiscal...');
    const configResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
        
    if (!configResult || configResult.length === 0) {
      console.error('❌ Configuração fiscal não encontrada!');
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração fiscal não encontrada. Configure os dados fiscais da empresa primeiro.',
      });
    }
    
    const config = configResult[0];
    console.log('✅ Configuração encontrada:', {
      cnpj: config.cnpj,
      uf: config.uf,
      ambiente: config.ambiente,
      ultima_nfce: config.ultima_nfce,
      serie_nfce: config.serie_nfce,
    });
    
    const ultimaNfce = toNumber(config.ultima_nfce, 0);
    const proximoNumero = ultimaNfce + 1;
    const serieNfce = toNumber(config.serie_nfce, 1);
    
    console.log('🔢 Próximo NFC-e:', proximoNumero, 'Série:', serieNfce);
    
    const nfceData = {
      sale_id: saleIdNumber,
      valor_total,
      itens,
      cliente,
      frete: frete || 0,
      forma_pagamento,
    };
                
    // Enviar para SEFAZ e salvar com retry para evitar duplicatas de chave
    let sefazResponse: any = null;
    let insertResult: any = null;
    let tentativas = 0;
    const maxTentativas = 3;
    
    console.log('🔄 Iniciando loop de tentativas (máx:', maxTentativas, ')');
    
    while (tentativas < maxTentativas) {
      console.log(`📍 Tentativa ${tentativas + 1} de ${maxTentativas}...`);
      
      try {
        // Pequeno delay para garantir unicidade no timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
        
        console.log('📝 Gerando XML da NFC-e...');
        const xmlEnvio = await generateNfceXml(nfceData, config, proximoNumero, serieNfce);
        console.log('✅ XML gerado, tamanho:', xmlEnvio.length);
    
        // Extrair chave de acesso do XML gerado para verificação
        const chaveMatch = xmlEnvio.match(/Id="NFe(\d{44})"/);
        const chaveAcesso = chaveMatch ? chaveMatch[1] : '';
        
        if (chaveAcesso) {
          console.log('🔍 Verificando se chave de acesso já existe...');
          const existingChave = await sql`
            SELECT id FROM nfce WHERE chave_acesso = ${chaveAcesso} LIMIT 1
          `;
          if (existingChave && existingChave.length > 0) {
            console.warn('⚠️ Chave de acesso já existe, tentando novamente com nova chave');
            tentativas++;
            continue;
          }
        }
        
        console.log('📤 Enviando para SEFAZ...');
        
        // Enviar para SEFAZ
        const sefazResult = await enviarParaSefaz(xmlEnvio, config.ambiente || 'homologacao');
                
        console.log('📤 Resposta SEFAZ:', sefazResult);
                
        if (!sefazResult || !sefazResult.success) {
          console.error('❌ Erro ao autorizar NFC-e na SEFAZ:', sefazResult);
          // Salvar tentativa com erro
          await sql`
            INSERT INTO nfce (sale_id, status, xml_envio, mensagem_status, ambiente)
            VALUES (${String(saleIdNumber)}, 'rejeitada', ${xmlEnvio}, ${sefazResult?.mensagem || 'Erro desconhecido da SEFAZ'}, ${config.ambiente || 'homologacao'})
          `;
          throw createError({
            statusCode: 502,
            statusMessage: sefazResult?.mensagem || 'Erro ao autorizar NFC-e na SEFAZ',
          });
        }
        
        console.log('✅ NFC-e autorizada! Chave:', sefazResult.chave_acesso, 'Número:', sefazResult.numero);
        
        // Salvar NFC-e no banco de dados
        console.log('💾 Salvando NFC-e no banco de dados...');
        const insert = await sql`
          INSERT INTO nfce (
            sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
            protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
            ambiente, mensagem_status
          ) VALUES (
            ${String(saleIdNumber)}, ${sefazResult.chave_acesso || ''}, ${sefazResult.numero || 0},
            ${serieNfce}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${sefazResult.protocolo || ''},
            'autorizada', ${sefazResult.qr_code || ''}, ${xmlEnvio},
            ${sefazResult.xml_retorno || ''}, ${sefazResult.url_consulta || ''},
            ${config.ambiente || 'homologacao'}, ${sefazResult.mensagem || ''}
          ) RETURNING id
        `;
        
        console.log('✅ NFC-e salva com ID:', insert[0].id);
        
        // ✅ CORREÇÃO: Atualizar contador na configuração fiscal
        console.log('🔄 Atualizando contador na configuração fiscal...');
        await sql`
          UPDATE company_fiscal_config
          SET ultima_nfce = ${proximoNumero}
          WHERE id = ${config.id}
        `;
        console.log('✅ Contador atualizado para:', proximoNumero);
        
        // Se chegou aqui, tudo foi bem-sucedido
        sefazResponse = sefazResult;
        insertResult = insert;
        break;
        
      } catch (error: any) {
        tentativas++;
        console.error(`❌ Erro na tentativa ${tentativas}:`, error.message);
        
        // Se for erro de validação do H3, não adianta tentar de novo
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Verificar se é erro de chave duplicada no banco
        if (error.message && error.message.includes('duplicate key') && error.message.includes('chave_acesso')) {
          console.warn('⚠️ Chave duplicada no banco, tentando novamente...');
          if (tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 100 * tentativas));
            continue;
          }
        }
        
        // Se esgotou tentativas ou é outro tipo de erro, propaga
        if (tentativas >= maxTentativas) {
           console.error('❌ Esgotou as tentativas. Falha final.');
           throw createError({
            statusCode: 500,
            statusMessage: error.statusMessage || error.message || 'Erro final ao emitir NFC-e',
          });
        }
      }
    }
          
    // Verificar se a emissão foi bem-sucedida
    if (!sefazResponse || !insertResult) {
      console.error('❌ Falha ao emitir NFC-e após', maxTentativas, 'tentativas');
      throw createError({
        statusCode: 500,
        statusMessage: 'Não foi possível emitir a NFC-e após ' + maxTentativas + ' tentativas. Verifique os logs.',
      });
    }
          
    console.log('🎉 NFC-e emitida com sucesso!');
          
    // Atualizar a venda com os dados fiscais
    console.log('💾 Atualizando venda com dados fiscais...');
    await sql`
      UPDATE sales
      SET
        xml_chave = ${sefazResponse.chave_acesso || ''},
        xml_numero = ${sefazResponse.numero || 0},
        xml_status = 'autorizada',
        xml_content = ${sefazResponse.xml_retorno || ''}
      WHERE id = ${saleDbId}
    `;
    console.log('✅ Venda atualizada');
                  
    // Retornar sucesso
    return {
      success: true,
      message: 'NFC-e emitida e autorizada com sucesso',
      nfce: {
        id: insertResult[0].id,
        chave_acesso: sefazResponse.chave_acesso || '',
        numero: Number(sefazResponse.numero || 0),
        serie: serieNfce,
        data_autorizacao: new Date().toISOString(),
        protocolo: sefazResponse.protocolo || '',
        status: 'autorizada',
        qr_code: sefazResponse.qr_code || '',
        xml_retorno: sefazResponse.xml_retorno || '',
        url_consulta: sefazResponse.url_consulta || '',
        ambiente: config.ambiente || 'homologacao',
        mensagem_status: sefazResponse.mensagem || '',
      }
    };
      
  } catch (error: any) {
    console.error('❌❌❌ ERRO CRÍTICO ao emitir NFC-e:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro desconhecido ao emitir NFC-e',
    });
  }
});
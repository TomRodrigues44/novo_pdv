import https from 'node:https';
import type { LoadedCertificate } from '../nfe/certificate';

export interface SefazResponse {
  success: boolean;
  status: string;
  mensagem: string;
  chave_acesso?: string;
  numero?: number;
  protocolo?: string;
  data_autorizacao?: string;
  qr_code?: string;
  url_consulta?: string;
  xml_retorno?: string;
  xml_resposta_sefaz?: string;
}


type SefazEnvironment = 'homologacao' | 'producao';

const NFCE_ENDPOINTS: Record<SefazEnvironment, {
  autorizacao: string;
  retAutorizacao: string;
}> = {
  homologacao: {
    autorizacao: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfce-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
  },
  producao: {
    autorizacao: 'https://nfce.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfce.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
  },
};

interface AuthorizationResult {
  success: boolean;
  status: 'autorizada' | 'rejeitada' | 'processando';
  message: string;
  protocol?: string;
  authorizationDate?: string;
  authorizationXml?: string;
  rawResponse?: string;
}

const extractTags = (xml: string, tag: string): string[] => {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'gi',
  );
  return [...String(xml || '').matchAll(re)]
    .map((m) => m[1]?.trim())
    .filter((v): v is string => Boolean(v));
};

function buildSoapEnvelope(serviceNamespace: string, innerXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap:Body><nfeDadosMsg xmlns="${serviceNamespace}">${innerXml}</nfeDadosMsg></soap:Body>` +
    `</soap:Envelope>`;
}

function createHttpsAgent(certificate: LoadedCertificate) {
  return new https.Agent({
    pfx: certificate.pfxBuffer,
    passphrase: certificate.password,
    // Mantido igual ao transporte que já vinha alcançando a SVRS durante
    // a homologação. Antes de PRODUÇÃO, corrigir a cadeia ICP-Brasil e
    // habilitar rejectUnauthorized:true.
    rejectUnauthorized: false,
  });
}

function sendSoapRequest(
  url: string,
  soapBody: string,
  certificate: LoadedCertificate,
  environment: SefazEnvironment,
  soapAction: string,
): Promise<{ statusCode: number; body: string }> {
  const urlObj = new URL(url);

  console.log(
    `[NFCE] POST ${url} (${environment === 'producao' ? 'produção' : 'homologação'})`,
  );

  return new Promise((resolve, reject) => {
    const request = https.request(urlObj, {
      agent: createHttpsAgent(certificate),
      method: 'POST',
      timeout: 60000,
      headers: {
        Accept: 'application/soap+xml, text/xml, */*',
        'Content-Type': `application/soap+xml; charset=utf-8; action="${soapAction}"`,
        'Content-Length': Buffer.byteLength(soapBody),
        'User-Agent': 'PDV-NFCe/1.0',
      },
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk: string) => { body += chunk; });
      response.on('end', () => resolve({
        statusCode: response.statusCode || 0,
        body,
      }));
    });

    request.on('error', (error: any) => {
      console.error(`[NFCE] Erro de comunicação com SVRS (${environment}):`, {
        message: error?.message,
        code: error?.code,
        errno: error?.errno,
        syscall: error?.syscall,
      });
      reject(new Error(`Erro de comunicação com a SEFAZ/SVRS NFC-e: ${error?.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Tempo limite excedido ao aguardar resposta da SEFAZ/SVRS (60 segundos).'));
    });

    request.write(soapBody);
    request.end();
  });
}

function parseAuthorizationResponse(
  responseXml: string,
  httpStatus: number,
): AuthorizationResult {
  const fault = extractTag(responseXml, 'faultstring') || extractTag(responseXml, 'Reason');

  if (fault) {
    return {
      success: false,
      status: 'rejeitada',
      message: `Falha SOAP da SEFAZ/SVRS: ${fault}`,
      rawResponse: responseXml,
    };
  }

  const statusCodes = extractTags(responseXml, 'cStat');
  const messages = extractTags(responseXml, 'xMotivo');
  const cStat = statusCodes.at(-1) || null;
  const xMotivo = messages.at(-1) || null;
  const protocol = extractTag(responseXml, 'nProt');
  const authorizationDate = extractTag(responseXml, 'dhRecbto');
  const receipt = extractTag(responseXml, 'nRec');

  if (cStat === '100') {
    return {
      success: true,
      status: 'autorizada',
      message: xMotivo || 'Autorizado o uso da NFC-e',
      protocol: protocol || undefined,
      authorizationDate: authorizationDate || undefined,
      authorizationXml: extractElement(responseXml, 'protNFe') || responseXml,
      rawResponse: responseXml,
    };
  }

  if (cStat === '103' && receipt) {
    return {
      success: false,
      status: 'processando',
      message: 'Lote NFC-e recebido pela SEFAZ/SVRS e aguardando processamento.',
      rawResponse: responseXml,
    };
  }

  if (cStat === '104') {
    return {
      success: false,
      status: 'rejeitada',
      message: 'Lote processado, mas a autorização individual da NFC-e não foi encontrada.',
      rawResponse: responseXml,
    };
  }

  if (cStat) {
    return {
      success: false,
      status: 'rejeitada',
      message: `SEFAZ rejeitou a NFC-e (cStat ${cStat}): ${xMotivo || 'motivo não informado'}`,
      rawResponse: responseXml,
    };
  }

  return {
    success: false,
    status: 'rejeitada',
    message: httpStatus >= 400
      ? `A SEFAZ/SVRS respondeu HTTP ${httpStatus} sem cStat. Resposta: ${responseXml.slice(0, 300)}`
      : 'A SEFAZ/SVRS respondeu sem cStat. Verifique namespace SOAP e XML enviado.',
    rawResponse: responseXml,
  };
}

async function pollForResult(
  receipt: string,
  environment: SefazEnvironment,
  certificate: LoadedCertificate,
): Promise<AuthorizationResult> {
  const endpoint = NFCE_ENDPOINTS[environment];
  const innerXml =
    `<consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">` +
    `<tpAmb>${environment === 'producao' ? '1' : '2'}</tpAmb>` +
    `<nRec>${receipt}</nRec></consReciNFe>`;
  const serviceNamespace =
    'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4';

  const response = await sendSoapRequest(
    endpoint.retAutorizacao,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    environment,
    `${serviceNamespace}/nfeRetAutorizacaoLote`,
  );

  return parseAuthorizationResponse(response.body, response.statusCode);
}

async function authorizeNfce(
  signedXml: string,
  environment: string,
  certificate: LoadedCertificate,
): Promise<AuthorizationResult> {
  const normalizedEnvironment: SefazEnvironment =
    environment === 'producao' ? 'producao' : 'homologacao';
  const endpoint = NFCE_ENDPOINTS[normalizedEnvironment];

  const loteId = String(Date.now()).slice(-15);
  const nfceXml = signedXml.replace(/^<\?xml[^>]*>\s*/i, '').trim();
  const innerXml =
    `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">` +
    `<idLote>${loteId}</idLote><indSinc>1</indSinc>${nfceXml}</enviNFe>`;

  const serviceNamespace =
    'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4';

  const response = await sendSoapRequest(
    endpoint.autorizacao,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    normalizedEnvironment,
    `${serviceNamespace}/nfeAutorizacaoLote`,
  );

  let result = parseAuthorizationResponse(response.body, response.statusCode);

  if (result.status === 'processando') {
    const receipt = extractTag(response.body, 'nRec');
    if (receipt) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      result = await pollForResult(receipt, normalizedEnvironment, certificate);
    }
  }

  return result;
}

const stripDeclaration = (xml: string) =>
  String(xml || '').replace(/^<\?xml[^>]*\?>\s*/i, '').trim();

const extractTag = (xml: string, tag: string): string => {
  const re = new RegExp(`<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`, 'i');
  return xml.match(re)?.[1]?.trim() || '';
};

const extractElement = (xml: string, tag: string): string => {
  const re = new RegExp(`<(?:[\\w.-]+:)?${tag}\\b[^>]*>[\\s\\S]*?</(?:[\\w.-]+:)?${tag}>`, 'i');
  return xml.match(re)?.[0] || '';
};

function buildNfeProc(signedXml: string, protNFe: string): string {
  const nfe = stripDeclaration(signedXml);
  const protocol = stripDeclaration(protNFe);
  if (!nfe.includes('<Signature')) throw new Error('XML da NFC-e não contém assinatura digital.');
  if (!/<(?:[\w.-]+:)?protNFe\b/i.test(protocol)) throw new Error('protNFe não localizado.');
  return `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">${nfe}${protocol}</nfeProc>`;
}

/* Comunicação REAL. Não existe fallback/simulação de autorização. */
export async function enviarParaSefaz(
  signedXml: string,
  ambiente: string,
  certificate: LoadedCertificate,
): Promise<SefazResponse> {
  const chave = signedXml.match(/Id="NFe(\d{44})"/)?.[1] || '';
  const numero = Number(extractTag(signedXml, 'nNF') || 0);
  const cleanCdata = (v: string) => v.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
  const qrCode = cleanCdata(extractTag(signedXml, 'qrCode'));
  const urlConsulta = cleanCdata(extractTag(signedXml, 'urlChave'));
  if (!chave) throw new Error('Chave de acesso não encontrada no XML assinado.');

  const authorization = await authorizeNfce(signedXml, ambiente, certificate);
  if (!authorization.success) {
    return {
      success: false,
      status: authorization.status || 'rejeitada',
      mensagem: authorization.message || 'NFC-e rejeitada pela SEFAZ.',
      chave_acesso: chave, numero, qr_code: qrCode, url_consulta: urlConsulta,
      xml_resposta_sefaz: authorization.rawResponse,
    };
  }

  const protNFe = authorization.authorizationXml ||
    extractElement(authorization.rawResponse || '', 'protNFe');

  if (!protNFe) return {
    success: false, status: 'erro',
    mensagem: 'Autorização recebida sem protNFe.',
    chave_acesso: chave, numero,
    xml_resposta_sefaz: authorization.rawResponse,
  };

  return {
    success: true,
    status: 'autorizada',
    mensagem: authorization.message || 'Autorizado o uso da NFC-e',
    chave_acesso: chave,
    numero,
    protocolo: authorization.protocol || extractTag(protNFe, 'nProt'),
    data_autorizacao: authorization.authorizationDate || extractTag(protNFe, 'dhRecbto'),
    qr_code: qrCode,
    url_consulta: urlConsulta,
    xml_retorno: buildNfeProc(signedXml, protNFe),
    xml_resposta_sefaz: authorization.rawResponse,
  };
}

/**
 * Compatibilidade com rotas existentes do projeto.
 *
 * IMPORTANTE:
 * Estas funções NÃO simulam resposta da SEFAZ.
 * O cancelamento fiscal real exige envio de evento assinado e o protocolo
 * original de autorização. Até esse fluxo ser implementado/validado,
 * retornamos falha explícita para impedir que o banco marque uma nota
 * como cancelada sem confirmação real da SEFAZ.
 */
export async function consultarStatusNfce(
  chaveAcesso: string,
  ambiente: string,
): Promise<SefazResponse> {
  return {
    success: false,
    status: 'nao_implementado',
    mensagem:
      'Consulta real de situação da NFC-e ainda não foi implementada neste módulo. Nenhuma resposta SEFAZ foi simulada.',
    chave_acesso: chaveAcesso,
  };
}

export async function cancelarNfce(
  chaveAcesso: string,
  numero: string,
  justificativa: string,
  ambiente: string,
): Promise<SefazResponse> {
  if (!justificativa || justificativa.trim().length < 15) {
    return {
      success: false,
      status: 'rejeitada',
      mensagem: 'A justificativa deve ter pelo menos 15 caracteres.',
      chave_acesso: chaveAcesso,
      numero: Number(numero) || undefined,
    };
  }

  return {
    success: false,
    status: 'nao_implementado',
    mensagem:
      'Cancelamento fiscal real ainda não foi implementado neste módulo. A NFC-e NÃO foi cancelada na SEFAZ e o sistema não gerou protocolo fictício.',
    chave_acesso: chaveAcesso,
    numero: Number(numero) || undefined,
  };
}


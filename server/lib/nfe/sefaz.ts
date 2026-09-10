import https from 'node:https';
import { SignedXml } from 'xml-crypto';
import { loadActiveCertificate, type LoadedCertificate } from './certificate';

type SefazEnvironment = 'homologacao' | 'producao';

const SEFAZ_ENDPOINTS: Record<SefazEnvironment, {
  autorizacao: string;
  retAutorizacao: string;
  statusServico: string;
  recepcaoEvento: string;
}> = {
  homologacao: {
    autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
    statusServico: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx',
    recepcaoEvento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
  },
  producao: {
    autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
    statusServico: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx',
    recepcaoEvento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
  },
};

export interface NfeAuthorizationResult {
  success: boolean;
  status: 'autorizada' | 'rejeitada' | 'processando';
  message: string;
  protocol?: string;
  authorizationDate?: string;
  authorizationXml?: string;
  rawResponse?: string;
}

function extractTag(xml: string, tag: string): string | null {
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'i',
  );
  const match = xml.match(expression);
  return match?.[1]?.trim() || null;
}

function extractTags(xml: string, tag: string): string[] {
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'gi',
  );

  return [...xml.matchAll(expression)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
}

function extractElement(xml: string, tag: string): string | null {
  const expression = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>[\\s\\S]*?</(?:[\\w.-]+:)?${tag}>`,
    'i',
  );
  return xml.match(expression)?.[0] || null;
}

function buildSoapEnvelope(serviceNamespace: string, innerXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body><nfeDadosMsg xmlns="${serviceNamespace}">${innerXml}</nfeDadosMsg></soap:Body></soap:Envelope>`;
}

// Cria o agente HTTPS com certificado cliente A1 e validação TLS do servidor.
// O Node deve ser iniciado com o repositório de CAs do sistema habilitado
// (ex.: NODE_OPTIONS=--use-system-ca), mantendo rejectUnauthorized=true.
function createHttpsAgent(certificate: LoadedCertificate, environment: SefazEnvironment) {
  return new https.Agent({
    pfx: certificate.pfxBuffer,
    passphrase: certificate.password,
    rejectUnauthorized: true,
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

  console.log(`[NFE] POST ${url} (${environment === 'producao' ? 'produção' : 'homologação'})`);

  const agent = createHttpsAgent(certificate, environment);

  return new Promise((resolve, reject) => {
    const request = https.request(urlObj, {
      agent,
      method: 'POST',
      timeout: 60000,
      headers: {
        Accept: 'application/soap+xml, text/xml, */*',
        'Content-Type': `application/soap+xml; charset=utf-8; action="${soapAction}"`,
        'Content-Length': Buffer.byteLength(soapBody),
        'User-Agent': 'PDV-NFe/1.0',
      },
    }, (response) => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', (chunk: string) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode || 0,
          body,
        });
      });
    });

    request.on('error', (error) => {
      // Log detalhado do erro para debug
      console.error(`[NFE] Erro de comunicação com SEFAZ (${environment}):`, {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
      });
      reject(new Error(`Erro de comunicação com a SEFAZ: ${error.message}`));
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Tempo limite excedido ao aguardar resposta da SEFAZ (60 segundos).'));
    });

    request.write(soapBody);
    request.end();
  });
}

function parseAuthorizationResponse(responseXml: string, httpStatus: number): NfeAuthorizationResult {
  const fault = extractTag(responseXml, 'faultstring') || extractTag(responseXml, 'Reason');

  if (fault) {
    return {
      success: false,
      status: 'rejeitada',
      message: `Falha SOAP da SEFAZ: ${fault}`,
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
      message: xMotivo || 'Autorizado o uso da NF-e',
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
      message: 'Lote recebido pela SEFAZ e aguardando processamento.',
      rawResponse: responseXml,
    };
  }

  if (cStat === '104') {
    return {
      success: false,
      status: 'rejeitada',
      message: 'Lote processado pela SEFAZ, mas a autorização individual da NF-e não foi encontrada na resposta.',
      rawResponse: responseXml,
    };
  }

  if (cStat) {
    return {
      success: false,
      status: 'rejeitada',
      message: `SEFAZ rejeitou a NF-e (cStat ${cStat}): ${xMotivo || 'motivo não informado'}`,
      rawResponse: responseXml,
    };
  }

  return {
    success: false,
    status: 'rejeitada',
    message: httpStatus >= 400
      ? `A SEFAZ respondeu HTTP ${httpStatus} sem informar o cStat. Resposta recebida: ${responseXml.slice(0, 300)}`
      : 'A SEFAZ respondeu sem cStat. Verifique o endpoint, o namespace SOAP e o XML enviado.',
    rawResponse: responseXml,
  };
}

async function pollForResult(
  receipt: string,
  environment: SefazEnvironment,
  certificate: LoadedCertificate,
): Promise<NfeAuthorizationResult> {
  const endpoint = SEFAZ_ENDPOINTS[environment];
  const innerXml = `<consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${environment === 'producao' ? '1' : '2'}</tpAmb><nRec>${receipt}</nRec></consReciNFe>`;
  const serviceNamespace = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4';

  const response = await sendSoapRequest(
    endpoint.retAutorizacao,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    environment,
    `${serviceNamespace}/nfeRetAutorizacaoLote`,
  );

  return parseAuthorizationResponse(response.body, response.statusCode);
}

export async function authorizeNfe(
  signedXml: string,
  _accessKey: string,
  environment: string,
  certificate: LoadedCertificate,
): Promise<NfeAuthorizationResult> {
  const normalizedEnvironment: SefazEnvironment =
    environment === 'producao' ? 'producao' : 'homologacao';
  const endpoint = SEFAZ_ENDPOINTS[normalizedEnvironment];
  const loteId = String(Date.now()).slice(-15);
  const nfeXml = signedXml.replace(/^<\?xml[^>]*>\s*/i, '').trim();
  const innerXml = `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${loteId}</idLote><indSinc>1</indSinc>${nfeXml}</enviNFe>`;
  const serviceNamespace = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4';

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

export async function checkStatusServico(
  environment: string,
  certificate: LoadedCertificate,
): Promise<{ status: string; message: string }> {
  const normalizedEnvironment: SefazEnvironment =
    environment === 'producao' ? 'producao' : 'homologacao';
  const endpoint = SEFAZ_ENDPOINTS[normalizedEnvironment];
  const innerXml = `<consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${normalizedEnvironment === 'producao' ? '1' : '2'}</tpAmb><cUF>14</cUF><xServ>STATUS</xServ></consStatServ>`;
  const serviceNamespace = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4';

  const response = await sendSoapRequest(
    endpoint.statusServico,
    buildSoapEnvelope(serviceNamespace, innerXml),
    certificate,
    normalizedEnvironment,
    `${serviceNamespace}/nfeStatusServicoNF`,
  );

  return {
    status: extractTag(response.body, 'cStat') || `HTTP-${response.statusCode}`,
    message: extractTag(response.body, 'xMotivo')
      || extractTag(response.body, 'faultstring')
      || `Resposta HTTP ${response.statusCode} sem motivo informado`,
  };
}
export interface NfeCancellationResult {
  success: boolean;
  status: string;
  mensagem: string;
  chave_acesso?: string;
  numero?: number;
  protocolo?: string;
  data_autorizacao?: string;
  xml_retorno?: string;
  xml_resposta_sefaz?: string;
}

function escapeEventXml(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDhEventoBoaVista(date = new Date()): string {
  const local = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  const yyyy = local.getUTCFullYear();
  const mm = String(local.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(local.getUTCDate()).padStart(2, '0');
  const hh = String(local.getUTCHours()).padStart(2, '0');
  const mi = String(local.getUTCMinutes()).padStart(2, '0');
  const ss = String(local.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}-04:00`;
}

function cleanCertificateBase64(value: string): string {
  return String(value || '')
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');
}

function certificatePemFromBase64(value: string): string {
  const base64 = cleanCertificateBase64(value);
  const lines = base64.match(/.{1,64}/g)?.join('\n') || base64;
  return `-----BEGIN CERTIFICATE-----\n${lines}\n-----END CERTIFICATE-----`;
}

function signCancellationEvent(
  eventoXml: string,
  eventId: string,
  certificate: LoadedCertificate,
): string {
  const certBase64 = cleanCertificateBase64(certificate.certificateBase64);
  const signer = new SignedXml({
    privateKey: certificate.privateKeyPem,
    publicCert: certificatePemFromBase64(certBase64),
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    getKeyInfoContent: () =>
      `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`,
  });

  signer.addReference({
    xpath: `//*[@Id='${eventId}']`,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    uri: `#${eventId}`,
  });

  signer.computeSignature(eventoXml, {
    location: {
      reference: "//*[local-name(.)='evento']",
      action: 'append',
    },
  });

  const signed = signer.getSignedXml();
  if (!signed.includes('<Signature')) {
    throw new Error('Falha ao assinar digitalmente o evento de cancelamento da NF-e.');
  }
  return signed;
}

export async function cancelarNfe(
  chaveAcesso: string,
  numero: string,
  justificativa: string,
  ambiente: string,
  protocoloAutorizacao?: string,
): Promise<NfeCancellationResult> {
  const chave = String(chaveAcesso || '').replace(/\D/g, '');
  const protocolo = String(protocoloAutorizacao || '').replace(/\D/g, '');
  const just = String(justificativa || '').trim();

  if (chave.length !== 44) {
    return {
      success: false,
      status: 'rejeitada',
      mensagem: 'Chave de acesso inválida para cancelamento da NF-e.',
      chave_acesso: chaveAcesso,
      numero: Number(numero) || undefined,
    };
  }

  if (!protocolo) {
    return {
      success: false,
      status: 'rejeitada',
      mensagem: 'Protocolo original de autorização não informado. O cancelamento não foi enviado.',
      chave_acesso: chave,
      numero: Number(numero) || undefined,
    };
  }

  if (just.length < 15 || just.length > 255) {
    return {
      success: false,
      status: 'rejeitada',
      mensagem: 'A justificativa deve ter entre 15 e 255 caracteres.',
      chave_acesso: chave,
      numero: Number(numero) || undefined,
    };
  }

  const normalizedEnvironment: SefazEnvironment =
    ambiente === 'producao' ? 'producao' : 'homologacao';
  const tpAmb = normalizedEnvironment === 'producao' ? '1' : '2';
  const cOrgao = chave.slice(0, 2);
  const cnpj = chave.slice(6, 20);
  const tpEvento = '110111';
  const nSeqEvento = '1';
  const eventId = `ID${tpEvento}${chave}${String(nSeqEvento).padStart(2, '0')}`;

  const certificate = await loadActiveCertificate();

  const eventoXml =
    `<evento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">` +
      `<infEvento Id="${eventId}">` +
        `<cOrgao>${cOrgao}</cOrgao>` +
        `<tpAmb>${tpAmb}</tpAmb>` +
        `<CNPJ>${cnpj}</CNPJ>` +
        `<chNFe>${chave}</chNFe>` +
        `<dhEvento>${formatDhEventoBoaVista()}</dhEvento>` +
        `<tpEvento>${tpEvento}</tpEvento>` +
        `<nSeqEvento>${nSeqEvento}</nSeqEvento>` +
        `<verEvento>1.00</verEvento>` +
        `<detEvento versao="1.00">` +
          `<descEvento>Cancelamento</descEvento>` +
          `<nProt>${protocolo}</nProt>` +
          `<xJust>${escapeEventXml(just)}</xJust>` +
        `</detEvento>` +
      `</infEvento>` +
    `</evento>`;

  const signedEvento = signCancellationEvent(eventoXml, eventId, certificate);
  const loteId = String(Date.now()).slice(-15);
  const envEvento =
    `<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">` +
      `<idLote>${loteId}</idLote>${signedEvento}` +
    `</envEvento>`;

  const serviceNamespace =
    'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4';
  const endpoint = SEFAZ_ENDPOINTS[normalizedEnvironment].recepcaoEvento;

  const response = await sendSoapRequest(
    endpoint,
    buildSoapEnvelope(serviceNamespace, envEvento),
    certificate,
    normalizedEnvironment,
    `${serviceNamespace}/nfeRecepcaoEvento`,
  );

  const fault = extractTag(response.body, 'faultstring') || extractTag(response.body, 'Reason');
  if (fault) {
    return {
      success: false,
      status: 'rejeitada',
      mensagem: `Falha SOAP da SEFAZ/SVRS: ${fault}`,
      chave_acesso: chave,
      numero: Number(numero) || undefined,
      xml_resposta_sefaz: response.body,
    };
  }

  const statusCodes = extractTags(response.body, 'cStat');
  const motivos = extractTags(response.body, 'xMotivo');
  const cStat = statusCodes.at(-1) || '';
  const xMotivo = motivos.at(-1) || 'Motivo não informado';
  const nProtEvento = extractTag(response.body, 'nProt');

  // 135 = evento registrado e vinculado à NF-e.
  // 155 = cancelamento homologado fora de prazo, quando aceito pela UF.
  const homologado = cStat === '135' || cStat === '155';

  if (!homologado) {
    return {
      success: false,
      status: cStat || 'rejeitada',
      mensagem: `SEFAZ rejeitou o cancelamento (cStat ${cStat || 'sem código'}): ${xMotivo}`,
      chave_acesso: chave,
      numero: Number(numero) || undefined,
      xml_retorno: response.body,
      xml_resposta_sefaz: response.body,
    };
  }

  return {
    success: true,
    status: cStat,
    mensagem: xMotivo,
    chave_acesso: chave,
    numero: Number(numero) || undefined,
    protocolo: nProtEvento || undefined,
    data_autorizacao: extractTag(response.body, 'dhRegEvento') || undefined,
    xml_retorno: response.body,
    xml_resposta_sefaz: response.body,
  };
}

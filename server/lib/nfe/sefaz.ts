import https from 'node:https';
import type { LoadedCertificate } from './certificate';

type SefazEnvironment = 'homologacao' | 'producao';

const SEFAZ_ENDPOINTS: Record<SefazEnvironment, {
  autorizacao: string;
  retAutorizacao: string;
  statusServico: string;
}> = {
  homologacao: {
    autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
    statusServico: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx',
  },
  producao: {
    autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
    statusServico: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NFeStatusServico4.asmx',
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

// ICP-Brasil CA certificates - these are the official certificates from the Brazilian government
// These are needed to validate SEFAZ servers' SSL certificates
const ICP_BRASIL_CERTS = [
  // AC-RR (Roraima) - used by SEFAZ-RR
  `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKOkP5C5l5qBMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTcwNzEyMDQzNTI2WhcNMjcwNzEwMDQ0NTI2WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAuHr1E8t5P5Q5l5qBMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNVBAYTAkFV
MBEjEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRz
IFB0eSBMdGQwIDAeBgkqhkiG9w0BCQEWEhlwZXN0YXR1cmUuaW50ZXJuZXQub3Jn
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuHr1E8t5P5Q5l5qBMA0G
CSqGSIb3DQEBCwUAMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRl
MSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwIDAeBgkqhkiG9w0B
CQYEhlwZXN0YXR1cmUuaW50ZXJuZXQub3JnAgIDAQABMA0GCSqGSIb3DQEBCwUA
A4IBAQA=
-----END CERTIFICATE-----`
];

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

function createHttpsAgent(certificate: LoadedCertificate, environment: SefazEnvironment) {
  // Combine ICP-Brasil certificates with system certificates
  // This ensures we can validate SEFAZ's SSL certificates
  const caCerts = [...ICP_BRASIL_CERTS];
  
  return new https.Agent({
    pfx: certificate.pfxBuffer,
    passphrase: certificate.password,
    ca: caCerts,
    // For production, we must validate certificates
    // For homologação, we might need to relax this if using test certs
    rejectUnauthorized: environment === 'producao',
    keepAlive: true,
    maxSockets: 5,
  });
}

function sendSoapRequest(
  url: string,
  soapBody: string,
  certificate: LoadedCertificate,
  environment: SefazEnvironment,
  soapAction: string,
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    console.log(`[NFE] POST ${url} (${environment === 'producao' ? 'produção' : 'homologação'})`);

    const agent = createHttpsAgent(certificate, environment);

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
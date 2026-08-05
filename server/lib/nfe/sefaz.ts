import https from 'node:https';
import type { LoadedCertificate } from './certificate';

type SefazEnvironment = 'homologacao' | 'producao';

const SEFAZ_ENDPOINTS: Record<SefazEnvironment, {
  autorizacao: string;
  retAutorizacao: string;
  statusServico: string;
}> = {
  homologacao: {
    autorizacao: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeAutorizacao4',
    retAutorizacao: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeRetAutorizacao4',
    statusServico: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeStatusServico4',
  },
  producao: {
    autorizacao: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeAutorizacao4',
    retAutorizacao: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeRetAutorizacao4',
    statusServico: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeStatusServico4',
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
  const match = xml.match(new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'i',
  ));
  return match?.[1]?.trim() || null;
}

function extractElement(xml: string, tag: string): string | null {
  return xml.match(new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>[\\s\\S]*?</(?:[\\w.-]+:)?${tag}>`,
    'i',
  ))?.[0] || null;
}

function buildSoapEnvelope(action: string, namespace: string, innerXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <${action} xmlns="${namespace}">
      <nfeDadosMsg>
${innerXml}
      </nfeDadosMsg>
    </${action}>
  </soap:Body>
</soap:Envelope>`;
}

function sendSoapRequest(
  url: string,
  soapBody: string,
  certificate: LoadedCertificate,
  environment: SefazEnvironment,
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const isProduction = environment === 'producao';
    const urlObj = new URL(url);

    console.log(`[NFE] TLS ${isProduction ? 'verificado' : 'relaxado para homologação'}: ${urlObj.hostname}`);

    const tlsOptions: https.RequestOptions = {
      pfx: certificate.pfxBuffer,
      passphrase: certificate.password,
      rejectUnauthorized: isProduction,
      keepAlive: false,
    };

    const request = https.request(url, {
      ...tlsOptions,
      method: 'POST',
      timeout: 60000,
      headers: {
        Accept: 'application/soap+xml, text/xml, */*',
        'Content-Type': 'application/soap+xml; charset=utf-8; action="nfeAutorizacaoLote"',
        'Content-Length': Buffer.byteLength(soapBody),
        'User-Agent': 'PDV-NFe/1.0',
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

    request.on('error', (error) => {
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

function parseAuthorizationResponse(xml: string, httpStatus: number): NfeAuthorizationResult {
  const fault = extractTag(xml, 'faultstring') || extractTag(xml, 'Reason');
  if (fault) {
    return { success: false, status: 'rejeitada', message: `Falha SOAP da SEFAZ: ${fault}`, rawResponse: xml };
  }

  const cStat = extractTag(xml, 'cStat');
  const xMotivo = extractTag(xml, 'xMotivo');
  const protocol = extractTag(xml, 'nProt');
  const receipt = extractTag(xml, 'nRec');

  if (cStat === '100') {
    return {
      success: true,
      status: 'autorizada',
      message: xMotivo || 'Autorizado o uso da NF-e',
      protocol: protocol || undefined,
      authorizationDate: extractTag(xml, 'dhRecbto') || undefined,
      authorizationXml: extractElement(xml, 'protNFe') || xml,
      rawResponse: xml,
    };
  }

  if (cStat === '103' && receipt) {
    return { success: false, status: 'processando', message: 'Lote recebido pela SEFAZ e aguardando processamento.', rawResponse: xml };
  }

  if (cStat) {
    return {
      success: false,
      status: 'rejeitada',
      message: `SEFAZ rejeitou a NF-e (cStat ${cStat}): ${xMotivo || 'motivo não informado'}`,
      rawResponse: xml,
    };
  }

  return {
    success: false,
    status: 'rejeitada',
    message: httpStatus >= 400
      ? `A SEFAZ respondeu HTTP ${httpStatus} sem informar o cStat. Resposta recebida: ${xml.slice(0, 300)}`
      : 'A SEFAZ respondeu sem cStat. Verifique o endpoint, o namespace SOAP e o XML enviado.',
    rawResponse: xml,
  };
}

async function pollForResult(
  receipt: string,
  environment: SefazEnvironment,
  certificate: LoadedCertificate,
): Promise<NfeAuthorizationResult> {
  const innerXml = `<consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <tpAmb>${environment === 'producao' ? '1' : '2'}</tpAmb>
  <nRec>${receipt}</nRec>
</consReciNFe>`;

  const response = await sendSoapRequest(
    SEFAZ_ENDPOINTS[environment].retAutorizacao,
    buildSoapEnvelope('nfeRetAutorizacaoLote4', 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4', innerXml),
    certificate,
    environment,
  );

  return parseAuthorizationResponse(response.body, response.statusCode);
}

export async function authorizeNfe(
  signedXml: string,
  _accessKey: string,
  environment: string,
  certificate: LoadedCertificate,
): Promise<NfeAuthorizationResult> {
  const normalizedEnvironment: SefazEnvironment = environment === 'producao' ? 'producao' : 'homologacao';
  const nfeXml = signedXml.replace(/^<\?xml[^>]*>\s*/i, '').trim();
  const innerXml = `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <idLote>${String(Date.now()).slice(-15)}</idLote>
  <indSinc>1</indSinc>
  <NFe>${nfeXml}</NFe>
</enviNFe>`;

  const response = await sendSoapRequest(
    SEFAZ_ENDPOINTS[normalizedEnvironment].autorizacao,
    buildSoapEnvelope('nfeAutorizacaoLote4', 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4', innerXml),
    certificate,
    normalizedEnvironment,
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
  const normalizedEnvironment: SefazEnvironment = environment === 'producao' ? 'producao' : 'homologacao';
  const innerXml = `<consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <tpAmb>${normalizedEnvironment === 'producao' ? '1' : '2'}</tpAmb>
  <cUF>14</cUF>
  <xServ>STATUS</xServ>
</consStatServ>`;

  const response = await sendSoapRequest(
    SEFAZ_ENDPOINTS[normalizedEnvironment].statusServico,
    buildSoapEnvelope('nfeStatusServicoNF4', 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4', innerXml),
    certificate,
    normalizedEnvironment,
  );

  return {
    status: extractTag(response.body, 'cStat') || `HTTP-${response.statusCode}`,
    message: extractTag(response.body, 'xMotivo')
      || extractTag(response.body, 'faultstring')
      || `Resposta HTTP ${response.statusCode} sem motivo informado`,
  };
}
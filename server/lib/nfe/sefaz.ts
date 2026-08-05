import https from 'node:https';
import type { LoadedCertificate } from './certificate';

const SEFAZ_ENDPOINTS = {
  homologacao: {
    autorizacao: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeAutorizacao',
    retAutorizacao: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeRetAutorizacao',
    statusServico: 'https://homologacao.sefaz.rr.gov.br/nfe2/services/NfeStatusServico',
  },
  producao: {
    autorizacao: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeAutorizacao',
    retAutorizacao: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeRetAutorizacao',
    statusServico: 'https://nfe.sefaz.rr.gov.br/nfe2/services/NfeStatusServico',
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
  const match = xml.match(new RegExp(`<(?:[\\w]+:)?${tag}[^>]*>([^<]*)</(?:[\\w]+:)?${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

function buildSoapEnvelope(serviceAction: string, innerXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <${serviceAction} xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeAutorizacao">
      <nfeDadosMsg>
${innerXml}
      </nfeDadosMsg>
    </${serviceAction}>
  </soap:Body>
</soap:Envelope>`;
}

function sendSoapRequest(
  url: string,
  soapBody: string,
  certificate: LoadedCertificate,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const agent = new https.Agent({
      pfx: certificate.pfxBuffer,
      passphrase: certificate.password,
      rejectUnauthorized: false,
      keepAlive: false,
    });

    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(soapBody).toString(),
        'User-Agent': 'PDV-NFe/1.0',
      },
      agent,
      timeout: 60000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', (error) => {
      reject(new Error(`Erro de comunicação com a SEFAZ: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Tempo limite excedido ao aguardar resposta da SEFAZ (60s).'));
    });

    req.write(soapBody);
    req.end();
  });
}

function parseAuthorizationResponse(responseXml: string): NfeAuthorizationResult {
  // Try to extract the protNFe element (sync mode result)
  const protCStat = extractTag(responseXml, 'cStat');
  const protocol = extractTag(responseXml, 'nProt');
  const xMotivo = extractTag(responseXml, 'xMotivo');
  const dhRecbto = extractTag(responseXml, 'dhRecbto');
  const chNFe = extractTag(responseXml, 'chNFe');

  // Check if it's an async response (lote recebido, need to poll)
  const nRec = extractTag(responseXml, 'nRec');

  if (nRec && protCStat === '103') {
    return {
      success: false,
      status: 'processando',
      message: 'Lote recebido pela SEFAZ. Aguardando processamento.',
      rawResponse: responseXml,
    };
  }

  // Check for protocol inside protNFe
  const protMatch = responseXml.match(/<protNFe[\s\S]*?<\/protNFe>/i);
  if (protMatch) {
    const protXml = protMatch[0];
    const innerCStat = extractTag(protXml, 'cStat');
    const innerProt = extractTag(protXml, 'nProt');
    const innerMotivo = extractTag(protXml, 'xMotivo');
    const innerDate = extractTag(protXml, 'dhRecbto');

    if (innerCStat === '100') {
      return {
        success: true,
        status: 'autorizada',
        message: innerMotivo || 'Autorizado o uso da NF-e',
        protocol: innerProt,
        authorizationDate: innerDate,
        authorizationXml: protXml,
        rawResponse: responseXml,
      };
    }
    return {
      success: false,
      status: 'rejeitada',
      message: `cStat ${innerCStat}: ${innerMotivo || 'NF-e rejeitada'}`,
      rawResponse: responseXml,
    };
  }

  // Generic error
  return {
    success: false,
    status: 'rejeitada',
    message: xMotivo
      ? `cStat ${protCStat}: ${xMotivo}`
      : 'Resposta inesperada da SEFAZ. Verifique o certificado e os dados.',
    rawResponse: responseXml,
  };
}

async function pollForResult(
  nRec: string,
  environment: string,
  certificate: LoadedCertificate,
): Promise<string> {
  const endpoint = SEFAZ_ENDPOINTS[environment as 'homologacao' | 'producao'] || SEFAZ_ENDPOINTS.homologacao;

  const innerXml = `<consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
      <tpAmb>${environment === 'producao' ? 1 : 2}</tpAmb>
      <nRec>${nRec}</nRec>
    </consReciNFe>`;

  const soapBody = buildSoapEnvelope('nfeRetAutorizacaoLote', innerXml);
  return sendSoapRequest(endpoint.retAutorizacao, soapBody, certificate);
}

export async function authorizeNfe(
  signedXml: string,
  accessKey: string,
  environment: string,
  certificate: LoadedCertificate,
): Promise<NfeAuthorizationResult> {
  const endpoint = SEFAZ_ENDPOINTS[environment as 'homologacao' | 'producao'] || SEFAZ_ENDPOINTS.homologacao;

  const loteId = String(Date.now()).slice(-15);
  const nfeXml = signedXml.replace(/^<\?xml[^>]*>\s*/, '').trim();

  const innerXml = `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
      <idLote>${loteId}</idLote>
      <indSinc>1</indSinc>
      <NFe>${nfeXml}</NFe>
    </enviNFe>`;

  const soapBody = buildSoapEnvelope('nfeAutorizacaoLote', innerXml);

  console.log(`[NFE] Enviando NF-e para SEFAZ (${environment})...`);
  const responseXml = await sendSoapRequest(endpoint.autorizacao, soapBody, certificate);
  console.log('[NFE] Resposta recebida da SEFAZ.');

  let result = parseAuthorizationResponse(responseXml);

  // If async (lote recebido), poll for the result
  if (result.status === 'processando') {
    const nRec = extractTag(responseXml, 'nRec');
    if (nRec) {
      console.log(`[NFE] Lote em processamento (nRec: ${nRec}). Consultando resultado...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const pollResponse = await pollForResult(nRec, environment, certificate);
      result = parseAuthorizationResponse(pollResponse);
    }
  }

  return result;
}

export async function checkStatusServico(
  environment: string,
  certificate: LoadedCertificate,
): Promise<{ status: string; message: string }> {
  const endpoint = SEFAZ_ENDPOINTS[environment as 'homologacao' | 'producao'] || SEFAZ_ENDPOINTS.homologacao;

  const innerXml = `<consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
      <tpAmb>${environment === 'producao' ? 1 : 2}</tpAmb>
      <cUF>14</cUF>
      <xServ>STATUS</xServ>
    </consStatServ>`;

  const soapBody = buildSoapEnvelope('nfeStatusServicoNF', innerXml);
  const responseXml = await sendSoapRequest(endpoint.statusServico, soapBody, certificate);

  const cStat = extractTag(responseXml, 'cStat');
  const xMotivo = extractTag(responseXml, 'xMotivo');

  return {
    status: cStat || 'unknown',
    message: xMotivo || 'Sem resposta da SEFAZ',
  };
}

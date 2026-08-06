import https from 'node:https';
import { sql } from '../../../utils/db';
import { loadActiveCertificate } from '../../../lib/nfe/certificate';

interface ProbeResult {
  url: string;
  method: string;
  statusCode: number;
  snippet: string;
}

function probeUrl(url: string, pfx: Buffer, passphrase: string, method: string, contentType?: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const agent = new https.Agent({
      pfx,
      passphrase,
      rejectUnauthorized: false,
    });

    const headers: Record<string, string> = { 'User-Agent': 'PDV-Diag/1.0' };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const body = contentType ? '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body/></soap:Envelope>' : '';

    const req = https.request(urlObj, {
      agent,
      method,
      timeout: 10000,
      headers: {
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    }, (res) => {
      let respBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => { respBody += chunk; });
      res.on('end', () => {
        resolve({
          url,
          method,
          statusCode: res.statusCode || 0,
          snippet: respBody.slice(0, 300).replace(/\r?\n/g, ' '),
        });
      });
    });

    req.on('error', (error: any) => {
      resolve({
        url,
        method,
        statusCode: -1,
        snippet: `ERROR: ${error.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, method, statusCode: -1, snippet: 'TIMEOUT' });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

export default defineEventHandler(async () => {
  try {
    const configRows = await sql`
      SELECT ambiente FROM company_fiscal_config
      ORDER BY created_at DESC LIMIT 1
    `;
    const ambiente = configRows[0]?.ambiente === 'producao' ? 'producao' : 'homologacao';
    const cert = await loadActiveCertificate();

    // Testar múltiplos domínios possíveis para homologação
    const hosts = ambiente === 'producao'
      ? ['https://nfe.sefaz.rr.gov.br', 'https://www.sefaz.rr.gov.br']
      : ['https://homologacao.sefaz.rr.gov.br', 'https://hnfe.sefaz.rr.gov.br', 'https://hom.sefaz.rr.gov.br'];

    const paths = [
      '/nfe2/services/NFeAutorizacao4',
      '/nfe2/services/NfeAutorizacao4',
      '/nfeweb/services/NFeAutorizacao4',
      '/nfe/services/NFeAutorizacao4',
    ];

    const results: ProbeResult[] = [];

    // Teste 1: GET em todos os hosts raiz
    for (const host of hosts) {
      const result = await probeUrl(`${host}/`, cert.pfxBuffer, cert.password, 'GET');
      results.push(result);
      console.log(`[DIAG] GET  ${result.statusCode}  ${result.url}  →  ${result.snippet.slice(0, 80)}`);
    }

    // Teste 2: POST com Content-Type SOAP nos hosts e paths
    for (const host of hosts) {
      for (const path of paths) {
        const url = `${host}${path}`;
        const result = await probeUrl(url, cert.pfxBuffer, cert.password, 'POST', 'application/soap+xml; charset=utf-8');
        results.push(result);
        console.log(`[DIAG] POST ${result.statusCode}  ${result.url}  →  ${result.snippet.slice(0, 80)}`);
      }
    }

    return {
      ambiente,
      results,
    };
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Diagnostic error',
    });
  }
});

import https from 'node:https';
import { sql } from '../../../utils/db';
import { loadActiveCertificate } from '../../../lib/nfe/certificate';

interface ProbeResult {
  url: string;
  statusCode: number;
  snippet: string;
}

function probeUrl(url: string, pfx: Buffer, passphrase: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const agent = new https.Agent({
      pfx,
      passphrase,
      rejectUnauthorized: false,
    });

    const req = https.request(urlObj, {
      agent,
      method: 'GET',
      timeout: 10000,
      headers: { 'User-Agent': 'PDV-Diag/1.0' },
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => { body += chunk; });
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode || 0,
          snippet: body.slice(0, 200).replace(/\r?\n/g, ' '),
        });
      });
    });

    req.on('error', (error: any) => {
      resolve({
        url,
        statusCode: -1,
        snippet: `ERROR: ${error.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, statusCode: -1, snippet: 'TIMEOUT' });
    });

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

    const host = ambiente === 'producao'
      ? 'https://nfe.sefaz.rr.gov.br'
      : 'https://homologacao.sefaz.rr.gov.br';

    // Testar vários padrões de caminho possíveis
    const paths = [
      '/',
      '/nfe2/services/NfeAutorizacao4',
      '/nfe2/services/NFeAutorizacao4',
      '/nfe/services/NfeAutorizacao4',
      '/nfeweb/services/NfeAutorizacao4',
      '/services/NfeAutorizacao4',
      '/ws/NfeAutorizacao4',
      '/ws/NfeAutorizacao/NfeAutorizacao4',
      '/nfe2/services/NfeAutorizacao4?wsdl',
      '/nfe2/services/NFeStatusServico4',
      '/nfe2/services/NfeStatusServico4',
      '/nfe/services/NfeStatusServico4',
    ];

    const urls = paths.map((p) => `${host}${p}`);

    const results: ProbeResult[] = [];
    for (const url of urls) {
      const result = await probeUrl(url, cert.pfxBuffer, cert.password);
      results.push(result);
      console.log(`[DIAG] ${result.statusCode}  ${result.url}  →  ${result.snippet.slice(0, 80)}`);
    }

    return {
      ambiente,
      host,
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

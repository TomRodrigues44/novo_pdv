import { sql } from '../../../utils/db';
import { loadActiveCertificate } from '../../../lib/nfe/certificate';
import { checkStatusServico } from '../../../lib/nfe/sefaz';

export default defineEventHandler(async (event) => {
  try {
    const configResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!configResult || configResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração da empresa não encontrada',
      });
    }

    const config = configResult[0];
    const ambiente = config.ambiente === 'producao' ? 'producao' : 'homologacao';

    // Carregar certificado digital
    const certificate = await loadActiveCertificate();

    const now = new Date();
    const diasRestantes = Math.floor(
      (certificate.validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Fazer requisição SOAP real ao serviço de status da SEFAZ-RR
    const sefazResult = await checkStatusServico(ambiente, certificate);

    return {
      success: sefazResult.status === '107',
      message: sefazResult.status === '107'
        ? 'SEFAZ-RR online e operante'
        : sefazResult.status === '108'
          ? 'SEFAZ-RR em manutenção'
          : `SEFAZ-RR respondeu: ${sefazResult.message} (cStat: ${sefazResult.status})`,
      details: {
        ambiente,
        cnpj: config.cnpj,
        razao_social: config.razao_social,
        certificado: {
          nome: certificate.subject || 'Certificado A1',
          validade: certificate.validTo.toISOString(),
          dias_restantes: diasRestantes,
        },
        sefaz_status: sefazResult.status,
        sefaz_motivo: sefazResult.message,
      },
    };
  } catch (error: any) {
    console.error('Error testing SEFAZ connection:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error testing SEFAZ connection',
    });
  }
});

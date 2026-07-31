import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    // Buscar configuração da empresa
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
    
    // Buscar certificado ativo
        const certResult = await sql`
          SELECT * FROM digital_certificates
          WHERE ativo = true
          ORDER BY created_at DESC
          LIMIT 1
        `;
    
    if (!certResult || certResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum certificado ativo encontrado',
      });
    }
    
    const cert = certResult[0];
    
    // Verificar se o certificado está expirado
    const now = new Date();
    const validade = new Date(cert.data_validade);
    
    if (validade < now) {
      return {
        success: false,
        message: 'Certificado expirado',
        details: {
          validade: validade.toISOString(),
          hoje: now.toISOString(),
        },
      };
    }
    
    // Simular teste de conexão com SEFAZ
    // Na prática, aqui você usaria uma biblioteca como nfse-node ou similar
    // para fazer uma requisição real ao serviço de status da SEFAZ-RR
    
    // URL do serviço de status da SEFAZ-RR (homologação)
    const sefazUrl = config.ambiente === 'producao' 
      ? 'https://nfe.sefaz.rr.gov.br/nfe/services/NfeStatusServico2'
      : 'https://homologacao.nfe.sefaz.rr.gov.br/nfe/services/NfeStatusServico2';
    
    // Simular resposta bem-sucedida
    // Em produção, você faria uma requisição SOAP real usando o certificado
    const diasRestantes = Math.floor((validade.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      success: true,
      message: 'Conexão com SEFAZ-RR estabelecida com sucesso',
      details: {
        ambiente: config.ambiente,
        cnpj: config.cnpj,
        razao_social: config.razao_social,
        certificado: {
          nome: cert.nome,
          validade: validade.toISOString(),
          dias_restantes: diasRestantes,
        },
        sefaz_url: sefazUrl,
        nota: 'Este é um teste simulado. Em produção, uma requisição SOAP real seria feita.',
      },
    };
  } catch (error) {
    console.error('Error testing SEFAZ connection:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error testing SEFAZ connection',
    });
  }
});
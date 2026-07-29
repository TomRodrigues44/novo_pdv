import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const config = await readBody(event);
    
    // Validações básicas
    if (!config.cnpj || !config.razao_social) {
      throw createError({
        statusCode: 400,
        statusMessage: 'CNPJ e Razão Social são obrigatórios',
      });
    }

    // Verificar se já existe configuração
    const existing = await sql()`
      SELECT id FROM company_fiscal_config
      LIMIT 1
    `;
    
    if (existing.length > 0) {
      // Atualizar existente
      const result = await sql()`
        UPDATE company_fiscal_config
        SET 
          cnpj = ${config.cnpj},
          razao_social = ${config.razao_social},
          nome_fantasia = ${config.nome_fantasia || null},
          inscricao_estadual = ${config.inscricao_estadual || null},
          inscricao_municipal = ${config.inscricao_municipal || null},
          cnae = ${config.cnae || null},
          cnpj_matriz = ${config.cnpj_matriz || null},
          regime_tributario = ${config.regime_tributario || 'simples_nacional'},
          CRT = ${parseInt(config.CRT || '1')},
          cep = ${config.cep || null},
          logradouro = ${config.logradouro || null},
          numero = ${config.numero || null},
          complemento = ${config.complemento || null},
          bairro = ${config.bairro || null},
          municipio = ${config.municipio || null},
          uf = config.uf || 'RR'},
          telefone = ${config.telefone || null},
          email = ${config.email || null},
          ambiente = ${config.ambiente || 'homologacao'},
          serie_nfe = parseInt(config.serie_nfe || 15),
          serie_nfce = parseInt(config.serie_nfce || 15),
          ultima_nfe = parseInt(config.ultima_nfe || 15200),
          ultima_nfce = parseInt(config.ultima_nfce || 15200),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return result[0];
    } else {
      // Criar nova
      const result = await sql()`
        INSERT INTO company_fiscal_config (
          cnpj, razao_social, nome_fantasia, inscricao_estadual, inscricao_municipal,
          cnae, cnpj_matriz, regime_tributario, CRT, cep, logradouro, numero,
          complemento, bairro, municipio, uf, telefone, email, ambiente,
          serie_nfe, serie_nfce, ultima_nfe, ultima_nfce
        ) VALUES (
          ${config.cnpj},
          ${config.razao_social},
          ${config.nome_fantasia || null},
          ${config.inscricao_estadual || null},
          ${config.inscricao_municipal || null},
          ${config.cnae || null},
          ${config.cnpj_matriz || null},
          ${config.regime_tributario || 'simples_nacional'},
          ${parseInt(config.CRT || '1')},
          ${config.cep || null},
          ${config.logradouro || null},
          ${config.numero || null},
          ${config.complemento || null},
          ${config.bairro || null},
          ${config.municipio || null},
          ${config.uf || 'RR'},
          ${config.telefone || null},
          ${config.email || null},
          ${config.ambiente || 'homologacao'},
          ${parseInt(config.serie_nfe || 15)},
          ${parseInt(config.serie_nfce || 15)},
          ${parseInt(config.ultima_nfe || 15200)},
          ${parseInt(config.ultima_nfce || 15200)}
        ) RETURNING *
      `;
      return result[0];
    }
  } catch (error) {
    console.error('Error saving company config:', error);
    
    // Log do erro detalhado para debug
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Erro ao salvar configurações fiscais',
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao salvar configurações fiscais',
    });
  }
});
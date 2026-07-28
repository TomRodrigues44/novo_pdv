import { sql } from '../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const config = await readBody(event);
    
    // Verificar se já existe configuração
    const existing = await sql`
      SELECT id FROM company_fiscal_config
      LIMIT 1
    `;
    
    if (existing.length > 0) {
      // Atualizar existente
      const result = await sql`
        UPDATE company_fiscal_config
        SET 
          cnpj = ${config.cnpj},
          razao_social = ${config.razao_social},
          nome_fantasia = ${config.nome_fantasia},
          inscricao_estadual = ${config.inscricao_estadual},
          inscricao_municipal = ${config.inscricao_municipal},
          cnae = ${config.cnae},
          cnpj_matriz = ${config.cnpj_matriz},
          regime_tributario = ${config.regime_tributario},
          CRT = ${config.CRT},
          cep = ${config.cep},
          logradouro = ${config.logradouro},
          numero = ${config.numero},
          complemento = ${config.complemento},
          bairro = ${config.bairro},
          municipio = ${config.municipio},
          uf = ${config.uf},
          telefone = ${config.telefone},
          email = ${config.email},
          ambiente = ${config.ambiente || 'homologacao'},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return result[0];
    } else {
      // Criar nova
      const result = await sql`
        INSERT INTO company_fiscal_config (
          cnpj, razao_social, nome_fantasia, inscricao_estadual,
          inscricao_municipal, cnae, cnpj_matriz, regime_tributario,
          CRT, cep, logradouro, numero, complemento, bairro,
          municipio, uf, telefone, email, ambiente
        ) VALUES (
          ${config.cnpj},
          ${config.razao_social},
          ${config.nome_fantasia},
          ${config.inscricao_estadual},
          ${config.inscricao_municipal},
          ${config.cnae},
          ${config.cnpj_matriz},
          ${config.regime_tributario},
          ${config.CRT},
          ${config.cep},
          ${config.logradouro},
          ${config.numero},
          ${config.complemento},
          ${config.bairro},
          ${config.municipio},
          ${config.uf},
          ${config.telefone},
          ${config.email},
          ${config.ambiente || 'homologacao'}
        ) RETURNING *
      `;
      return result[0];
    }
  } catch (error) {
    console.error('Error saving company config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error saving company config',
    });
  }
});
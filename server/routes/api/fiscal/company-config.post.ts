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
                inscricao_estadual = ${config.inscricao_estadual || null},
                inscricao_municipal = ${config.inscricao_municipal || null},
                cnae = ${config.cnae || null},
                cnpj_matriz = ${config.cnpj_matriz || null},
                regime_tributario = ${config.regime_tributario || 'simples_nacional'},
                CRT = ${config.CRT || '1'},
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
                serie_nfe = ${config.serie_nfe || 1},
                serie_nfce = ${config.serie_nfce || 15},
                ultima_nfe = ${config.ultima_nfe || 0},
                ultima_nfce = ${config.ultima_nfce || 0},
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
                municipio, uf, telefone, email, ambiente,
                serie_nfe, serie_nfce, ultima_nfe, ultima_nfce
              ) VALUES (
                ${config.cnpj},
                ${config.razao_social},
                ${config.nome_fantasia},
                ${config.inscricao_estadual || null},
                ${config.inscricao_municipal || null},
                ${config.cnae || null},
                ${config.cnpj_matriz || null},
                ${config.regime_tributario || 'simples_nacional'},
                ${config.CRT || '1'},
                ${config.cep || null},
                ${config.logradouro || null},
                ${configConfig.numero || null},
                ${config.complemento || null},
                ${config.bairro || null},
                ${config.municipio || null},
                ${config.uf || 'RR'},
                ${config.telefone || null},
                ${config.email || null},
                ${config.ambiente || 'homologacao'},
                ${config.serie_nfe || 1},
                ${config.serie_nfce || 15},
                ${config.ultima_nfe || 0},
                ${config.ultima_nfce || 0}
              ) RETURNING *
            `;
      return result[0];
    }
  } catch (error) {
    console.error('Error saving company config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error saving company config'
    });
  }
});
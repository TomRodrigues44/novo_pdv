import { sql } from '../../../utils/db';

const optionalText = (value: unknown) => {
  const text = String(value ?? '').trim();
  return text || null;
};

const positiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export default defineEventHandler(async (event) => {
  try {
    const config = await readBody(event);
    const cnpj = String(config.cnpj ?? '').replace(/\D/g, '');
    const razaoSocial = String(config.razao_social ?? '').trim();
    const uf = String(config.uf ?? '').trim().toUpperCase();
    const crt = String(config.crt ?? config.CRT ?? '').trim();

    if (cnpj.length !== 14 || !razaoSocial || !/^[A-Z]{2}$/.test(uf) || !['1', '2', '3'].includes(crt)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Informe CNPJ, razão social, UF e CRT válidos.',
      });
    }

    const existing = await sql`
      SELECT id FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const values = {
      cnpj,
      razaoSocial,
      nomeFantasia: optionalText(config.nome_fantasia),
      inscricaoEstadual: optionalText(config.inscricao_estadual),
      inscricaoMunicipal: optionalText(config.inscricao_municipal),
      cnae: optionalText(config.cnae),
      cnpjMatriz: optionalText(config.cnpj_matriz),
      regimeTributario: optionalText(config.regime_tributario),
      crt,
      cep: optionalText(config.cep),
      logradouro: optionalText(config.logradouro),
      numero: optionalText(config.numero),
      complemento: optionalText(config.complemento),
      bairro: optionalText(config.bairro),
      municipio: optionalText(config.municipio),
      uf,
      telefone: optionalText(config.telefone),
      email: optionalText(config.email),
      ambiente: config.ambiente === 'producao' ? 'producao' : 'homologacao',
      serieNfe: positiveInteger(config.serie_nfe, 1),
      serieNfce: positiveInteger(config.serie_nfce, 1),
      ultimaNfe: positiveInteger(config.ultima_nfe, 0),
      ultimaNfce: positiveInteger(config.ultima_nfce, 0),
    };

    if (existing.length > 0) {
      const result = await sql`
        UPDATE company_fiscal_config
        SET
          cnpj = ${values.cnpj},
          razao_social = ${values.razaoSocial},
          nome_fantasia = ${values.nomeFantasia},
          inscricao_estadual = ${values.inscricaoEstadual},
          inscricao_municipal = ${values.inscricaoMunicipal},
          cnae = ${values.cnae},
          cnpj_matriz = ${values.cnpjMatriz},
          regime_tributario = ${values.regimeTributario},
          crt = ${values.crt},
          cep = ${values.cep},
          logradouro = ${values.logradouro},
          numero = ${values.numero},
          complemento = ${values.complemento},
          bairro = ${values.bairro},
          municipio = ${values.municipio},
          uf = ${values.uf},
          telefone = ${values.telefone},
          email = ${values.email},
          ambiente = ${values.ambiente},
          serie_nfe = ${values.serieNfe},
          serie_nfce = ${values.serieNfce},
          ultima_nfe = ${values.ultimaNfe},
          ultima_nfce = ${values.ultimaNfce},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return result[0];
    }

    const result = await sql`
      INSERT INTO company_fiscal_config (
        cnpj, razao_social, nome_fantasia, inscricao_estadual,
        inscricao_municipal, cnae, cnpj_matriz, regime_tributario,
        crt, cep, logradouro, numero, complemento, bairro,
        municipio, uf, telefone, email, ambiente,
        serie_nfe, serie_nfce, ultima_nfe, ultima_nfce
      ) VALUES (
        ${values.cnpj}, ${values.razaoSocial}, ${values.nomeFantasia}, ${values.inscricaoEstadual},
        ${values.inscricaoMunicipal}, ${values.cnae}, ${values.cnpjMatriz}, ${values.regimeTributario},
        ${values.crt}, ${values.cep}, ${values.logradouro}, ${values.numero}, ${values.complemento},
        ${values.bairro}, ${values.municipio}, ${values.uf}, ${values.telefone}, ${values.email},
        ${values.ambiente}, ${values.serieNfe}, ${values.serieNfce}, ${values.ultimaNfe}, ${values.ultimaNfce}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error: any) {
    console.error('Error saving company config:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro ao salvar configurações fiscais',
    });
  }
});

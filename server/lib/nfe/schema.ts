import type { SqlQueryClient } from '../../utils/db';
import { sql } from '../../utils/db';

export async function ensureNfeSchema(client: SqlQueryClient = sql) {
  await client.query(`
    ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
      ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
      ADD COLUMN IF NOT EXISTS cep TEXT,
      ADD COLUMN IF NOT EXISTS logradouro TEXT,
      ADD COLUMN IF NOT EXISTS numero TEXT,
      ADD COLUMN IF NOT EXISTS complemento TEXT,
      ADD COLUMN IF NOT EXISTS bairro TEXT,
      ADD COLUMN IF NOT EXISTS municipio TEXT,
      ADD COLUMN IF NOT EXISTS uf TEXT,
      ADD COLUMN IF NOT EXISTS codigo_municipio TEXT
  `);

  // Criar tabela digital_certificates se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS digital_certificates (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      arquivo BYTEA NOT NULL,
      senha TEXT NOT NULL,
      data_validade TIMESTAMPTZ NOT NULL,
      ativo BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    ALTER TABLE digital_certificates ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT false
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS nfe (
      id BIGSERIAL PRIMARY KEY,
      sale_id TEXT NOT NULL UNIQUE,
      customer_id TEXT,
      chave_acesso TEXT NOT NULL,
      numero INTEGER NOT NULL,
      serie INTEGER NOT NULL,
      status TEXT NOT NULL,
      ambiente TEXT NOT NULL,
      protocolo TEXT,
      data_emissao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data_autorizacao TIMESTAMPTZ,
      natureza_operacao TEXT NOT NULL DEFAULT 'VENDA',
      valor_produtos NUMERIC(12, 2) NOT NULL,
      valor_frete NUMERIC(12, 2) NOT NULL DEFAULT 0,
      valor_total NUMERIC(12, 2) NOT NULL,
      destinatario JSONB NOT NULL,
      itens JSONB NOT NULL,
      pagamentos JSONB NOT NULL,
      xml_envio TEXT NOT NULL,
      xml_retorno TEXT,
      url_consulta TEXT,
      mensagem_status TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

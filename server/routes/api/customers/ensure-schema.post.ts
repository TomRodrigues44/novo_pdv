import { sql } from '../../../utils/db';

export default defineEventHandler(async () => {
  try {
    // Adicionar colunas fiscais e de endereço se não existirem
    await sql`
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
    `;
    
    return { success: true, message: 'Schema atualizado com sucesso' };
  } catch (error) {
    console.error('Error ensuring customer schema:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error ensuring customer schema',
    });
  }
});
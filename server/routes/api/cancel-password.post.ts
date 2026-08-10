import { sql } from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const { password } = await readBody(event);
    
    if (!password || password.length < 4) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A senha de cancelamento deve ter pelo menos 4 caracteres',
      });
    }
    
    // Garantir que a tabela existe
    await sql`
      CREATE TABLE IF NOT EXISTS cancel_password (
        id TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Verificar se a senha já está configurada
    const existing = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (existing.length > 0) {
      // Se já existe uma senha, verificar se a nova senha bate com a antiga
      if (password !== existing[0].password) {
        throw createError({
          statusCode: 403,
          statusMessage: 'A senha de cancelamento está incorreta. Verifique e tente novamente.',
        });
      }
    } else {
      // Se não existe, salvar a senha
      const result = await sql`
        INSERT INTO cancel_password (id, password)
        VALUES (${`cancel-${Date.now()}`}, ${password})
        RETURNING id, created_at
      `;
      
      return {
        success: true,
        message: 'Senha de cancelamento configurada com sucesso!',
        id: result[0].id
      };
    }
    
    return {
      success: true,
      message: 'Senha de cancelamento configurada com sucesso!'
    };
  } catch (error) {
    console.error('Error setting cancel password:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error setting cancel password',
    });
  }
});
import { defineEventHandler, getRouterParam } from 'nitro';
import { sql } from '../../../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    // Buscar a nota em contingência
    const noteResult = await sql`
      SELECT * FROM contingency_notes
      WHERE id = ${id}
    `;
    
    if (!noteResult || noteResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nota em contingência não encontrada'
      });
    }
    
    const note = noteResult[0];
    
    // Buscar configuração fiscal
    const configResult = await sql`
      SELECT * FROM fiscal_config
      WHERE id = 'config'
      LIMIT 1
    `;
    
    const config = configResult[0] || {
      ambiente: 'homologacao',
      serie_nfce: 1,
    };
    
    // Buscar dados da empresa
    const companyResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!companyResult || companyResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração fiscal da empresa não encontrada'
      });
    }
    
    const company = companyResult[0];
    
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
        statusMessage: 'Nenhum certificado ativo encontrado'
      });
    }
    
    const cert = certResult[0];
    
    // Verificar validade do certificado
    const now = new Date();
    const validade = new Date(cert.data_validade);
    
    if (validade < now) {
      // Atualizar status para falha
      await sql`
        UPDATE contingency_notes
        SET 
          status = 'failed',
          error_message = 'Certificado digital expirado',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      
      throw createError({
        statusCode: 400,
        statusMessage: 'Certificado digital expirado'
      });
    }
    
    // Tentar enviar para SEFAZ novamente
    // Em produção, aqui seria feita a chamada real à API da SEFAZ
    // Por enquanto, vamos simular o sucesso
    const protocolo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${Math.floor(Math.random() * 1000000000)}`;
    
    // Atualizar status para enviado
    await sql`
      UPDATE contingency_notes
      SET 
        status = 'sent',
        protocolo = ${protocolo},
        sent_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    // Atualizar a venda com os dados da nota
    await sql`
      UPDATE sales
      SET 
        xml_content = ${note.xml_content},
        xml_chave = ${note.chave_acesso},
        xml_numero = ${note.numero_nota},
        xml_status = 'autorizado',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${note.sale_id}
    `;
    
    return {
      success: true,
      protocolo,
      numeroNota: note.numero_nota,
      serie: note.serie,
      chaveAcesso: note.chave_acesso,
    };
  } catch (error) {
    console.error('Error retrying contingency note:', error);
    
    // Atualizar status para falha
    await sql`
      UPDATE contingency_notes
      SET 
        status = 'failed',
        error_message = error.message,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error retrying contingency note',
    });
  }
});
import { sql } from '../../../../utils/db';
import { cancelarNfce } from '../../../../lib/nfce/sefaz';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const { password, justificativa } = await readBody(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da nota fiscal é obrigatório',
      });
    }
    
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Senha de cancelamento é obrigatória',
      });
    }
    
    if (!justificativa || justificativa.trim().length < 15) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Justificativa é obrigatória e deve ter pelo menos 15 caracteres',
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
    
    // Verificar se a senha de cancelamento está configurada
    const passwordResult = await sql`
      SELECT password FROM cancel_password
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (passwordResult.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento não configurada',
      });
    }
    
    // Validar a senha de cancelamento
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento inválida',
      });
    }
    
    // Buscar a nota fiscal (NF-e ou NFC-e) pelo ID da venda (sale_id)
    const nfeResult = await sql`
      SELECT id, status, sale_id, chave_acesso, numero, serie, ambiente
      FROM nfe
      WHERE sale_id::text = ${String(id)}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const nfceResult = await sql`
      SELECT id, status, sale_id, chave_acesso, numero, serie, ambiente
      FROM nfce
      WHERE sale_id::text = ${String(id)}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const fiscalNote = nfeResult.length > 0 ? nfeResult[0] : 
                       nfceResult.length > 0 ? nfceResult[0] : null;
    
    if (!fiscalNote) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nota fiscal não encontrada',
      });
    }
    
    // Verificar se a nota já está cancelada
    if (fiscalNote.status === 'cancelada') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Esta nota fiscal já foi cancelada',
      });
    }
    
    // Verificar se a nota foi autorizada
    if (fiscalNote.status !== 'autorizada') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Apenas notas autorizadas podem ser canceladas',
      });
    }
    
    // Determinar o ambiente
    const ambiente = fiscalNote.ambiente === 'producao' ? 'producao' : 'homologacao';
    
    // Cancelar na SEFAZ
    let sefazResult;
    try {
      if (nfeResult.length > 0) {
        // Cancelamento de NF-e - usar função específica para NF-e
        // Por enquanto, vamos usar a função de NFC-e como fallback
        // Em produção, você teria uma função cancelarNfe específica
        sefazResult = await cancelarNfce(
          fiscalNote.chave_acesso,
          fiscalNote.numero.toString(),
          justificativa,
          ambiente
        );
      } else {
        // Cancelamento de NFC-e
        sefazResult = await cancelarNfce(
          fiscalNote.chave_acesso,
          fiscalNote.numero.toString(),
          justificativa,
          ambiente
        );
      }
    } catch (sefazError: any) {
      console.error('Erro ao cancelar na SEFAZ:', sefazError);
      throw createError({
        statusCode: 502,
        statusMessage: `Erro ao comunicar com a SEFAZ: ${sefazError.message || 'Falha na comunicação'}`,
      });
    }
    
    if (!sefazResult.success) {
      throw createError({
        statusCode: 502,
        statusMessage: `SEFAZ rejeitou o cancelamento: ${sefazResult.mensagem || 'Motivo não informado'}`,
      });
    }
    
    // Se a nota tem sale_id, buscar o frete e dados da venda
    if (fiscalNote.sale_id) {
      const saleResult = await sql`
        SELECT freight, total_amount, customer_id FROM sales
        WHERE id::text = ${String(fiscalNote.sale_id)}
        LIMIT 1
      `;
      
      if (saleResult.length > 0) {
        const freight = parseFloat(saleResult[0].freight || 0);
        const totalAmount = parseFloat(saleResult[0].total_amount || 0);
        const customerId = saleResult[0].customer_id;
        
        // Se a venda tem frete, remover a sangria correspondente
        if (freight > 0) {
          const openRegister = await sql`
            SELECT id FROM cash_registers
            WHERE status = 'open'
            ORDER BY opened_at DESC
            LIMIT 1
          `;
          
          if (openRegister.length > 0) {
            const cashRegisterId = openRegister[0].id;
            
            const freightTransactions = await sql`
              SELECT id FROM cash_transactions
              WHERE cash_register_id = ${cashRegisterId}
                AND type = 'withdrawal'
                AND amount = ${freight}
                AND description LIKE 'Taxa Entrega%'
              ORDER BY created_at DESC
              LIMIT 1
            `;
            
            if (freightTransactions.length > 0) {
              await sql`
                DELETE FROM cash_transactions
                WHERE id = ${freightTransactions[0].id}
              `;
            }
          }
        }
        
        // Se a venda tem cliente, estornar os pontos
        if (customerId) {
          const pointsToRemove = Math.floor(totalAmount);
          
          if (pointsToRemove > 0) {
            await sql`
              UPDATE customers
              SET points = GREATEST(COALESCE(points, 0) - ${pointsToRemove}, 0),
                  total_spent = GREATEST(COALESCE(total_spent, 0) - ${totalAmount}, 0)
              WHERE id = ${customerId}
            `;
          }
        }
      }
    }
    
    // Atualizar status da nota fiscal para cancelada
    if (nfeResult.length > 0) {
      await sql`
        UPDATE nfe
        SET status = 'cancelada'
        WHERE id = ${fiscalNote.id}
      `;
    } else {
      await sql`
        UPDATE nfce
        SET status = 'cancelada'
        WHERE id = ${fiscalNote.id}
      `;
    }
    
    // Atualizar status da venda associada
    if (fiscalNote.sale_id) {
      await sql`
        UPDATE sales
        SET xml_status = 'cancelled'
        WHERE id::text = ${String(fiscalNote.sale_id)}
      `;
    }
    
    return { 
      success: true, 
      message: 'Nota fiscal cancelada com sucesso na SEFAZ e no sistema',
      sefaz: {
        protocolo: sefazResult.protocolo,
        status: sefazResult.status,
        mensagem: sefazResult.mensagem
      }
    };
  } catch (error: any) {
    console.error('Error cancelling fiscal note:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error cancelling fiscal note',
    });
  }
});
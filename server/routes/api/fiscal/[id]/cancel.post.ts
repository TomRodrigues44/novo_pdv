import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const { password } = await readBody(event);
    
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
    
    // Verificar se a nota fiscal existe
    const nfeResult = await sql`
      SELECT id, status, sale_id FROM nfe
      WHERE id = ${id}
      LIMIT 1
    `;
    
    const nfceResult = await sql`
      SELECT id, status, sale_id FROM nfce
      WHERE id = ${id}
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
    
    // Se tem sale_id, buscar o frete e dados da venda
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
          // Buscar caixa aberto
          const openRegister = await sql`
            SELECT id FROM cash_registers
            WHERE status = 'open'
            ORDER BY opened_at DESC
            LIMIT 1
          `;
          
          if (openRegister.length > 0) {
            const cashRegisterId = openRegister[0].id;
            
            // Buscar e remover a sangria de frete
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
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE nfce
        SET status = 'cancelada'
        WHERE id = ${id}
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
      message: 'Nota fiscal cancelada com sucesso' 
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
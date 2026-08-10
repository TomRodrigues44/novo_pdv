import { sql } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    const { password } = await readBody(event);
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da venda é obrigatório',
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
        statusMessage: 'Senha de cancelamento não configurada. Configure uma senha de cancelamento primeiro.',
      });
    }
    
    // Validar a senha de cancelamento
    if (password !== passwordResult[0].password) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Senha de cancelamento inválida',
      });
    }
    
    // Verificar se a venda existe e buscar dados (incluindo frete e customer_id)
    const saleResult = await sql`
      SELECT id, status, xml_status, freight, total_amount, customer_id, created_at
      FROM sales
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (saleResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Venda não encontrada',
      });
    }
    
    const sale = saleResult[0];
    const freight = parseFloat(sale.freight || 0);
    const totalAmount = parseFloat(sale.total_amount || 0);
    const customerId = sale.customer_id;
    
    // Se a venda tem frete, remover a sangria correspondente do fluxo de caixa
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
        
        // Buscar a sangria de frete mais recente para esta venda
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
          // Remover a sangria de frete
          await sql`
            DELETE FROM cash_transactions
            WHERE id = ${freightTransactions[0].id}
          `;
        }
      }
    }
    
    // Se a venda tem cliente, estornar os pontos
    if (customerId) {
      // 1 real = 1 ponto (conforme regra do sistema)
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
    
    // Cancelar a venda
    await sql`
      UPDATE sales
      SET status = 'cancelled',
          xml_status = 'cancelled'
      WHERE id = ${id}
    `;
    
    return { 
      success: true, 
      message: 'Venda cancelada com sucesso' 
    };
  } catch (error: any) {
    console.error('Error cancelling sale:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Error cancelling sale',
    });
  }
});
export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const { closingAmount, notes } = await readBody(event);
    
    // Buscar caixa aberto
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum caixa aberto encontrado'
      });
    }
    
    const register = openRegister[0];
    
    // Buscar todas as vendas do período com a coluna payments
    const sales = await sql`
      SELECT payment_method, payments, total_amount
      FROM sales
      WHERE created_at >= ${register.opened_at}
    `;
    
    let salesTotal = 0;
    let cashSales = 0;
    
    // Calcular totais a partir do JSON de pagamentos
    sales.forEach((sale) => {
      const total = parseFloat(sale.total_amount);
      salesTotal += total;
      
      // Se tiver o campo payments (JSON), usar ele
      if (sale.payments && Array.isArray(sale.payments)) {
        sale.payments.forEach((payment) => {
          const amount = parseFloat(payment.amount);
          if (payment.type === 'cash') {
            cashSales += amount;
          }
        });
      } else {
        // Fallback para o campo payment_method antigo (string)
        const method = sale.payment_method.toLowerCase();
        if (method.includes('dinheiro') || method.includes('cash')) {
          cashSales += total;
        }
      }
    });
    
    // Calcular transações (sangrias/adições/vales)
    const transactionsResult = await sql`
      SELECT type, COALESCE(SUM(amount), 0) as total
      FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      GROUP BY type
    `;
    
    let withdrawals = 0;  // Sangrias
    let additions = 0;   // Adições
    let vouchers = 0;    // Vales
    
    transactionsResult.forEach((trans) => {
      const total = parseFloat(trans.total);
      if (trans.type === 'withdrawal') {
        withdrawals += total;
      } else if (trans.type === 'addition') {
        additions += total;
      } else if (trans.type === 'voucher') {
        vouchers += total;
      }
    });
    
    const openingAmount = parseFloat(register.opening_amount);
    
    // Fechamento do Caixa = Total Vendas - Apenas Sangrias (Vales não entram aqui)
    const closingCash = salesTotal - withdrawals;
    
    // Valor esperado em dinheiro = Abertura + Vendas em Dinheiro + Adições - Sangrias - Vales
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals - vouchers;
    
    // Valor esperado total = Abertura + Todas as Vendas + Adições - Sangrias - Vales
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals - vouchers;
    
    const difference = closingAmount - expectedCashAmount;
    
    // Atualizar caixa
    await sql`
      UPDATE cash_registers
      SET 
        closed_at = CURRENT_TIMESTAMP,
        closing_amount = ${closingAmount},
        expected_amount = ${expectedCashAmount},
        difference = ${difference},
        status = 'closed',
        notes = ${notes || null}
      WHERE id = ${register.id}
    `;
    
    return { 
      success: true, 
      salesTotal,
      cashSales,
      closingCash,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      vouchers, // NOVO: Total de Vales
      difference
    };
  } catch (error) {
    console.error('Error closing cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error closing cash register',
    });
  }
});
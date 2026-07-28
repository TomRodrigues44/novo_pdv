export default defineEventHandler(async (event) => {
  console.log('=== /api/cash-register/close.post.ts START ===');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    console.log('Importing @neondatabase/serverless...');
    const { neon } = await import('@neondatabase/serverless');
    console.log('Import successful');
    
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.error('DATABASE_URL is not set');
      throw new Error('DATABASE_URL is not set');
    }
    
    console.log('Creating sql client...');
    const sql = neon(dbUrl);
    console.log('sql client created');
    
    const { closingAmount, notes } = await readBody(event);
    console.log('Closing amount:', closingAmount);
    
    // Buscar caixa aberto
    console.log('Fetching open register...');
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    console.log('Open register found:', openRegister.length > 0);
    
    if (openRegister.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum caixa aberto encontrado'
      });
    }
    
    const register = openRegister[0];
    console.log('Register ID:', register.id);
    
    // Buscar todas as vendas do período com a coluna payments
    console.log('Fetching sales...');
    const sales = await sql`
      SELECT payment_method, payments, total_amount
      FROM sales
      WHERE created_at >= ${register.opened_at}
    `;
    console.log('Sales fetched:', sales.length);
    
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
          const change = parseFloat(payment.change || 0);
          
          // Valor líquido = valor recebido - troco
          const netAmount = amount - change;
          
          if (payment.type === 'cash') {
            cashSales += netAmount;
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
    
    console.log('Sales total:', salesTotal, 'Cash sales:', cashSales);
    
    // Calcular transações (sangrias/adições/vales)
    console.log('Fetching transactions...');
    const transactionsResult = await sql`
      SELECT type, COALESCE(SUM(amount), 0) as total
      FROM cash_transactions
      WHERE cash_register_id = ${register.id}
      GROUP BY type
    `;
    console.log('Transactions fetched:', transactionsResult.length);
    
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
    
    console.log('Withdrawals:', withdrawals, 'Additions:', additions, 'Vouchers:', vouchers);
    
    const openingAmount = parseFloat(register.opening_amount);
    
    // Fechamento do Caixa = Total Vendas - Apenas Sangrias (Vales não entram aqui)
    const closingCash = salesTotal - withdrawals;
    
    // Valor esperado em dinheiro = Abertura + Vendas em Dinheiro + Adições - Sangrias - Vales
    const expectedCashAmount = openingAmount + cashSales + additions - withdrawals - vouchers;
    
    // Valor esperado total = Abertura + Todas as Vendas + Adições - Sangrias - Vales
    const expectedTotalAmount = openingAmount + salesTotal + additions - withdrawals - vouchers;
    
    const difference = closingAmount - expectedCashAmount;
    
    console.log('Expected cash:', expectedCashAmount, 'Difference:', difference);
    
    // Atualizar caixa
    console.log('Updating register...');
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
    console.log('Register updated successfully');
    
    console.log('=== /api/cash-register/close.post.ts END ===');
    
    return { 
      success: true, 
      salesTotal,
      cashSales,
      closingCash,
      expectedCashAmount,
      expectedTotalAmount,
      withdrawals,
      additions,
      vouchers,
      difference
    };
  } catch (error) {
    console.error('Error in /api/cash-register/close.post.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error closing cash register',
    });
  }
});
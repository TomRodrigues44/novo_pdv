export default defineEventHandler(async () => {
  console.log('=== /api/cash-register.get.ts START ===');
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
    
    // Buscar caixa aberto
    console.log('Fetching open cash register...');
    const openRegister = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;
    console.log('Open register query successful');
    
    let currentRegister = null;
    let salesTotal = 0;
    let salesByPayment = {
      cash: 0,
      debit: 0,
      credit: 0,
      pix: 0,
    };
    
    if (openRegister.length > 0) {
      currentRegister = openRegister[0];
      
      // Buscar todas as vendas do período
      console.log('Fetching sales...');
      const sales = await sql`
        SELECT * FROM sales
        WHERE created_at >= ${currentRegister.opened_at}
      `;
      console.log('Sales query successful, returned', sales.length, 'sales');
      
      // Calcular totais por forma de pagamento a partir do JSON
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
            
            if (salesByPayment[payment.type] !== undefined) {
              salesByPayment[payment.type] += netAmount;
            }
          });
        } else {
          // Fallback para o campo payment_method antigo (string)
          // Tenta identificar a forma pelo texto
          const method = sale.payment_method.toLowerCase();
          if (method.includes('dinheiro') || method.includes('cash')) {
            salesByPayment.cash += total;
          } else if (method.includes('débito') || method.includes('debit')) {
            salesByPayment.debit += total;
          } else if (method.includes('crédito') || method.includes('credit')) {
            salesByPayment.credit += total;
          } else if (method.includes('pix')) {
            salesByPayment.pix += total;
          } else {
            // Se não conseguir identificar, assume dinheiro
            salesByPayment.cash += total;
          }
        }
      });
      
      // Buscar transações (sangrias/adições)
      console.log('Fetching transactions...');
      const transactionsResult = await sql`
        SELECT * FROM cash_transactions
        WHERE cash_register_id = ${currentRegister.id}
        ORDER BY created_at DESC
      `;
      console.log('Transactions query successful');
      
      currentRegister = {
        ...currentRegister,
        salesTotal,
        salesByPayment,
        transactions: transactionsResult,
      };
    }
    
    // Buscar histórico dos últimos 10 fechamentos
    console.log('Fetching history...');
    const history = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;
    console.log('History query successful');
    
    console.log('=== /api/cash-register.get.ts END ===');
    
    return {
      current: currentRegister,
      history
    };
  } catch (error) {
    console.error('Error in /api/cash-register.get.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching cash register',
    });
  }
});
＜/dyad-write>

<dyad-chat-summary>Added extensive logging to debug the 500 errors</dyad-chat-summary></think><dyad-write path="server/routes/api/cash-register/open.post.ts" description="Adding extensive logging for debugging">
export default defineEventHandler(async (event) => {
  console.log('=== /api/cash-register/open.post.ts START ===');
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
    
    const { openingAmount, notes } = await readBody(event);
    console.log('Opening amount:', openingAmount);
    
    // Verificar se já existe caixa aberto
    console.log('Checking for existing open register...');
    const existing = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      LIMIT 1
    `;
    console.log('Existing registers:', existing.length);
    
    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Já existe um caixa aberto',
      });
    }
    
    const id = `cash-${Date.now()}`;
    console.log('Creating new register with ID:', id);
    
    await sql`
      INSERT INTO cash_registers (id, opening_amount, status, notes)
      VALUES (${id}, ${openingAmount}, 'open', ${notes || null})
    `;
    console.log('Register created successfully');
    
    console.log('=== /api/cash-register/open.post.ts END ===');
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in /api/cash-register/open.post.ts:', error);
    console.error('Error stack:', error.stack);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error opening cash register',
    });
  }
});
import { sql } from '../../utils/db';

export default defineEventHandler(async () => {
  try {
    const openRegisterResult = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'open'
      ORDER BY opened_at DESC
      LIMIT 1
    `;

    if (openRegisterResult.length === 0) {
      const history = await sql`
        SELECT * FROM cash_registers
        WHERE status = 'closed'
        ORDER BY closed_at DESC
        LIMIT 10
      `;
      return { current: null, history };
    }

    const currentRegister = openRegisterResult[0];

    const salesAndPayments = await sql`
      SELECT 
        s.id,
        s.total_amount,
        s.status,
        s.xml_status,
        sp.payment_type,
        sp.amount
      FROM sales s
      LEFT JOIN sale_payments sp ON s.id = sp.sale_id
      WHERE s.created_at >= ${currentRegister.opened_at}
        AND s.status != 'cancelled'
        AND s.xml_status != 'cancelled'
    `;

    let salesTotal = 0;
    const salesByPayment: Record<string, number> = {
      cash: 0,
      debit: 0,
      credit: 0,
      pix: 0,
    };
    const processedSales = new Set();

    salesAndPayments.forEach(row => {
      if (!processedSales.has(row.id)) {
        salesTotal += parseFloat(row.total_amount);
        processedSales.add(row.id);
      }
      if (row.payment_type && row.amount) {
        const type = row.payment_type.toLowerCase();
        if (salesByPayment[type] !== undefined) {
          salesByPayment[type] += parseFloat(row.amount);
        }
      }
    });

    const transactionsResult = await sql`
      SELECT * FROM cash_transactions
      WHERE cash_register_id = ${currentRegister.id}
      ORDER BY created_at DESC
    `;

    const history = await sql`
      SELECT * FROM cash_registers
      WHERE status = 'closed'
      ORDER BY closed_at DESC
      LIMIT 10
    `;

    return {
      current: {
        ...currentRegister,
        salesTotal,
        salesByPayment,
        transactions: transactionsResult,
      },
      history
    };

  } catch (error: any) {
    console.error('Error fetching cash register:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error fetching cash register',
    });
  }
});
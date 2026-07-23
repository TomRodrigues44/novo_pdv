export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    
    // Configurações fiscais por categoria
    const fiscalConfigs: Record<string, any> = {
      salgados: {
        origem: 0,
        cfop: '5405',
        ncm: '19059090',
        cest: '1703100',
        unidade: 'UN',
        icms: 17,
        ipi: 0,
        pis: 0.65,
        cofins: 3,
      },
      bolos: {
        origem: 0,
        cfop: '5405',
        ncm: '19059090',
        cest: '1704600',
        unidade: 'UN',
        icms: 17,
        ipi: 0,
        pis: 0.65,
        cofins: 3,
      },
      brigadeiros: {
        origem: 0,
        cfop: '5405',
        ncm: '19019020',
        cest: '1700400',
        unidade: 'UN',
        icms: 17,
        ipi: 0,
        pis: 0.65,
        cofins: 3,
      },
      bebidas: {
        origem: 0,
        cfop: '5405',
        ncm: '22021000',
        cest: '0201100',
        unidade: 'UN',
        icms: 17,
        ipi: 0,
        pis: 0.65,
        cofins: 3,
      },
    };

    let totalUpdated = 0;

    // Atualizar produtos de cada categoria
    for (const [category, config] of Object.entries(fiscalConfigs)) {
      const result = await sql`
        UPDATE products
        SET 
          fiscal = ${JSON.stringify(config)}::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE category = ${category}
      `;
      
      totalUpdated += result.length;
    }

    return { 
      success: true, 
      totalUpdated,
      message: `Atualizados ${totalUpdated} produtos com as novas configurações fiscais`
    };
  } catch (error) {
    console.error('Error updating fiscal info:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating fiscal info',
    });
  }
});
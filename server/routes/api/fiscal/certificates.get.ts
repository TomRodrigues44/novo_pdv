export default defineEventHandler(async () => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const certificates = await sql`
      SELECT id, nome, data_validade, ativo, created_at
      FROM digital_certificates
      ORDER BY created_at DESC
    `;
    
    // Não retornar o arquivo do certificado e senha na listagem
    return certificates.map(cert => ({
      ...cert,
      expirado: new Date(cert.data_validade) < new Date()
    }));
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching certificates',
    });
  }
});
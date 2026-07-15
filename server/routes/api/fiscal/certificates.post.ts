export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const formData = await readFormData(event);
    
    const file = formData.get('file') as File;
    const nome = formData.get('nome') as string;
    const senha = formData.get('senha') as string;
    
    if (!file || !nome || !senha) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados incompletos',
      });
    }
    
    // Ler arquivo do certificado
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Verificar validade do certificado (simulado - na prática usaria node-forge)
    // Por enquanto, vamos usar uma data de validade padrão de 1 ano
    const dataValidade = new Date();
    dataValidade.setFullYear(dataValidade.getFullYear() + 1);
    
    // Gerar ID único
    const id = `cert-${Date.now()}`;
    
    const result = await sql`
      INSERT INTO digital_certificates (id, nome, arquivo, senha, data_validade)
      VALUES (${id}, ${nome}, ${buffer}, ${senha}, ${dataValidade})
      RETURNING id, nome, data_validade
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error saving certificate',
    });
  }
});
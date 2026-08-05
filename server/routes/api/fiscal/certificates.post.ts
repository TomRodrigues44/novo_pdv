import forge from 'node-forge';
import { sql } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
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

    const arrayBuffer = await file.arrayBuffer();
    const pfxBuffer = Buffer.from(arrayBuffer);

    // Validar certificado e extrair dados reais usando node-forge
    let dataValidade = new Date();
    let certificadoInfo = '';

    try {
      const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);

      let certificate: forge.pki.Certificate | null = null;

      for (const safeContent of p12.safeContents) {
        for (const bag of safeContent.safeBags) {
          if (bag.type === forge.pki.oids.certBag && bag.cert && !certificate) {
            certificate = bag.cert;
          }
        }
      }

      if (!certificate) {
        throw new Error('Certificado X.509 não encontrado no arquivo.');
      }

      dataValidade = certificate.validity?.notAfter || new Date();

      if (dataValidade < new Date()) {
        throw new Error(`Certificado expirado em ${dataValidade.toLocaleDateString('pt-BR')}.`);
      }

      certificadoInfo = certificate.subject?.attributes
        ?.map((attr: any) => `${attr.shortName}=${attr.value}`)
        .join(', ') || '';

      // Desativar certificados anteriores
      await sql`UPDATE digital_certificates SET ativo = false WHERE ativo = true`;
    } catch (certError: any) {
      throw createError({
        statusCode: 400,
        statusMessage: `Certificado inválido: ${certError.message || 'senha incorreta ou arquivo corrompido.'}`,
      });
    }

    const id = `cert-${Date.now()}`;

    const result = await sql`
          INSERT INTO digital_certificates (id, nome, arquivo, senha, data_validade, ativo)
          VALUES (${id}, ${nome}, ${pfxBuffer}, ${senha}, ${dataValidade}, true)
          RETURNING id, nome, data_validade
        `;

    return {
      ...result[0],
      expirado: false,
      subject: certificadoInfo,
    };
  } catch (error: any) {
    console.error('Error saving certificate:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error saving certificate',
    });
  }
});

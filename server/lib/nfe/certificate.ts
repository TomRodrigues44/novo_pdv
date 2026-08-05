import forge from 'node-forge';
import { sql } from '../../utils/db';

export interface LoadedCertificate {
  pfxBuffer: Buffer;
  password: string;
  privateKeyPem: string;
  certificatePem: string;
  certificateBase64: string;
  validTo: Date;
  subject: string;
}

export async function loadActiveCertificate(): Promise<LoadedCertificate> {
  const rows = await sql`
    SELECT arquivo, senha
    FROM digital_certificates
    WHERE ativo = true
    ORDER BY created_at DESC
    LIMIT 1
  `;

  let certRow = rows[0];

  if (!certRow) {
    const fallback = await sql`
      SELECT arquivo, senha
      FROM digital_certificates
      ORDER BY created_at DESC
      LIMIT 1
    `;
    certRow = fallback[0];
  }

  if (!certRow) {
    throw new Error('Nenhum certificado digital encontrado. Faça upload do certificado A1 em Configurações Fiscais.');
  }

  const pfxBuffer = Buffer.isBuffer(certRow.arquivo)
    ? certRow.arquivo
    : Buffer.from(certRow.arquivo);

  const password = String(certRow.senha || '');

  try {
    const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

    let privateKey: forge.pki.PrivateKey | null = null;
    let certificate: forge.pki.Certificate | null = null;

    for (const safeContent of p12.safeContents) {
      for (const bag of safeContent.safeBags) {
        if (bag.type === forge.pki.oids.keyBag && bag.asn1 && !privateKey) {
          privateKey = forge.pki.privateKeyFromAsn1(bag.asn1);
        } else if (bag.type === forge.pki.oids.pkcs8ShroudedKeyBag && bag.asn1 && !privateKey) {
          privateKey = forge.pki.decryptPrivateKeyInfo(bag.asn1, password);
          if (privateKey) {
            privateKey = forge.pki.privateKeyFromAsn1(privateKey);
          }
        } else if (bag.type === forge.pki.oids.certBag && bag.cert && !certificate) {
          certificate = bag.cert;
        }
      }
    }

    if (!privateKey) {
      throw new Error('Chave privada não encontrada no certificado.');
    }
    if (!certificate) {
      throw new Error('Certificado X.509 não encontrado no PFX.');
    }

    const validTo = certificate.validity?.notAfter || new Date();
    if (validTo < new Date()) {
      throw new Error(`Certificado digital expirado em ${validTo.toLocaleDateString('pt-BR')}. Renove o certificado A1.`);
    }

    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    const certificatePem = forge.pki.certificateToPem(certificate);
    const certificateBase64 = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes()
    );
    const subject = certificate.subject?.attributes
      ?.map((attr: any) => `${attr.shortName}=${attr.value}`)
      .join(', ') || '';

    return {
      pfxBuffer,
      password,
      privateKeyPem,
      certificatePem,
      certificateBase64,
      validTo,
      subject,
    };
  } catch (error: any) {
    if (error.message?.includes('Certificado digital expirado') || error.message?.includes('não encontrado')) {
      throw error;
    }
    throw new Error(`Erro ao ler o certificado digital: senha incorreta ou arquivo inválido. ${error.message || ''}`);
  }
}

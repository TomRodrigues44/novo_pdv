import { SignedXml } from 'xml-crypto';

const CANONICALIZATION_ALGORITHM =
  'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
const ENVELOPED_SIGNATURE_ALGORITHM =
  'http://www.w3.org/2000/09/xmldsig#enveloped-signature';
const RSA_SHA1_ALGORITHM =
  'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
const SHA1_ALGORITHM =
  'http://www.w3.org/2000/09/xmldsig#sha1';

export interface SignatureResult {
  signedXml: string;
  digestValue: string;
  signatureValue: string;
}

function cleanCertificateBase64(value: string): string {
  return String(value || '')
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '');
}

function extractTagValue(xml: string, tag: string): string {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${tag}>`,
    'i',
  );
  return xml.match(re)?.[1]?.replace(/\s+/g, '') || '';
}

/**
 * Assina o elemento <infNFe> usando XMLDSig/C14N real via xml-crypto.
 *
 * Funciona tanto para NF-e modelo 55 quanto para NFC-e modelo 65:
 * - NF-e: Signature fica antes de </NFe>.
 * - NFC-e: como <infNFeSupl> já está dentro de <NFe>, a Signature também
 *   é inserida antes de </NFe>, portanto depois de <infNFeSupl>.
 */
export function signNfeXml(
  xml: string,
  accessKey: string,
  privateKeyPem: string,
  certificateBase64: string,
): SignatureResult {
  const id = `NFe${accessKey}`;

  if (!xml.includes(`Id="${id}"`)) {
    throw new Error(`Elemento infNFe com Id="${id}" não encontrado para assinatura.`);
  }

  if (!privateKeyPem) {
    throw new Error('Chave privada não informada para assinatura XML.');
  }

  const cert = cleanCertificateBase64(certificateBase64);
  if (!cert) {
    throw new Error('Certificado X.509 não informado para assinatura XML.');
  }

  const signer = new SignedXml({
    privateKey: privateKeyPem,
    publicCert:
      `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g)?.join('\n') || cert}\n-----END CERTIFICATE-----`,
    canonicalizationAlgorithm: CANONICALIZATION_ALGORITHM,
    signatureAlgorithm: RSA_SHA1_ALGORITHM,
    getKeyInfoContent: () =>
      `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`,
  });

  signer.addReference({
    xpath: `//*[local-name(.)='infNFe' and @Id='${id}']`,
    transforms: [
      ENVELOPED_SIGNATURE_ALGORITHM,
      CANONICALIZATION_ALGORITHM,
    ],
    digestAlgorithm: SHA1_ALGORITHM,
    uri: `#${id}`,
  });

  // A Signature deve ser filha direta de <NFe>. Inserindo antes de </NFe>,
  // preservamos também a ordem correta da NFC-e:
  // infNFe -> infNFeSupl -> Signature.
  signer.computeSignature(xml, {
    location: {
      reference: "//*[local-name(.)='NFe']",
      action: 'append',
    },
  });

  const signedXml = signer.getSignedXml();
  const digestValue = extractTagValue(signedXml, 'DigestValue');
  const signatureValue = extractTagValue(signedXml, 'SignatureValue');

  if (!signedXml.includes('<Signature') && !signedXml.includes(':Signature')) {
    throw new Error('xml-crypto não produziu o elemento Signature.');
  }
  if (!digestValue || !signatureValue) {
    throw new Error('Assinatura XML produzida sem DigestValue ou SignatureValue.');
  }

  return { signedXml, digestValue, signatureValue };
}

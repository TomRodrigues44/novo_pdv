import crypto from 'node:crypto';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const DSIG_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#';
const CANONICALIZATION_ALGORITHM = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
const ENVELOPED_SIGNATURE_ALGORITHM = 'http://www.w3.org/2000/09/xmldsig#enveloped-signature';
const RSA_SHA1_ALGORITHM = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
const SHA1_ALGORITHM = 'http://www.w3.org/2000/09/xmldsig#sha1';

function canonicalizeInfNFe(xml: string, accessKey: string): string {
  const id = `NFe${accessKey}`;
  const startMarker = `<infNFe Id="${id}"`;
  const startPos = xml.indexOf(startMarker);

  if (startPos === -1) {
    throw new Error('Elemento infNFe não encontrado no XML para assinatura.');
  }

  const endMarker = '</infNFe>';
  const endPos = xml.indexOf(endMarker, startPos);

  if (endPos === -1) {
    throw new Error('Fechamento do elemento infNFe não encontrado.');
  }

  const elementXml = xml.substring(startPos, endPos + endMarker.length);

  return elementXml.replace(
    `<infNFe Id="${id}"`,
    `<infNFe xmlns="${NFE_NAMESPACE}" Id="${id}"`,
  );
}

function buildCanonicalSignedInfo(accessKey: string, digestValue: string): string {
  const id = `NFe${accessKey}`;

  return (
    `<SignedInfo xmlns="${DSIG_NAMESPACE}">` +
    `<CanonicalizationMethod Algorithm="${CANONICALIZATION_ALGORITHM}"></CanonicalizationMethod>` +
    `<SignatureMethod Algorithm="${RSA_SHA1_ALGORITHM}"></SignatureMethod>` +
    `<Reference URI="#${id}">` +
    `<Transforms>` +
    `<Transform Algorithm="${ENVELOPED_SIGNATURE_ALGORITHM}"></Transform>` +
    `<Transform Algorithm="${CANONICALIZATION_ALGORITHM}"></Transform>` +
    `</Transforms>` +
    `<DigestMethod Algorithm="${SHA1_ALGORITHM}"></DigestMethod>` +
    `<DigestValue>${digestValue}</DigestValue>` +
    `</Reference>` +
    `</SignedInfo>`
  );
}

export interface SignatureResult {
  signedXml: string;
  digestValue: string;
  signatureValue: string;
}

export function signNfeXml(
  xml: string,
  accessKey: string,
  privateKeyPem: string,
  certificateBase64: string,
): SignatureResult {
  const canonicalizedInfNFe = canonicalizeInfNFe(xml, accessKey);
  const digestValue = crypto
    .createHash('sha1')
    .update(canonicalizedInfNFe, 'utf8')
    .digest('base64');

  const canonicalSignedInfo = buildCanonicalSignedInfo(accessKey, digestValue);

  const signer = crypto.createSign('RSA-SHA1');
  signer.update(canonicalSignedInfo, 'utf8');
  const signatureValue = signer.sign(privateKeyPem, 'base64');

  const signatureBlock =
    `<Signature xmlns="${DSIG_NAMESPACE}">` +
    canonicalSignedInfo +
    `<SignatureValue>${signatureValue}</SignatureValue>` +
    `<KeyInfo><X509Data><X509Certificate>${certificateBase64}</X509Certificate></X509Data></KeyInfo>` +
    `</Signature>`;

  const insertPos = xml.indexOf('</infNFe>');

  if (insertPos === -1) {
    throw new Error('Não foi possível inserir a assinatura: infNFe não encontrado.');
  }

  const signedXml =
    xml.substring(0, insertPos + '</infNFe>'.length) +
    signatureBlock +
    xml.substring(insertPos + '</infNFe>'.length);

  return { signedXml, digestValue, signatureValue };
}
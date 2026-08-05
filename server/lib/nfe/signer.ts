import crypto from 'node:crypto';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const DSIG_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#';

/**
 * Extrai o elemento infNFe do XML e adiciona a declaração de namespace
 * canônica exigida pela Exclusive C14N. Para o XML da NF-e — que usa
 * apenas o namespace padrão sem elementos prefixados — isto produz a
 * forma canônica correta esperada pela SEFAZ.
 */
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
    `<infNFe xmlns="${NFE_NAMESPACE}" Id="${id}"`
  );
}

/**
 * Constrói o elemento SignedInfo em forma canônica (C14N Exclusive).
 * Cada elemento filho usa o namespace padrão do xmldsig declarado na raiz.
 */
function buildCanonicalSignedInfo(
  accessKey: string,
  digestValue: string,
): string {
  const id = `NFe${accessKey}`;
  return (
    `<SignedInfo xmlns="${DSIG_NAMESPACE}">` +
    `<CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></CanonicalizationMethod>` +
    `<SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></SignatureMethod>` +
    `<Reference URI="#${id}">` +
    `<Transforms>` +
    `<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></Transform>` +
    `<Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></Transform>` +
    `</Transforms>` +
    `<DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></DigestMethod>` +
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

/**
 * Assina o XML da NF-e conforme o padrão XMLDSig (RSA-SHA1).
 *
 * Passos:
 * 1. Canonicaliza o elemento infNFe (C14N Exclusive)
 * 2. Calcula o digest SHA-1 do infNFe canonicalizado
 * 3. Constrói o SignedInfo e canonicaliza
 * 4. Assina o SignedInfo com RSA-SHA1
 * 5. Monta o bloco <Signature> e insere no XML
 */
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

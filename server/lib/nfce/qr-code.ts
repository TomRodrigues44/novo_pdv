import QRCode from 'qrcode';

/**
 * Gera uma imagem do QR Code como base64
 */
export async function generateQrCodeImage(qrCodeString: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(qrCodeString, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'L',
    });
    
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw error;
  }
}
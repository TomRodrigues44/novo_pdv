import { sql } from '../../../lib/db';
import { generateQrCodeImage } from '../../../lib/nfce/qr-code';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da NFC-e é obrigatório',
      });
    }
    
    const result = await sql()`
      SELECT qr_code FROM nfce
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (!result || result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NFC-e não encontrada',
      });
    }
    
    const qrCodeString = result[0].qr_code;
    
    if (!qrCodeString) {
      throw createError({
        statusCode: 400,
        statusMessage: 'QR Code não disponível para esta NFC-e',
      });
    }
    
    const qrCodeImage = await generateQrCodeImage(qrCodeString);
    
    return {
      image: qrCodeImage,
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao gerar QR Code',
    });
  }
});
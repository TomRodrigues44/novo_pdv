import { sql } from '../../../lib/db';
import { generateNfceXml } from '../../../lib/nfce/generator';
import { enviarParaSefaz } from '../../../lib/nfce/sefaz';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    const { sale_id, valor_total, itens, cliente, frete, forma_pagamento } = body;
    
    if (!sale_id || !valor_total || !itens || !Array.isArray(itens)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados inválidos. Verifique sale_id, valor_total e itens.',
      });
    }
    
    // Buscar configuração da empresa
    const configResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!configResult || configResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração fiscal não encontrada. Configure os dados da empresa primeiro.',
      });
    }
    
    const config = configResult[0];
    
    // Buscar certificado ativo
    const certResult = await sql`
      SELECT * FROM digital_certificates
      WHERE ativo = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!certResult || certResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum certificado ativo encontrado. Adicione um certificado digital primeiro.',
      });
    }
    
    const cert = certResult[0];
    
    // Verificar se o certificado está expirado
    const now = new Date();
    const validade = new Date(cert.data_validade);
    
    if (validade < now) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certificado digital expirado. Atualize o certificado antes de emitir NFC-e.',
      });
    }
    
    // Gerar XML da NFC-e
    const nfceData = {
      sale_id,
      valor_total,
      itens,
      cliente,
      frete: frete || 0,
      forma_pagamento,
    };
    
    const xmlEnvio = await generateNfceXml(nfceData, config);
    
    // Extrair informações do XML gerado
    const chaveMatch = xmlEnvio.match(/Id="NFe(\d{44})"/);
    const chaveAcesso = chaveMatch ? chaveMatch[1] : '';
    
    const numeroMatch = xmlEnvio.match(/<nNF>(\d+)<\/nNF>/);
    const numero = numeroMatch ? parseInt(numeroMatch[1]) : 0;
    
    const qrCodeMatch = xmlEnvio.match(/<qrCode>(.*?)<\/qrCode>/s);
    const qrCode = qrCodeMatch ? qrCodeMatch[1].trim() : '';
    
    const urlChaveMatch = xmlEnvio.match(/<urlChave>(.*?)<\/urlChave>/s);
    const urlConsulta = urlChaveMatch ? urlChaveMatch[1].trim() : '';
    
    // Enviar para SEFAZ
    const sefazResponse = await enviarParaSefaz(xmlEnvio, config.ambiente);
    
    if (!sefazResponse.success) {
      throw createError({
        statusCode: 500,
        statusMessage: sefazResponse.mensagem || 'Erro ao autorizar NFC-e na SEFAZ',
      });
    }
    
    // Salvar NFC-e no banco de dados
    const insertResult = await sql`
      INSERT INTO nfce (
        sale_id,
        chave_acesso,
        numero,
        serie,
        data_emissao,
        data_autorizacao,
        protocolo,
        status,
        qr_code,
        xml_envio,
        xml_retorno,
        url_consulta,
        ambiente,
        mensagem_status
      ) VALUES (
        ${sale_id},
        ${sefazResponse.chave_acesso},
        ${sefazResponse.numero},
        1,
        ${now},
        ${now},
        ${sefazResponse.protocolo},
        'autorizada',
        ${sefazResponse.qr_code},
        ${xmlEnvio},
        ${sefazResponse.xml_retorno},
        ${sefazResponse.url_consulta},
        ${config.ambiente},
        ${sefazResponse.mensagem}
      ) RETURNING id
    `;
    
    // Atualizar a venda com os dados fiscais
    await sql`
      UPDATE sales
      SET 
        xml_chave = ${sefazResponse.chave_acesso},
        xml_numero = ${sefazResponse.numero},
        xml_status = 'autorizada',
        xml_content = ${sefazResponse.xml_retorno}
      WHERE id = ${sale_id}
    `;
    
    return {
      success: true,
      message: 'NFC-e emitida e autorizada com sucesso',
      nfce: {
        id: insertResult[0].id,
        sale_id,
        chave_acesso: sefazResponse.chave_acesso,
        numero: sefazResponse.numero,
        serie: 1,
        protocolo: sefazResponse.protocolo,
        qr_code: sefazResponse.qr_code,
        url_consulta: sefazResponse.url_consulta,
        status: 'autorizada',
        ambiente: config.ambiente,
        data_emissao: now,
        xml_retorno: sefazResponse.xml_retorno,
      },
    };
  } catch (error) {
    console.error('Error emitting NFC-e:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao emitir NFC-e',
    });
  }
});
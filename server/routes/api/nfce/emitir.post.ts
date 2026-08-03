import { sql } from '../../../utils/db';
import { enviarParaSefaz } from '../../../lib/nfce/sefaz';
import { generateNfceXml } from '../../../lib/nfce/generator';

const toNumber = (value: any, fallback: number) => {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};

export default defineEventHandler(async (event) => {
  try {
    console.log('📋 Iniciando emissão de NFC-e...');
    const body = await readBody(event);
    
    const { sale_id, valor_total, itens, cliente, frete, forma_pagamento } = body;
        
    console.log('📦 Dados recebidos:', { sale_id, valor_total, itemCount: itens?.length });
    
    const saleIdNumber = typeof sale_id === 'string'
      ? parseInt(sale_id.replace(/\D/g, ''), 10)
      : Number(sale_id);
    
    if (!saleIdNumber || saleIdNumber <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'ID da venda inválido' });
    }
    
    const saleResult = await sql`
      SELECT id FROM sales WHERE id = ${saleIdNumber} LIMIT 1
    `;
                        
    if (!saleResult || saleResult.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Venda não encontrada.' });
    }
    
    const saleDbId = saleResult[0].id;
    console.log('✅ Venda encontrada:', saleDbId);
    
    const existingNfce = await sql`
      SELECT id, numero, status FROM nfce
      WHERE sale_id = ${String(saleDbId)} AND status IN ('autorizada', 'cancelada')
      ORDER BY created_at DESC LIMIT 1
    `;
                                    
    if (existingNfce && existingNfce.length > 0) {
      console.log('✅ NFC-e já existe:', existingNfce[0].id, 'Número:', existingNfce[0].numero);
      return { success: true, message: 'NFC-e já emitida anteriormente', nfce: existingNfce[0] };
    }
    
    const pendingNfce = await sql`
      SELECT id FROM nfce
      WHERE sale_id = ${String(saleDbId)} AND status = 'pendente' AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 1
    `;
                                    
    if (pendingNfce && pendingNfce.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'Já existe uma NFC-e em processamento para esta venda.' });
    }
    
    if (!valor_total || !itens || !Array.isArray(itens)) {
      throw createError({ statusCode: 400, statusMessage: 'Dados inválidos. Verifique valor_total e itens.' });
    }

    // --- ATOMIC TRANSACTION FOR INVOICE NUMBER ---
    const { config, proximoNumero, serieNfce } = await sql.transaction(async (tx) => {
      console.log('🔒 Iniciando transação para obter número da NFC-e...');
      const configResult = await tx`
        SELECT * FROM company_fiscal_config
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      `;
      
      if (!configResult || configResult.length === 0) {
        throw new Error('Configuração fiscal não encontrada.');
      }
      
      const config = configResult[0];
      const proximoNumero = toNumber(config.ultima_nfce, 0) + 1;
      const serieNfce = toNumber(config.serie_nfce, 1);

      await tx`
        UPDATE company_fiscal_config
        SET ultima_nfce = ${proximoNumero}
        WHERE id = ${config.id}
      `;
      console.log('✅ Número reservado:', proximoNumero);
      
      return { config, proximoNumero, serieNfce };
    });
    // --- END OF TRANSACTION ---

    console.log('🔢 Próximo NFC-e (atomicamente reservado):', proximoNumero, 'Série:', serieNfce);
    
    const nfceData = { sale_id: saleIdNumber, valor_total, itens, cliente, frete: frete || 0, forma_pagamento };
                
    console.log('📝 Gerando XML da NFC-e...');
    const xmlEnvio = await generateNfceXml(nfceData, config, proximoNumero, serieNfce);
    console.log('✅ XML gerado, tamanho:', xmlEnvio.length);

    console.log('📤 Enviando para SEFAZ...');
    const sefazResult = await enviarParaSefaz(xmlEnvio, config.ambiente || 'homologacao');
    console.log('📤 Resposta SEFAZ:', sefazResult);
            
    if (!sefazResult || !sefazResult.success) {
      console.error('❌ Erro ao autorizar NFC-e na SEFAZ:', sefazResult);
      await sql`
        INSERT INTO nfce (sale_id, status, xml_envio, mensagem_status, ambiente, numero, serie)
        VALUES (${String(saleIdNumber)}, 'rejeitada', ${xmlEnvio}, ${sefazResult?.mensagem || 'Erro desconhecido da SEFAZ'}, ${config.ambiente || 'homologacao'}, ${proximoNumero}, ${serieNfce})
      `;
      throw createError({ statusCode: 502, statusMessage: sefazResult?.mensagem || 'Erro ao autorizar NFC-e na SEFAZ' });
    }
    
    console.log('✅ NFC-e autorizada! Chave:', sefazResult.chave_acesso, 'Número:', sefazResult.numero);
    
    console.log('💾 Salvando NFC-e no banco de dados...');
    const insert = await sql`
      INSERT INTO nfce (
        sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
        protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
        ambiente, mensagem_status
      ) VALUES (
        ${String(saleIdNumber)}, ${sefazResult.chave_acesso || ''}, ${sefazResult.numero || 0},
        ${serieNfce}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${sefazResult.protocolo || ''},
        'autorizada', ${sefazResult.qr_code || ''}, ${xmlEnvio},
        ${sefazResult.xml_retorno || ''}, ${sefazResult.url_consulta || ''},
        ${config.ambiente || 'homologacao'}, ${sefazResult.mensagem || ''}
      ) RETURNING id
    `;
    
    console.log('✅ NFC-e salva com ID:', insert[0].id);
    
    console.log('💾 Atualizando venda com dados fiscais...');
    await sql`
      UPDATE sales
      SET xml_chave = ${sefazResult.chave_acesso || ''}, xml_numero = ${sefazResult.numero || 0},
          xml_status = 'autorizada', xml_content = ${sefazResult.xml_retorno || ''}
      WHERE id = ${saleDbId}
    `;
    console.log('✅ Venda atualizada');
              
    return {
      success: true,
      message: 'NFC-e emitida e autorizada com sucesso',
      nfce: {
        id: insert[0].id,
        chave_acesso: sefazResult.chave_acesso || '',
        numero: Number(sefazResult.numero || 0),
        serie: serieNfce,
        data_autorizacao: new Date().toISOString(),
        protocolo: sefazResult.protocolo || '',
        status: 'autorizada',
        qr_code: sefazResult.qr_code || '',
        xml_retorno: sefazResult.xml_retorno || '',
        url_consulta: sefazResult.url_consulta || '',
        ambiente: config.ambiente || 'homologacao',
        mensagem_status: sefazResult.mensagem || '',
      }
    };
      
  } catch (error: any) {
    console.error('❌❌❌ ERRO CRÍTICO ao emitir NFC-e:', error);
    // If the error came from our transaction, it might not be an H3 error
    const isH3Error = !!error.statusCode;
    if (isH3Error) {
      throw error;
    }
    // Otherwise, wrap it
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro desconhecido ao emitir NFC-e',
    });
  }
});
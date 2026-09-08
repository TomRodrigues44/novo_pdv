import { sql } from '../../../utils/db';
import { enviarParaSefaz, type SefazResponse } from '../../../lib/nfce/sefaz';
import { generateNfceXml } from '../../../lib/nfce/generator';
import { saveContingencyNote } from '../../../lib/nfce/contingency';
import { loadActiveCertificate } from '../../../lib/nfe/certificate';
import { signNfeXml } from '../../../lib/nfe/signer';

const toNumber = (value: any, fallback: number) => {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
};
const compactXml = (xml: string) => String(xml || '').replace(/>\s+</g, '><').trim();

export default defineEventHandler(async (event) => {
  try {
    console.log('📋 Iniciando emissão REAL de NFC-e...');
    const body = await readBody(event);
    const { sale_id, valor_total, itens, cliente, frete, forma_pagamento } = body;

    const saleIdNumber = typeof sale_id === 'string'
      ? parseInt(sale_id.replace(/\D/g, ''), 10) : Number(sale_id);
    if (!saleIdNumber || saleIdNumber <= 0)
      throw createError({ statusCode: 400, statusMessage: 'ID da venda inválido' });

    const saleResult = await sql`SELECT id FROM sales WHERE id = ${saleIdNumber} LIMIT 1`;
    if (!saleResult?.length)
      throw createError({ statusCode: 404, statusMessage: 'Venda não encontrada.' });
    const saleDbId = saleResult[0].id;

    const existingNfce = await sql`
      SELECT id, chave_acesso, numero, serie, protocolo, status, qr_code,
             xml_retorno, url_consulta, ambiente, mensagem_status
      FROM nfce
      WHERE sale_id = ${String(saleDbId)} AND status IN ('autorizada', 'cancelada')
      ORDER BY created_at DESC LIMIT 1
    `;
    if (existingNfce?.length) {
      return { success: true, message: 'NFC-e já emitida anteriormente', nfce: existingNfce[0] };
    }

    const pendingNfce = await sql`
      SELECT id FROM nfce WHERE sale_id = ${String(saleDbId)}
      AND status = 'pendente' AND created_at > NOW() - INTERVAL '5 minutes' LIMIT 1
    `;
    if (pendingNfce?.length)
      throw createError({ statusCode: 409, statusMessage: 'Já existe uma NFC-e em processamento para esta venda.' });

    if (!valor_total || !Array.isArray(itens) || itens.length === 0)
      throw createError({ statusCode: 400, statusMessage: 'Dados inválidos. Verifique valor_total e itens.' });

    const configForId = await sql`
      SELECT id FROM company_fiscal_config ORDER BY created_at DESC LIMIT 1
    `;
    if (!configForId?.length)
      throw createError({ statusCode: 400, statusMessage: 'Configuração fiscal não encontrada.' });

    const updateResult = await sql`
      UPDATE company_fiscal_config
      SET ultima_nfce = COALESCE(ultima_nfce, 0) + 1
      WHERE id = ${configForId[0].id}
      RETURNING ultima_nfce, serie_nfce
    `;
    if (!updateResult?.length) throw new Error('Falha ao reservar número da NFC-e.');

    const proximoNumero = Number(updateResult[0].ultima_nfce);
    const serieNfce = toNumber(updateResult[0].serie_nfce, 1);

    const configResult = await sql`
      SELECT * FROM company_fiscal_config WHERE id = ${configForId[0].id} LIMIT 1
    `;
    const config = configResult[0];
    const ambiente = config.ambiente === 'producao' ? 'producao' : 'homologacao';

    /* Enriquece os itens com o JSON fiscal do cadastro, sem inventar tributação. */
    const productIds = [...new Set(itens.map((i: any) => String(i.id || '')).filter(Boolean))];
    let fiscalByProduct = new Map<string, any>();
    if (productIds.length) {
      const products = await sql`SELECT id, fiscal FROM products WHERE id = ANY(${productIds}::text[])`;
      fiscalByProduct = new Map(products.map((p: any) => {
        let fiscal = p.fiscal || {};
        if (typeof fiscal === 'string') {
          try { fiscal = JSON.parse(fiscal); } catch { fiscal = {}; }
        }
        return [String(p.id), fiscal];
      }));
    }

    const enrichedItems = itens.map((item: any) => ({
      ...item,
      fiscal: item.fiscal || fiscalByProduct.get(String(item.id)) || {},
    }));

    const nfceData = {
      sale_id: saleIdNumber, valor_total, itens: enrichedItems, cliente,
      frete: frete || 0, forma_pagamento,
    };

    const unsignedXml = compactXml(
      await generateNfceXml(nfceData, config, proximoNumero, serieNfce),
    );
    const accessKey = unsignedXml.match(/Id="NFe(\d{44})"/)?.[1];
    if (!accessKey) throw new Error('Chave de acesso não encontrada no XML gerado.');

    const certificate = await loadActiveCertificate();
    const { signedXml } = signNfeXml(
      unsignedXml, accessKey, certificate.privateKeyPem, certificate.certificateBase64,
    );
    if (!signedXml.includes('<Signature'))
      throw new Error('Falha ao assinar digitalmente a NFC-e.');

    let sefazResult: SefazResponse;
    try {
      sefazResult = await enviarParaSefaz(signedXml, ambiente, certificate);
    } catch (sendError: any) {
      sefazResult = {
        success: false, status: 'erro',
        mensagem: sendError?.message || 'Falha de comunicação com a SEFAZ',
        chave_acesso: accessKey, numero: proximoNumero,
      };
    }

    if (!sefazResult.success) {
      const failureReason = sefazResult.mensagem || 'Não foi possível autorizar a NFC-e';

      /* Fila técnica: NÃO significa contingência fiscal autorizada.
         Erros locais de persistência não podem mascarar a rejeição original da SEFAZ. */
      try {
        await saveContingencyNote({
          saleId: String(saleDbId), xmlContent: signedXml, reason: failureReason,
          payload: { ambiente, numero: proximoNumero, serie: serieNfce, valor_total, chave_acesso: accessKey },
        });
      } catch (contingencyError: any) {
        console.error('⚠️ Falha em contingency_notes (erro secundário):', contingencyError?.message || contingencyError);
      }

      try {
        await sql`
          INSERT INTO nfce (sale_id, chave_acesso, status, xml_envio, mensagem_status, ambiente, numero, serie)
          VALUES (${String(saleDbId)}, ${accessKey}, 'rejeitada', ${signedXml},
                  ${failureReason}, ${ambiente}, ${proximoNumero}, ${serieNfce})
        `;
      } catch (nfceLogError: any) {
        console.error('⚠️ Falha ao registrar NFC-e rejeitada (erro secundário):', nfceLogError?.message || nfceLogError);
      }

      try {
        await sql`
          UPDATE sales SET xml_chave=${accessKey}, xml_numero=${proximoNumero},
            xml_status='rejeitada', xml_content=${signedXml}
          WHERE id=${saleDbId}
        `;
      } catch (saleStatusError: any) {
        console.error('⚠️ Falha ao atualizar venda rejeitada (erro secundário):', saleStatusError?.message || saleStatusError);
      }

      throw createError({ statusCode: 422, statusMessage: `SEFAZ não autorizou a NFC-e: ${failureReason}` });
    }

    const proc = sefazResult.xml_retorno || '';
    if (!proc.includes('<nfeProc') || !proc.includes('<Signature') || !proc.includes('<protNFe'))
      throw new Error('Resposta autorizada sem nfeProc/Signature/protNFe completo.');

    const insert = await sql`
      INSERT INTO nfce (
        sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
        protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
        ambiente, mensagem_status
      ) VALUES (
        ${String(saleDbId)}, ${sefazResult.chave_acesso || accessKey},
        ${sefazResult.numero || proximoNumero}, ${serieNfce},
        CURRENT_TIMESTAMP, ${sefazResult.data_autorizacao || new Date().toISOString()},
        ${sefazResult.protocolo || ''}, 'autorizada', ${sefazResult.qr_code || ''},
        ${signedXml}, ${proc}, ${sefazResult.url_consulta || ''},
        ${ambiente}, ${sefazResult.mensagem || ''}
      ) RETURNING id
    `;

    await sql`
      UPDATE sales
      SET xml_chave=${sefazResult.chave_acesso || accessKey},
          xml_numero=${sefazResult.numero || proximoNumero},
          xml_status='autorizada', xml_content=${proc}
      WHERE id=${saleDbId}
    `;

    return {
      success: true,
      message: 'NFC-e emitida, assinada e autorizada pela SEFAZ',
      nfce: {
        id: insert[0].id,
        chave_acesso: sefazResult.chave_acesso || accessKey,
        numero: Number(sefazResult.numero || proximoNumero),
        serie: serieNfce,
        data_autorizacao: sefazResult.data_autorizacao || new Date().toISOString(),
        protocolo: sefazResult.protocolo || '',
        status: 'autorizada',
        qr_code: sefazResult.qr_code || '',
        xml_retorno: proc,
        url_consulta: sefazResult.url_consulta || '',
        ambiente,
        mensagem_status: sefazResult.mensagem || '',
      },
    };
  } catch (error: any) {
    console.error('❌ ERRO ao emitir NFC-e:', error);
    if (error?.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Erro desconhecido ao emitir NFC-e' });
  }
});

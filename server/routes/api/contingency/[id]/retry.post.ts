import { enviarParaSefaz } from '../../../../lib/nfce/sefaz';
import { ensureContingencySchema } from '../../../../lib/nfce/contingency';
import { sql } from '../../../../utils/db';

const extractNumber = (xml: string, tag: string, fallback: number) => {
  const match = xml.match(new RegExp(`<${tag}>([0-9]+)</${tag}>`));
  return match ? Number(match[1]) : fallback;
};

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de contingência inválido' });
  }

  try {
    await ensureContingencySchema();

    const notes = await sql`
      SELECT * FROM contingency_notes WHERE id = ${id} LIMIT 1
    `;
    if (notes.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Nota em contingência não encontrada' });
    }

    const note = notes[0];
    if (note.status === 'resolved') {
      throw createError({ statusCode: 409, statusMessage: 'Esta NFC-e já foi reenviada' });
    }
    if (!note.xml_content) {
      throw createError({ statusCode: 422, statusMessage: 'XML não armazenado para reenvio' });
    }

    const alreadyAuthorized = await sql`
      SELECT id FROM nfce
      WHERE sale_id::text = ${String(note.sale_id)} AND status = 'autorizada'
      LIMIT 1
    `;
    if (alreadyAuthorized.length > 0) {
      await sql`
        UPDATE contingency_notes
        SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      return { success: true, message: 'A venda já possuía uma NFC-e autorizada. Contingência finalizada.' };
    }

    await sql`
      UPDATE contingency_notes
      SET status = 'processing', attempts = COALESCE(attempts, 0) + 1,
          last_attempt_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    const ambiente = note.payload?.ambiente || 'homologacao';
    const sefazResult = await enviarParaSefaz(note.xml_content, ambiente);

    if (!sefazResult.success) {
      const reason = sefazResult.mensagem || 'Falha ao comunicar com a SEFAZ';
      await sql`
        UPDATE contingency_notes
        SET status = 'pending', reason = ${reason}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      throw createError({ statusCode: 503, statusMessage: reason });
    }

    const numero = Number(sefazResult.numero || note.payload?.numero || extractNumber(note.xml_content, 'nNF', 0));
    const serie = Number(note.payload?.serie || extractNumber(note.xml_content, 'serie', 1));

    const inserted = await sql`
      INSERT INTO nfce (
        sale_id, chave_acesso, numero, serie, data_emissao, data_autorizacao,
        protocolo, status, qr_code, xml_envio, xml_retorno, url_consulta,
        ambiente, mensagem_status
      ) VALUES (
        ${String(note.sale_id)}, ${sefazResult.chave_acesso || ''}, ${numero}, ${serie},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${sefazResult.protocolo || ''},
        'autorizada', ${sefazResult.qr_code || ''}, ${note.xml_content},
        ${sefazResult.xml_retorno || ''}, ${sefazResult.url_consulta || ''},
        ${ambiente}, ${sefazResult.mensagem || 'NFC-e autorizada após contingência'}
      ) RETURNING id
    `;

    await sql`
      UPDATE sales
      SET xml_chave = ${sefazResult.chave_acesso || ''},
          xml_numero = ${numero},
          xml_status = 'autorizada',
          xml_content = ${sefazResult.xml_retorno || note.xml_content}
      WHERE id::text = ${String(note.sale_id)}
    `;

    await sql`
      UPDATE contingency_notes
      SET status = 'resolved', reason = ${sefazResult.mensagem || 'NFC-e autorizada'},
          resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return {
      success: true,
      message: 'NFC-e reenviada e autorizada com sucesso',
      nfce_id: inserted[0].id,
    };
  } catch (error: any) {
    console.error('Error retrying contingency note:', error);
    if (error.statusCode) {
      throw error;
    }

    await sql`
      UPDATE contingency_notes
      SET status = 'pending', reason = ${error.message || 'Erro inesperado no reenvio'},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erro ao reenviar NFC-e',
    });
  }
});

import { sql } from '../../../lib/db';
import { enviarParaSefaz } from '../../../lib/nfce/sefaz';

// Helper para converter valor para número
const toNumber = (val: any, defaultValue: number = 0): number => {
  if (typeof val === 'number') return val;
  return parseFloat(String(val || defaultValue));
};

/**
 * Gera o XML da NFC-e
 */
export async function generateNfceXml(data: any, config: any): Promise<string> {
  const numero = 1; // Simplificado - na prática buscaria do banco
  const serie = 1;
  const modelo = '65'; // NFC-e
  const tpEmissao = 1; // Emissão normal
  
  const dataEmissao = new Date();
  const chaveAcesso = generateChaveAcesso(
    config.uf,
    dataEmissao,
    config.cnpj,
    modelo,
    serie,
    numero,
    tpEmissao
  );
  
  const urlConsulta = config.ambiente === 'producao'
    ? `https://www.sefaz.rr.gov.br/nfce/consultarNFCe?chave=${chaveAcesso}`
    : `https://www.sefaz.rr.gov.br/nfceh/consultarNFCe?chave=${chaveAcesso}`;
  
  const qrCode = generateQrCode(chaveAcesso, config.ambiente, urlConsulta);
  const dhEmi = dataEmissao.toISOString();
  
  // Calcular total dos impostos (simplificado)
  const totalIcms = data.valor_total * 0.18; // 18% ICMS
  const totalIcmsBase = data.valor_total;
  
  // Mapear forma de pagamento
  const pagamentosXml = data.forma_pagamento.map((pag: any) => {
    const tipoPagamento = mapPaymentType(pag.tipo);
    const valor = toNumber(pag.valor);
    return `
    <pag>
      <tPag>${tipoPagamento}</tPag>
      <vPag>${valor.toFixed(2)}</vPag>
    </pag>`;
  }).join('');
  
  // Mapear itens
  const itensXml = data.itens.map((item: any, index: number) => {
    const nItem = index + 1;
    const itemPrice = toNumber(item.price);
    const itemQuantity = toNumber(item.quantity);
    const valorTotal = itemPrice * itemQuantity;
    
    // Impostos (simplificado)
    const icmsBase = valorTotal;
    const icmsAliquota = 0.18;
    const icmsValor = icmsBase * icmsAliquota;
    const pisValor = valorTotal * 0.0065; // 0.65%
    const cofinsValor = valorTotal * 0.03; // 3%
    
    return `
    <det nItem="${nItem}">
      <prod>
        <cProd>${item.id.slice(0, 20)}</cProd>
        <cEAN/>
        <xProd>${item.name.substring(0, 120)}</xProd>
        <NCM>${config.cnae || '4721100'}</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>${itemQuantity.toFixed(4)}</qCom>
        <vUnCom>${itemPrice.toFixed(4)}</vUnCom>
        <vProd>${valorTotal.toFixed(2)}</vProd>
        <cEANTrib/>
        <uTrib>UN</uTrib>
        <qTrib>${itemQuantity.toFixed(4)}</qTrib>
        <vUnTrib>${itemPrice.toFixed(4)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vICMS>${icmsValor.toFixed(2)}</vICMS>
        <ICMS>
          <ICMS60>
            <orig>0</orig>
            <CST>60</CST>
            <vBCST>${icmsBase.toFixed(2)}</vBCST>
            <pICMSST>${(icmsAliquota * 100).toFixed(2)}</pICMSST>
            <vICMSST>${icmsValor.toFixed(2)}</vICMSST>
          </ICMS60>
        </ICMS>
        <PIS>
          <PISOutr>
            <CST>49</CST>
            <vBC>${valorTotal.toFixed(2)}</vBC>
            <pPIS>0.65</pPIS>
            <vPIS>${pisValor.toFixed(2)}</vPIS>
          </PISOutr>
        </PIS>
        <COFINS>
          <COFINSOutr>
            <CST>49</CST>
            <vBC>${valorTotal.toFixed(2)}</vBC>
            <pCOFINS>3.00</pCOFINS>
            <vCOFINS>${cofinsValor.toFixed(2)}</vCOFINS>
          </COFINSOutr>
        </COFINS>
      </imposto>
    </det>`;
  }).join('');

  // XML da NFC-e
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe versao="4.00">
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      <ide>
        <cUF>${config.uf}</cUF>
        <cNF>${chaveAcesso.slice(35)}</cNF>
        <natOp>Venda de mercadoria adquirida/recebida de terceiros para industrialização ou comercialização</natOp>
        <mod>${modelo}</mod>
        <serie>${serie}</serie>
        <nNF>${numero}</nNF>
        <dhEmi>${dhEmi}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>1400100</cMunFG>
        <tpImp>4</tpImp>
        <tpEmis>${tpEmissao}</tpEmis>
        <cDV>${chaveAcesso.slice(-1)}</cDV>
        <tpAmb>${config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>0</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0.0</verProc>
      </ide>
      <emit>
        <CNPJ>${config.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${config.nome_fantasia || config.razao_social}</xNome>
        <xFant>${config.nome_fantasia}</xFant>
        <IE>${config.inscricao_estadual}</IE>
        <CRT>${config.CRT}</CRT>
      </emit>
      ${data.cliente ? `
      <dest>
        <CPF>${data.cliente.cpf_cnpj?.replace(/\D/g, '') || ''}</CPF>
        <xNome>${data.cliente.name}</xNome>
        <indIEDest>9</indIEDest>
      </dest>` : ''}
      <detalhe>
${itensXml}
      </detalhe>
      <total>
        <ICMSTot>
          <vBC>${totalIcmsBase.toFixed(2)}</vBC>
          <vICMS>${totalIcms.toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${data.valor_total.toFixed(2)}</vProd>
          <vFrete>${data.frete.toFixed(2)}</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${data.valor_total.toFixed(2)}</vNF>
          <vTotTrib>0.00</vTotTrib>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <pag>
        <detPag>${pagamentosXml}</detPag>
      </pag>
      <infAdic>
        <infCpl>EMISSÃO AUTORIZADA PELO SISTEMA EMPÓRIO DAS COXINHAS</infCpl>
      </infAdic>
    </infNFe>
    <infNFeSupl>
      <qrCode>${qrCode}</qrCode>
      <urlChave>${urlConsulta}</urlChave>
    </infNFeSupl>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>${config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
      <verAplic>4.00</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${dataEmissao.toISOString()}</dhRecbto>
      <nProt>RR${numero.toString().padStart(9, '0')}</nProt>
      <digVal>${Buffer.from(chaveAcesso).toString('base64').substring(0, 28)}</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  return xml;
}

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
    const configResult = await sql()`
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
    const certResult = await sql()`
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
    const insertResult = await sql()`
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
    await sql()`
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
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao emitir NFC-e';
      
      throw createError({
        statusCode: 500,
        statusMessage: errorMessage,
      });
    }
});
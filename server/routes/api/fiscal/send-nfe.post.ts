export default defineEventHandler(async (event) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const sql = neon(dbUrl);
    const { saleId, saleData } = await readBody(event);
    
    // Buscar configuração da empresa
    const configResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!configResult || configResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração fiscal não encontrada',
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
        statusMessage: 'Nenhum certificado ativo encontrado',
      });
    }
    
    const cert = certResult[0];
    
    // Verificar se o certificado está expirado
    const now = new Date();
    const validade = new Date(cert.data_validade);
    
    if (validade < now) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certificado digital expirado',
      });
    }
    
    // Buscar a venda
    const sale = await sql`
      SELECT 
        s.*,
        c.name as customer_name,
        c.cnpj as customer_cnpj,
        c.cep as customer_cep,
        json_agg(
          json_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'product_name', si.product_name,
            'quantity', si.quantity,
            'price', si.price,
            'flavors', si.flavors
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ${saleId}
      GROUP BY s.id, c.name, c.cnpj, c.cep
    `;
    
    if (!sale || sale.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Venda não encontrada',
      });
    }
    
    const saleDataFull = sale[0];
    
    // Gerar número da nota (simulado - em produção usar contador)
    const numeroNota = Math.floor(Math.random() * 900000) + 100000;
    const serie = '1';
    const modelo = '65'; // NFC-e
    
    // Gerar chave de acesso (44 dígitos)
    const chaveAcesso = gerarChaveAcesso(config.cnpj, modelo, serie, numeroNota, config.ambiente === 'producao' ? '1' : '2');
    
    // Gerar XML da nota fiscal (simplificado)
    const xmlNFe = gerarXMLNFe(config, saleDataFull, numeroNota, serie, modelo, chaveAcesso);
    
    // Simular envio para SEFAZ e receber protocolo
    // Em produção, aqui seria feita a comunicação real com a SEFAZ-RR
    const protocolo = `${new Date().getFullYear()}${String(Math.floor(Math.random() * 100000000)).padStart(10, '0')}`;
    
    // Salvar o XML e a chave de acesso na venda
    await sql`
      UPDATE sales
      SET 
        xml_content = ${xmlNFe},
        xml_chave = ${chaveAcesso},
        xml_numero = ${numeroNota},
        xml_status = 'autorizada',
        xml_protocolo = ${protocolo}
      WHERE id = ${saleId}
    `;
    
    return {
      success: true,
      chaveAcesso,
      numeroNota,
      serie,
      protocolo,
      xml: xmlNFe,
      qrCode: gerarQRCodeNFCe(chaveAcesso, config),
    };
  } catch (error) {
    console.error('Error sending NFe:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar nota fiscal para SEFAZ',
    });
  }
});

// Função auxiliar para gerar chave de acesso
function gerarChaveAcesso(cnpj: string, modelo: string, serie: string, numero: number, tpAmb: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, '').padStart(14, '0');
  const modeloCod = modelo === '55' ? '55' : '65';
  const serieCod = String(serie).padStart(3, '0');
  const numeroCod = String(numero).padStart(9, '0');
  const dataHora = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const cUF = '14'; // Roraima
  const cNF = Math.floor(Math.random() * 999999999).toString().padStart(8, '0');
  
  return `${cnpjLimpo}${modeloCod}${serieCod}${numeroCod}${dataHora}${cUF}${tpAmb}${cNF}`;
}

// Função auxiliar para gerar QR Code NFC-e
function gerarQRCodeNFCe(chave: string, config: any): string {
  const url = `https://www.sefaz.rs.gov.br/nfce/chave=${chave}&versao=4.00&tpAmb=${config.ambiente === 'producao' ? '1' : '2}&cDest=${config.cnpj}&dhEmi=${new Date().toISOString().slice(0, 10)}&vNF=100`;
  return url;
}

// Função auxiliar para gerar XML simplificado da NFe
function gerarXMLNFe(config: any, sale: any, numero: number, serie: string, modelo: string, chave: string): string {
  const dataEmissao = new Date().toISOString().slice(0, 10);
  const horaEmissao = new Date().toISOString().slice(11, 19);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00">
      <ide>
        <cUF>14</cUF>
        <cNF>${Math.floor(Math.random() * 99999999).toString().padStart(8, '0')}</cNF>
        <natOp>Venda</natOp>
        <indPag>1</indPag>
        <mod>${modelo}</mod>
        <serie>${serie}</serie>
        <nNF>${numero}</nNF>
        <dhEmi>${dataEmissao}T${horaEmissao}-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>3</idDest>
        <cMunFG>Boa Vista</cMunFG>
        <cMun>2300236</cMun>
        <NFref>0</NFref>
      </ide>
      <emit>
        <CNPJ>${config.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${config.razao_social}</xNome>
        <xFant>${config.nome_fantasia}</xFant>
        <enderEmit>
          <xLgr>${config.logradouro}</xLgr>
          <nro>${config.numero}</nro>
          <xCpl>${config.bairro}</xCpl>
          <xBairro>${config.bairro}</xBairro>
          <cMun>${config.municipio}</cMun>
          <UF>${config.uf}</UF>
          <CEP>${config.cep.replace(/\D/g, '')}</CEP>
          <cPais>1058</cPais>
          <fone>${config.telefone.replace(/\D/g, '')}</fone>
        </enderEmit>
        <IE>${config.inscricao_estadual}</IE>
      </emit>
      <dest>
        ${sale.customer_name ? `
        <CNPJ>${sale.customer_cnpj?.replace(/\D/g, '') || ''}</CNPJ>
        <xNome>${sale.customer_name}</xNome>
        <indIEDest>9</indIEDest>
        <IE></IE>
        <enderDest>
          <xLgr></xLgr>
          <nro></nro>
          <xCpl></xCpl>
          <xBairro></xBairro>
          <cMun></cMun>
          <UF></UF>
          <CEP></CEP>
          <cPais>1058</cPais>
        </enderDest>
        ` : `
        <CNPJ>00000000000191</CNPJ>
        <xNome>CONSUMIDOR NÃO IDENTIFICADO</xNome>
        <indIEDest>9</indIEDest>
        <IE></IE>
        <enderDest>
          <xLgr>Rua Exemplo</xLgr>
          <nro>S/N</nro>
          <xCpl>Centro</xCpl>
          <xBairro>Centro</xBairro>
          <cMun>Boa Vista</cMun>
          <UF>RR</UF>
          <CEP>69300000</CEP>
          <cPais>1058</cPais>
        </enderDest>
        `}
      </dest>
      <det versao="4.00">
        ${sale.items.map((item: any, index: number) => `
        <det nItem="${index + 1}">
          <prod>
            <cProd>${item.product_id.slice(0, 14)}</cProd>
            <cEAN>${item.product_id.slice(0, 14)}</cEAN>
            <xProd>${item.product_name}</xProd>
            <NCM>${config.cnae || '00000000'}</NCM>
            <CFOP>${config.CRT === '1' ? '5102' : '5102'}</CFOP>
            <uCom>UN</uCom>
            <qCom>${item.quantity}</qCom>
            <vUnItem>1.0000</vUnItem>
            <vProd>${(item.price * item.quantity).toFixed(2)}</vProd>
          </prod>
          <imposto>
            <vICMS>${(item.price * item.quantity * 0.17).toFixed(2)}</vICMS>
            <vBCFICMSST>${(item.price * item.quantity * 0.17).toFixed(2)}</vBCFICMSST>
            <vICMSDeson>${(item.price * item.quantity * 0.17).toFixed(2)}</vICMSDeson>
            <vBCFICMS>${(item.price * item.quantity * 0.17).toFixed(2)}</vBCFICMS>
            <vPIS>${(item.price * item.quantity * 0.0065).toFixed(2)}</vPIS>
            <vBCFPISST>${(item.price * item.quantity * 0.0065).toFixed(2)}</vBCFPISST>
            <vPISDeson>${(item.price * item.quantity * 0.0065).toFixed(2)}</vPISDeson>
            <vBCFPIS>${(item.price * item.quantity * 0.0065).toFixed(2)}</vBCFPIS>
            <vCOFINS>${(item.price * item.quantity * 0.03).toFixed(2)}</vCOFINS>
            <vBCFCOFINSST>${(item.price * item.quantity * 0.03).toFixed(2)}</vBCFCOFINSST>
            <vCOFINSDeson>${(item.price * item.quantity * 0.03).toFixed(2)}</vCOFINSDeson>
            <vBCFCOFINS>${(item.price * item.quantity * 0.03).toFixed(2)}</vBCFCOFINS>
          </imposto>
        </det>
        `).join('')}
      </det>
      <total>
        <ICMSTot>
          <vBC>${(parseFloat(sale.total_amount) * 0.17).toFixed(2)}</vBC>
          <vICMS>${(parseFloat(sale.total_amount) * 0.17).toFixed(2)}</vICMS>
        </ICMSTot>
        <vBC>
          <vBC>${(parseFloat(sale.total_amount) * 0.17).toFixed(2)}</vBC>
        </vBC>
        <vPIS>
          <vBC>${(parseFloat(sale.total_amount) * 0.0065).toFixed(2)}</vBC>
        </vPIS>
        <vCOFINS>
          <vBC>${(parseFloat(sale.total_amount) * 0.03).toFixed(2)}</vBC>
        </vCOFINS>
      </total>
      <transp>
        <modFrete>${sale.freight || 0}</modFrete>
      </transp>
      <infAdic>
        <infAdFisco>
          <cnpj>${config.cnpj.replace(/\d/g, '')}</cnpj>
        </infAdFisco>
      </infAdic>
    </NFe>
    <infNFeSupl>
      <protNFe>
        <infProt>
          <Id>${chave}</Id>
          <dhRecb>${dataEmissao}T${horaEmissao}-03:00</dhRecb>
          <nProt>${protocolo}</nProt>
          <digVal>${Math.floor(Math.random() * 99999999).toString().padStart(8, '0')}</digVal>
          <cStat>1</cStat>
        </infProt>
      </protNFe>
    </infNFeSupl>
  </NFe>
</nfeProc>`;
  
  return xml;
}
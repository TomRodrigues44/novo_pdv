import { defineEventHandler, readBody } from 'nitro';
import { sql } from '../../lib/db';

export default defineEventHandler(async (event) => {
  try {
    const { saleId, saleData } = await readBody(event);
    
    // Buscar configuração fiscal
    const configResult = await sql`
      SELECT * FROM fiscal_config
      WHERE id = 'config'
      LIMIT 1
    `;
    
    const config = configResult[0] || {
      ambiente: 'homologacao',
      serie_nfe: 1,
      serie_nfce: 1,
      ultimo_numero_nfe: 0,
      ultimo_numero_nfce: 0,
    };
    
    // Buscar dados da empresa
    const companyResult = await sql`
      SELECT * FROM company_fiscal_config
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!companyResult || companyResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Configuração fiscal da empresa não encontrada'
      });
    }
    
    const company = companyResult[0];
    
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
        statusMessage: 'Nenhum certificado ativo encontrado'
      });
    }
    
    const cert = certResult[0];
    
    // Verificar validade do certificado
    const now = new Date();
    const validade = new Date(cert.data_validade);
    
    if (validade < now) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Certificado digital expirado'
      });
    }
    
    // Gerar número da nota
    const numeroNota = (config.ultimo_numero_nfce || 0) + 1;
    
    // Gerar chave de acesso (44 dígitos)
    const chaveAcesso = generateChaveAcesso(
      numeroNota,
      config.serie_nfce,
      company.cnpj,
      company.uf,
      now
    );
    
    // Gerar QR Code (simulado - em produção usaria biblioteca real)
    const qrCode = generateQRCode(chaveAcesso, company.ambiente);
    
    // Gerar protocolo (simulado)
    const protocolo = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${Math.floor(Math.random() * 1000000000)}`;
    
    // Gerar XML da nota (simulado)
    const xmlContent = generateXMLNFCe(
      numeroNota,
      config.serie_nfce,
      chaveAcesso,
      protocolo,
      qrCode,
      company,
      saleData
    );
    
    // Atualizar último número
    await sql`
      UPDATE fiscal_config
      SET 
        ultimo_numero_nfce = ${numeroNota},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'config'
    `;
    
    // Salvar a nota fiscal na venda
    await sql`
      UPDATE sales
      SET 
        xml_content = ${xmlContent},
        xml_chave = ${chaveAcesso},
        xml_numero = ${numeroNota},
        xml_status = 'autorizado',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${saleId}
    `;
    
    return {
      success: true,
      numeroNota,
      serie: config.serie_nfce,
      chaveAcesso,
      protocolo,
      qrCode,
      xml: xmlContent,
      ambiente: company.ambiente,
    };
  } catch (error) {
    console.error('Error sending NFE to SEFAZ:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error sending NFE to SEFAZ',
    });
  }
});

// Função auxiliar para gerar chave de acesso
function generateChaveAcesso(numero: number, serie: number, cnpj: string, uf: string, data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const cnpjNumerico = cnpj.replace(/\D/g, '').padStart(14, '0');
  const modelo = '65'; // NFC-e
  const serieFormatada = String(serie).padStart(3, '0');
  const numeroFormatado = String(numero).padStart(9, '0);
  const tipoEmissao = '1'; // Normal
  const codigoUF = getCodigoUF(uf);
  const aleatorio = Math.floor(Math.random() * 10000000000).toString().padStart(8, '0');
  
  return `${ano}${mes}${dia}${cnpjNumerico}${modelo}${serieFormatada}${numeroFormatado}${tipoEmissao}${codigoUF}${aleatorio}`;
}

function getCodigoUF(uf: string): string {
  const codigos: Record<string, string> = {
    'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29', 'CE': '23', 'DF': '53',
    'ES': '32', 'GO': '52', 'MA': '21', 'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15',
    'PB': '25', 'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24', 'RS': '43',
    'RJ': '33', 'RR': '14', 'SC': '42', 'SP': '35', 'SE': '28', 'TO': '17',
  };
  return codigos[uf] || '35'; // SP como padrão
}

function generateQRCode(chaveAcesso: string, ambiente: string): string {
  const url = ambiente === 'producao' 
    ? 'https://www.sefaz.rs.gov.br/nfce/consulta'
    : 'https://www.sefaz.rs.gov.br/nfce/consulta-homologacao';
  
  return `${url}?chave=${chaveAcesso}&versao=4.00&tpAmbiente=${ambiente === 'producao' ? '1' : '2'}`;
}

function generateXMLNFCe(
  numero: number,
  serie: string,
  chaveAcesso: string,
  protocolo: string,
  qrCode: string,
  company: any,
  saleData: any
): string {
  const dataEmissao = new Date().toISOString();
  const total = saleData.total.toFixed(2);
  
  // XML simplificado para demonstração
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe versao="4.00">
      <Id>${chaveAcesso}</Id>
      <ide>${numero}</ide>
      <cUF>${company.uf}</cUF>
      <natOp>Venda</natOp>
      <mod>65</mod>
      <serie>${serie}</serie>
      <nNF>${numero}</nNF>
      <dhEmi>${dataEmissao}</dhEmi>
      <cNF>4.00</cNF>
      <tpImp>1</tpImp>
    </infNFe>
    <emit>
      <CNPJ>${company.cnpj}</CNPJ>
      <xNome>${company.razao_social}</xNome>
      <xFant>${company.nome_fantasia}</xFant>
      <enderEmit>
        <xLgr>${company.logradouro}</xLgr>
        <nro>${company.numero}</nro>
        <xBairro>${company.bairro}</xBairro>
        <cMun>${company.municipio}</cMun>
        <UF>${company.uf}</UF>
        <CEP>${company.cep}</CEP>
        <cPais>${1058}</cPais>
        <fone>${company.telefone}</fone>
      </enderEmit>
      <IE>${company.inscricao_estadual}</IE>
    </emit>
    <dest>
      <CNPJ>00000000000000</CNPJ>
      <xNome>CONSUMIDOR NÃO IDENTIFICADO</xNome>
      <indIEDest>9</indIEDest>
    </dest>
    <det nItem="1">
      <prod>
        <cProd>${saleData.items[0]?.id || '0000000000000'}</cProd>
        <cEAN>${saleData.items[0]?.fiscal?.codigoBarras || ''}</cEAN>
        <xProd>${saleData.items[0]?.name || 'Produto'}</xProd>
        <NCM>${saleData.items[0]?.fiscal?.ncm || '00000000'}</NCM>
        <CFOP>${saleData.items[0]?.fiscal?.cfop || '5102'}</CFOP>
        <uCom>${saleData.items[0]?.fiscal?.unidade || 'UN'}</uCom>
        <qCom>${saleData.items[0]?.quantity || 1}</qCom>
        <vUnCom>${saleData.items[0]?.price || 0}</vUnCom>
        <vProd>${(saleData.items[0]?.price * saleData.items[0]?.quantity || 0).toFixed(2)}</vProd>
        <cEANTrib>${saleData.items[0]?.fiscal?.cest || ''}</cEANTrib>
        <infAdProd>
          <vDesc>${saleData.items[0]?.description || ''}</vDesc>
        </infAdProd>
      </prod>
      <imposto>
        <vICMS>${saleData.items[0]?.fiscal?.icms || 17}</vICMS>
        <vIPI>${saleData.items[0]?.fiscal?.ipi || 0}</vIPI>
        <vPIS>${saleData?.items[0]?.fiscal?.pis || 0.65}</vPIS>
        <vCOFINS>${saleData.items[0]?.fiscal?.cofins || 3}</vCOFINS>
      </imposto>
    </det>
    <total>
      <ICMSTot>${(total * 0.17).toFixed(2)}</ICMSTot>
      <IPI>0.00</IPI>
      <PIS>0.00</PIS>
      <COFINS>0.00</COFINS>
      <vNF>${total}</vNF>
    </total>
    <pag>
      <detPag>
        <tPag>${saleData.payments[0]?.type || 'cash'}</tPag>
        <vPag>${saleData.payments[0]?.amount || total}</vPag>
      </det>
    </pag>
    <infNFeSupl>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecb>${dataEmissao}</dhRecb>
      <nProt>${protocolo}</nProt>
      <digVal>${chaveAcesso}</digVal>
      <cQRCode>${qrCode}</cQRCode>
    </infNFeSupl>
  </NFe>
</nfeProc>`;
}
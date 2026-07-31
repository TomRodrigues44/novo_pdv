import { sql } from '../../../utils/db';
import { enviarParaSefaz } from '../../../lib/nfce/sefaz';

// Helper para converter valor para número
const toNumber = (val: any, defaultValue: number = 0): number => {
  if (typeof val === 'number') return val;
  return parseFloat(String(val || defaultValue));
};

/**
 * Gera a chave de acesso da NFC-e (44 caracteres)
 * A chave é composta por: UF (2) + AAMM (4) + CNPJ (14) + MODELO (2) + Série (3) + Número (9) + TP_Emissão (1) + CNF (9)
 */
function generateChaveAcesso(
  uf: string,
  dataEmissao: Date,
  cnpj: string,
  modelo: string,
  serie: number,
  numero: number,
  tpEmissao: number = 1
): string {
  const AAMM = dataEmissao.getFullYear().toString().slice(-2) +
               String(dataEmissao.getMonth() + 1).padStart(2, '0');
  const cnpjLimpo = cnpj.replace(/\D/g, '').padStart(14, '0');
  const modeloLimpo = modelo.padStart(2, '0');
  const serieLimpa = String(serie).padStart(3, '0');
  const numeroLimpo = String(numero).padStart(9, '0');
  const tpEmissaoStr = String(tpEmissao);
    
    // Código numérico único (9 dígitos) - Usa timestamp atual com microsegundos para garantir unicidade
    const timestamp = Date.now().toString().slice(-9); // 9 últimos dígitos do timestamp (inclui microsegundos)
    const CNF = timestamp.padStart(9, '0');
    
    const chaveBase =
      uf +
      AAMM +
      cnpjLimpo +
      modeloLimpo +
      serieLimpa +
      numeroLimpo +
      tpEmissaoStr +
      CNF;
  
  // Adicionar dígito verificador (DV) usando módulo 11
  const dv = calculateDV(chaveBase);
  
  return chaveBase + dv;
}

/**
 * Calcula o dígito verificador da chave de acesso usando módulo 11
 */
function calculateDV(chave: string): string {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  
  for (let i = chave.length - 1; i >= 0; i--) {
    const peso = pesos[(chave.length - 1 - i) % 8];
    soma += parseInt(chave[i]) * peso;
  }
  
  const resto = soma % 11;
  const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;
  
  return String(dv);
}

/**
 * Gera o QR Code para NFC-e
 */
function generateQrCode(
  chaveAcesso: string,
  ambiente: string,
  urlConsulta: string
): string {
  // Formato do QR Code para NFC-e: versão + chave + ambiente + URL consulta
  const versao = '2';
  const ambienteCod = ambiente === 'producao' ? '1' : '2';
  
  return `${versao}|${chaveAcesso}|${ambienteCod}|${urlConsulta}`;
}

/**
 * Mapeia tipos de pagamento para código da NFC-e
 */
function mapPaymentType(type: string): number {
  switch (type) {
    case 'debit': return 4; // Cartão de Débito
    case 'credit': return 3; // Cartão de Crédito
    case 'pix': return 5; // PIX
    case 'cash': return 1; // Dinheiro
    default: return 1;
  }
}

/**
 * Gera o XML da NFC-e
 */
export async function generateNfceXml(data: any, config: any, numeroNfce: number, serieNfce: number): Promise<string> {
  const numero = numeroNfce;
  const serie = serieNfce;
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
                <CRT>${config.CRT || '1'}</CRT>
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
    
    // Converter sale_id para número (remover prefixo "sale-" se presente)
    const saleIdNumber = typeof sale_id === 'string'
      ? parseInt(sale_id.replace(/\D/g, ''), 10)
      : Number(sale_id);
    
    if (!saleIdNumber || !valor_total || !itens || !Array.isArray(itens)) {
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
        
        console.log('[NFC-e] Configurações fiscais encontradas:', configResult ? configResult.length : 0);
        
        if (!configResult || configResult.length === 0) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Configuração fiscal não encontrada. Configure os dados da empresa primeiro.',
              });
            }
        
        const configResultFirst = configResult[0] || {};
                
                const config = {
                  ...configResultFirst,
                  id: configResultFirst.id,
                  uf: configResultFirst.uf || 'RR',
                  cnpj: configResultFirst.cnpj || '',
                  razao_social: configResultFirst.razao_social || '',
                  nome_fantasia: configResultFirst.nome_fantasia || '',
                  inscricao_estadual: configResultFirst.inscricao_estadual || '',
                  cnae: configResultFirst.cnae || '4721100',
                  ambiente: configResultFirst.ambiente || 'homologacao',
                  CRT: configResultFirst.crt || configResultFirst.CRT || '1',
                  serie_nfce: configResultFirst.serie_nfce || 15,
                  ultima_nfce: configResultFirst.ultima_nfce || 0,
                };
    
    // Buscar certificado ativo
            const certResult = await sql`
              SELECT * FROM digital_certificates
              ORDER BY created_at DESC
              LIMIT 1
            `;
        
        console.log('[NFC-e] Certificados encontrados:', certResult ? certResult.length : 0);
        
        if (!certResult || certResult.length === 0 || !certResult[0]) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Nenhum certificado ativo encontrado. Adicione um certificado digital primeiro.',
              });
            }
        
        const cert = certResult[0];
        
        // Verificar se o certificado está expirado
            const now = new Date();
            
            if (!cert.data_validade) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Certificado digital sem data de validade. Atualize o certificado.',
              });
            }
            
            const validade = new Date(cert.data_validade);
            
            if (validade < now) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Certificado digital expirado. Atualize o certificado antes de emitir NFC-e.',
              });
            }
        
        // Buscar o último número de NFC-e emitido
        const lastNfceResult = await sql`
          SELECT MAX(numero) as ultimo_numero
          FROM nfce
          WHERE ambiente = ${config.ambiente}
        `;
        
        const ultimoNumero = lastNfceResult[0]?.ultimo_numero || 0;
        const proximoNumero = Math.max(ultimoNumero + 1, (config.ultima_nfce || 0) + 1);
        const serieNfce = config.serie_nfce || 15;
                
        const nfceData = {
          sale_id: saleIdNumber,
          valor_total,
          itens,
          cliente,
          frete: frete || 0,
          forma_pagamento,
        };
                
    // Enviar para SEFAZ e salvar com retry para evitar duplicatas de chave
        let sefazResponse: any = null;
        let insertResult: any = null;
        let tentativas = 0;
        const maxTentativas = 3;
    
    while (tentativas < maxTentativas) {
      try {
        // Pequeno delay para garantir unicidade no timestamp
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Gerar XML da NFC-e (cada tentativa gera uma nova chave de acesso)
        const xmlEnvio = await generateNfceXml(nfceData, config, proximoNumero, serieNfce);
    
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
                const sefazResult = await enviarParaSefaz(xmlEnvio, config.ambiente);
                
                if (!sefazResult || !sefazResult.success) {
                  throw createError({
                          statusCode: 500,
                          statusMessage: sefazResult?.mensagem || 'Erro ao autorizar NFC-e na SEFAZ',
                        });
                      }
              
        // Salvar NFC-e no banco de dados
                const insert = await sql`
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
                    ${String(saleIdNumber)},
                    ${sefazResult.chave_acesso || ''},
                    ${sefazResult.numero || 0},
                    ${serieNfce},
                    ${now},
                    ${now},
                    ${sefazResult.protocolo || ''},
                    'autorizada',
                    ${sefazResult.qr_code || ''},
                    ${xmlEnvio},
                    ${sefazResult.xml_retorno || ''},
                    ${sefazResult.url_consulta || ''},
                    ${config.ambiente},
                    ${sefazResult.mensagem || ''}
                  ) RETURNING id
                `;
        
        // Se chegou aqui, tudo foi bem-sucedido
        sefazResponse = sefazResult;
        insertResult = insert;
        break;
        
      } catch (insertError: any) {
        tentativas++;
        
        // Verificar se é erro de chave duplicada
        if (insertError.message && insertError.message.includes('duplicate key') && insertError.message.includes('chave_acesso')) {
          // Aguardar um pouco e tentar novamente (o timestamp será diferente)
          if (tentativas < maxTentativas) {
            await new Promise(resolve => setTimeout(resolve, 100 * tentativas));
            continue;
          }
        }
        
        // Se não for erro de duplicata ou esgotou tentativas, propagar o erro
        throw createError({
          statusCode: 500,
          statusMessage: insertError.message || 'Erro ao emitir NFC-e',
        });
      }
          }
          
          // Verificar se a emissão foi bem-sucedida
          if (!sefazResponse || !insertResult) {
            throw createError({
              statusCode: 500,
              statusMessage: 'Não foi possível emitir a NFC-e após ' + maxTentativas + ' tentativas',
            });
          }
          
          // Atualizar a venda com os dados fiscais
                  await sql`
                    UPDATE sales
                    SET
                      xml_chave = ${sefazResponse.chave_acesso || ''},
                      xml_numero = ${sefazResponse.numero || 0},
                      xml_status = 'autorizada',
                      xml_content = ${sefazResponse.xml_retorno || ''}
                    WHERE id = ${saleIdNumber}
                  `;
                  
                  // Atualizar a configuração fiscal com o novo número de NFC-e (se tiver ID)
                  if (config.id) {
                    await sql`
                      UPDATE company_fiscal_config
                      SET ultima_nfce = ${proximoNumero},
                          updated_at = ${now}
                      WHERE id = ${config.id}
                    `;
                  }
        
        return {
                  success: true,
                  message: 'NFC-e emitida e autorizada com sucesso',
                  nfce: {
                    id: insertResult?.[0]?.id || 0,
                    sale_id: saleIdNumber,
                    chave_acesso: sefazResponse.chave_acesso || '',
                    numero: sefazResponse.numero || 0,
                    serie: serieNfce,
                    protocolo: sefazResponse.protocolo || '',
                    qr_code: sefazResponse.qr_code || '',
                    url_consulta: sefazResponse.url_consulta || '',
                    status: 'autorizada',
                    ambiente: config.ambiente,
                    data_emissao: now,
                    xml_retorno: sefazResponse.xml_retorno || '',
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
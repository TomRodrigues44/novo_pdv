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
    
    // Código numérico único (9 dígitos) - Garantir unicidade absoluta
    // Combina timestamp (últimos 6 dígitos) + número aleatório (3 dígitos)
    const timestamp = Date.now().toString().slice(-6); // 6 últimos dígitos do timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 dígitos aleatórios
    const CNF = timestamp + random; // 9 dígitos totais
    
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
  const dataEmissao = new Date();
  const chaveAcesso = generateChaveAcesso(
    config.estado || 'SP',
    dataEmissao,
    config.cnpj || '00000000000000',
    '65',
    serieNfce,
    numeroNfce
  );
  
  const now = dataEmissao.toISOString();
  const valorTotal = Number(data.valor_total) || 0;
  const frete = Number(data.frete) || 0;
  
  // Gerar detalhes dos itens
  let itensXml = '';
  let totalIcmsBase = 0;
  let totalIcms = 0;
  
  const itemNumero = 1;
  
  for (const item of (data.itens || [])) {
    const preco = Number(item.price) || 0;
    const quantidade = Number(item.quantity) || 1;
    const total = preco * quantidade;
    const cest = item.cest || '0000000';
    const ncm = item.ncm || '21069000';
    
    // Cálculo simplificado do ICMS
    const icmsBase = total;
    const icms = total * 0.12; // 12% de ICMS
    totalIcmsBase += icmsBase;
    totalIcms += icms;
    
    const itemIndex = String(itemNumero).padStart(3, '0');
    
    itensXml += `
        <det nItem="${itemIndex}">
          <prod>
            <cProd>${item.id || '9999999999999'}</cProd>
            <cEAN>${item.ean || ''}</cEAN>
            <xProd>${item.name}</xProd>
            <NCM>${ncm}</NCM>
            <CEST>${cest}</CEST>
            <CFOP>5102</CFOP>
            <uCom>UN</uCom>
            <qCom>${quantidade.toFixed(4)}</qCom>
            <vUnCom>${preco.toFixed(10)}</vUnCom>
            <vProd>${total.toFixed(2)}</vProd>
            <cEANTrib/>
            <uTrib>UN</uTrib>
            <qTrib>${quantidade.toFixed(4)}</qTrib>
            <vUnTrib>${preco.toFixed(10)}</vUnTrib>
            <indTot>1</indTot>
          </prod>
          <imposto>
            <vTotTrib>${total.toFixed(2)}</vTotTrib>
            <ICMS>
              <ICMS00>
                <orig>0</orig>
                <CST>00</CST>
                <modBC>3</modBC>
                <vBC>${icmsBase.toFixed(2)}</vBC>
                <pICMS>12.00</pICMS>
                <vICMS>${icms.toFixed(2)}</vICMS>
              </ICMS00>
            </ICMS>
            <PIS>
              <PISNT>
                <CST>49</CST>
              </PISNT>
            </PIS>
            <COFINS>
              <COFINSNT>
                <CST>49</CST>
              </COFINSNT>
            </COFINS>
          </imposto>
        </det>`;
  }
  
  // Gerar informações de pagamento
  let pagamentosXml = '';
  let formaPagamento = '';
  let valorPagamento = 0;
  
  for (const pagamento of (data.forma_pagamento || [])) {
    const valor = Number(pagamento.valor) || 0;
    const tipo = mapPaymentType(pagamento.tipo);
    
    pagamentosXml += `
          <tPag>${tipo}</tPag>
          <vPag>${valor.toFixed(2)}</vPag>`;
    
    formaPagamento = tipo === 1 ? '01' : tipo === 3 ? '03' : tipo === 4 ? '04' : '05';
    valorPagamento += valor;
  }
  
  if (!formaPagamento) {
    formaPagamento = '01';
    valorPagamento = valorTotal;
  }
  
  // Gerar QR Code
  const urlConsulta = config.ambiente === 'producao' 
    ? `https://www.sefaz${config.estado.toLowerCase()}.sp.gov.br/nfce`
    : `https://www.sefaz${config.estado.toLowerCase()}.sp.gov.br/nfce-homologacao`;
  
  const qrCode = generateQrCode(chaveAcesso, config.ambiente, urlConsulta);
  
  // Gerar o XML completo
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${chaveAcesso}" versao="4.00">
      <ide>
        <cUF>${config.estado === 'SP' ? '35' : '35'}</cUF>
        <cNF>${chaveAcesso.slice(35, 44)}</cNF>
        <natOp>VENDA</natOp>
        <mod>65</mod>
        <serie>${serieNfce}</serie>
        <nNF>${numeroNfce}</nNF>
        <dhEmi>${now}</dhEmi>
        <dhSaiEnt>${now}</dhSaiEnt>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>9</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${chaveAcesso.slice(-1)}</cDV>
        <tpAmb>${config.ambiente === 'producao' ? '1' : '2'}</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0.0</verProc>
      </ide>
      <emit>
        <CNPJ>${config.cnpj || '00000000000000'}</CNPJ>
        <xNome>${config.razao_social || 'EMPÓRIO DAS COXINHAS'}</xNome>
        <xFant>${config.nome_fantasia || 'EMPÓRIO DAS COXINHAS'}</xFant>
        <enderEmit>
          <xLgr>${config.logradouro || 'Rua das Coxinhas'}</xLgr>
          <nro>${config.numero || '123'}</nro>
          <xCpl>${config.complemento || ''}</xCpl>
          <xBairro>${config.bairro || 'Centro'}</xBairro>
          <cMun>${config.codigo_municipio || '3550308'}</cMun>
          <xMun>${config.municipio || 'São Paulo'}</xMun>
          <UF>${config.estado || 'SP'}</UF>
          <CEP>${config.cep || '00000000'}</CEP>
          <cPais>${config.codigo_pais || '1058'}</cPais>
          <xPais>${config.pais || 'BRASIL'}</xPais>
          <fone>${config.telefone || '5599999999999'}</fone>
        </enderEmit>
        <IE>${config.inscricao_estadual || '123456789'}</IE>
        <CRT>${config.regime_tributario === 'simples_nacional' ? '1' : '3'}</CRT>
      </emit>
      ${data.cliente ? `
      <dest>
        <CNPJ>${data.cliente.cpf_cnpj?.replace(/\D/g, '') || ''}</CNPJ>
        <xNome>${data.cliente.name || ''}</xNome>
        <enderDest>
          <xLgr>${data.cliente.address || ''}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>00000000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
        <email>${data.cliente.email || ''}</email>
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
            
            // Buscar a venda para verificar se existe
                        const saleResult = await sql`
                          SELECT id, total_amount, created_at FROM sales
                          WHERE id = ${saleIdNumber}
                          LIMIT 1
                        `;
                        
                        if (!saleResult || saleResult.length === 0) {
                          throw createError({
                            statusCode: 404,
                            statusMessage: 'Venda não encontrada. Verifique o sale_id.',
                          });
                        }
                        
                        const saleDbId = saleResult[0].id;
                        
                        // Verificar se já existe uma NFC-e autorizada para essa venda
                                    const existingNfce = await sql`
                                      SELECT
                                        id,
                                        chave_acesso,
                                        numero,
                                        serie,
                                        data_autorizacao,
                                        protocolo,
                                        status,
                                        qr_code,
                                        xml_retorno,
                                        url_consulta,
                                        ambiente,
                                        mensagem_status
                                      FROM nfce
                                      WHERE sale_id = ${String(saleDbId)}
                                        AND status IN ('autorizada', 'cancelada')
                                      ORDER BY created_at DESC
                                      LIMIT 1
                                    `;
                                    
                                    // Se já existe uma NFC-e, retornar os dados existentes
                                    if (existingNfce && existingNfce.length > 0) {
                                      const nfceData = existingNfce[0];
                                      return {
                                        success: true,
                                        message: 'NFC-e já emitida anteriormente',
                                        nfce: {
                                          id: nfceData.id,
                                          chave_acesso: nfceData.chave_acesso,
                                          numero: Number(nfceData.numero),
                                          serie: nfceData.serie,
                                          data_autorizacao: nfceData.data_autorizacao,
                                          protocolo: nfceData.protocolo,
                                          status: nfceData.status,
                                          qr_code: nfceData.qr_code,
                                          xml_retorno: nfceData.xml_retorno,
                                          url_consulta: nfceData.url_consulta,
                                          ambiente: nfceData.ambiente,
                                          mensagem_status: nfceData.mensagem_status,
                                        }
                                      };
                                    }
                                    
                                    // Verificar se existe uma NFC-e pendente para essa venda (evitar emissões duplicadas)
                                    const pendingNfce = await sql`
                                      SELECT id, chave_acesso, created_at FROM nfce
                                      WHERE sale_id = ${String(saleDbId)}
                                        AND status = 'pendente'
                                        AND created_at > NOW() - INTERVAL '5 minutes'
                                      ORDER BY created_at DESC
                                      LIMIT 1
                                    `;
                                    
                                    if (pendingNfce && pendingNfce.length > 0) {
                                      throw createError({
                                        statusCode: 409,
                                        statusMessage: 'Já existe uma NFC-e em processamento para esta venda. Aguarde alguns instantes antes de tentar novamente.',
                                      });
                                    }
        
        if (!saleDbId || !valor_total || !itens || !Array.isArray(itens)) {
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
        statusMessage: 'Configuração fiscal não encontrada. Configure os dados fiscais da empresa primeiro.',
      });
    }
    
        const config = configResult[0];
    
        // Obter próximo número de NFC-e
        const proximoNumero = config.ultima_nfce ? Number(config.ultima_nfce) + 1 : 1;
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
        const chaveMatch = xmlEnvio.match(/Id=\"NFe(\d{44})\"/);
        const chaveAcesso = chaveMatch ? chaveMatch[1] : '';
        
        // Verificar se a chave de acesso já existe no banco de dados
        if (chaveAcesso) {
          const existingChave = await sql`
            SELECT id FROM nfce WHERE chave_acesso = ${chaveAcesso} LIMIT 1
          `;
          if (existingChave && existingChave.length > 0) {
            // Chave já existe, tentar novamente com nova chave
            tentativas++;
            continue;
          }
        }
        
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
                              WHERE id = ${saleDbId}
                            `;
                  
                  // Atualizar a configuração fiscal com o novo número de NFC-e (se tiver ID)
                            if (config.id) {
                              await sql`
                                UPDATE company_fiscal_config
                                SET ultima_nfce = ${proximoNumero}
                                WHERE id = ${config.id}
                              `;
                            }
          
          // Retornar sucesso
          return {
            success: true,
            message: 'NFC-e emitida e autorizada com sucesso',
            nfce: {
              id: insertResult[0].id,
              chave_acesso: sefazResponse.chave_acesso || '',
              numero: Number(sefazResponse.numero || 0),
              serie: serieNfce,
              data_autorizacao: new Date().toISOString(),
              protocolo: sefazResponse.protocolo || '',
              status: 'autorizada',
              qr_code: sefazResponse.qr_code || '',
              xml_retorno: sefazResponse.xml_retorno || '',
              url_consulta: sefazResponse.url_consulta || '',
              ambiente: config.ambiente,
              mensagem_status: sefazResponse.mensagem || '',
            }
          };
      
      } catch (error: any) {
        console.error('Error emitting NFC-e:', error);
        throw createError({
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Erro desconhecido ao emitir NFC-e',
        });
      }
});
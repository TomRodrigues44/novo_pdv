export interface NfeAuthorizationResult {
  success: boolean;
  status: 'autorizada' | 'rejeitada';
  message: string;
  protocol?: string;
  authorizationXml?: string;
}

export async function authorizeNfeSimulation(xml: string, environment: string): Promise<NfeAuthorizationResult> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const accessKey = xml.match(/Id="NFe(\d{44})"/)?.[1];
  if (!accessKey || !xml.includes('<mod>55</mod>')) {
    return {
      success: false,
      status: 'rejeitada',
      message: 'XML inválido para NF-e modelo 55.',
    };
  }

  const protocol = `SIM${Date.now().toString().slice(-12)}`;
  const authorizationXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  ${xml.replace(/^<\?xml[^>]*>\s*/, '')}
  <protNFe versao="4.00"><infProt><tpAmb>${environment === 'producao' ? 1 : 2}</tpAmb>
    <chNFe>${accessKey}</chNFe><dhRecbto>${new Date().toISOString()}</dhRecbto>
    <nProt>${protocol}</nProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e em simulação</xMotivo>
  </infProt></protNFe>
</nfeProc>`;

  return {
    success: true,
    status: 'autorizada',
    message: 'NF-e autorizada em ambiente de homologação/simulação.',
    protocol,
    authorizationXml,
  };
}

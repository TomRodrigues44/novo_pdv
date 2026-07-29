import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Tabs, TabsContent,TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  FileText, 
  Shield, 
  Upload, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Trash2,
  Settings,
  RefreshCw,
  Link,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const AdminFiscal = () => {
  const [activeTab, setActiveTab] = useState("empresa");
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  
  // Configuração da Empresa
  const [companyConfig, setCompanyConfig] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    cnae: "",
    cnpj_matriz: "",
    regime_tributario: "simples_nacional",
    CRT: "1",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    municipio: "",
    uf: "RR",
    telefone: "",
    email: "",
    ambiente: "homologacao",
    serie_nfe: "1",
    serie_nfce: "15",
    ultima_nfe: "15200",
    ultima_nfce: "15200",
  });
  
  // Certificados
  const [certificates, setCertificates] = useState<any[]>([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  
  // Formulário de upload
  const [certForm, setCertForm] = useState({
    nome: "",
    arquivo: null as File | null,
    senha: "",
  });

  // Carregar configurações
  useEffect(() => {
    fetchCompanyConfig();
    fetchCertificates();
  }, []);

  const fetchCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config');
      if (response.ok) {
        const config = await response.json();
        if (config) {
          setCompanyConfig({
            cnpj: config.cnpj || "",
            razao_social: config.razao_social || "",
            nome_fantasia: config.nome_fantasia || "",
            inscricao_estadual: config.inscricao_estadual || "",
            inscricao_municipal: config.inscricao_municipal || "",
            cnae: config.cnae || "",
            cnpj_matriz: config.cnpj_matriz || "",
            regime_tributario: config.regime_tributario || "simples_nacional",
            CRT: config.CRT || "1",
            cep: config. cep || "",
            logradouro: config.logradouro || "",
            numero: config.numero || "",
            complemento: config.complemento || "",
            bairro: config.bairro || "",
            municipio: config.municipio || "",
            uf: config.uf || "RR",
            telefone: config.telefone || "",
            email: config.email || "",
            ambiente: config.ambiente || "homologacao",
            serie_nfe: String(config.serie_nfe || "15"),
            serie_nfce: String(config.serie_nfce || "15"),
            ultima_nfe: String(config.ultima_nfe || "15200"),
            ultima_nfce: String(config.ultima_nfce || "15200"),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching company config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...companyConfig,
          serie_nfe: parseInt(String(companyConfig.serie_nfe || 1)),
          serie_nfce: parseInt(String(companyConfig.serie_nfce || 15)),
          ultima_nfe: parseInt(String(companyConfig.ultima_nfe || 15200)),
          ultima_nfce: parseInt(String(companyConfig.ultima_nfce || 15200)),
        }),
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao salvar configurações');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };
  
  const handleSaveEmissionConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...companyConfig,
          serie_nfe: parseInt(String(companyConfig.serie_nfe || 1)),
          serie_nfce: parseInt(String(companyConfig.serie_nfce || 15)),
          ultima_nfe: parseInt(String(companyConfig.ultima_nfe || 15200)),
          ultima_nfce: parseInt(String(companyConfig.ultima_nfce || 15200)),
        }),
      });

      if (response.ok) {
        toast.success('Configurações de emissão salvas com sucesso!');
      } else {
        const const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao salvar configurações de emissão');
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações de emissão');
    }
  };

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certForm.arquivo || !certForm.senha) {
      toast.error('Selecione o arquivo e a senha do certificado');
      return;
    }

    setUploadingCert(true);

    try {
      const formData = new FormData();
      formData.append('file', certForm.arquivo);
      formData.append('nome', certForm.nome);
      formData.append('senha', certForm.senha);

      const response = await fetch('/api/fiscal/certificates', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Certificado adicionado com sucesso!');
        setCertForm({ nome: "", arquivo: null, senha: "" });
        fetchCertificates();
      } else {
        toast.error('Erro ao adicionar certificado');
      }
    } catch (error) {
      toast.error('Erro ao adicionar certificado');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este certificado?')) return;

    try {
      const response = await fetch(`/api/fiscal/certificates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Certificado excluído com sucesso!');
        fetchCertificates();
      } else {
        toast.error('Erro ao excluir certificado');
      }
    } catch (error) {
      toast.error('Erro ao excluir certificado');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const response = await fetch('/api/fiscal/test-connection', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setConnectionResult(result);
        
        if (result.success) {
          toast.success('Conexão com SEFAZ-RR estabelecida com sucesso!');
        } else {
          toast.error('Erro na conexão: ' + result.message);
        }
      } else {
        const error = await response.json();
        toast.error('Erro ao testar conexão: ' + error.statusMessage);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-orange-600" />
            Configurações Fiscais
          </h1>
          <p className="text-gray-600 mt-1">
            Integração SEFAZ-RR para emissão de NF-e e NFC-e
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa">
              <Building2 className="h-4 w-4 mr-2" />
              Dados da Empresa
            </TabsTrigger>
            <TabsTrigger value="certificados">
              <FileText className="h-4 w-4 mr-2" />
              Certificado Digital
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dados da Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Dados Cadastrais da Empresa</CardTitle>
                <CardDescription>
                  Informações fiscais e cadastrais para emissão de notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>CNPJ *</Label>
                      <Input
                        value={companyConfig.cnpj}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div>
                      <Label>Razão Social *</Label>
                      <Input
                        value={companyConfig.razao_social}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, razao_social: e.target.value })}
                        placeholder="Nome completo da empresa"
                      />
                    </div>
                    <div>
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={companyConfig.nome_fantasia}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, nome_fantasia: e.target.value })}
                        placeholder="Nome comercial"
                      />
                    </div>
                    <div>
                      <Label>Inscrição Estadual</Label>
                      <Input
                        value={companyConfig.inscricao_estadual}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, inscricao_estadual: e.target.value })}
                        placeholder="Isento ou número"
                      />
                    </div>
                    <div>
                      <Label>Inscrição Municipal</Label>
                      <Input
                        value={companyConfig.inscricao_municipal}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, inscricao_municipal: e.target.value })}
                        placeholder="Isento ou número"
                      />
                    </div>
                    <div>
                      <Label>CNAE</Label>
                      <Input
                        value={companyConfig.cnae}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnae: e.target.value })}
                        placeholder="XXXX-XX-00"
                      />
                    </div>
                    <div>
                      <Label>CNPJ da Matriz</Label>
                      <input.logradouro
                        value={companyConfig.logradouro}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, logradouro: e.target.value })}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input
                        value={companyConfig.numero}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, numero: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={companyConfig.complemento}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, complemento: e.target.value })}
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={companyConfig.bairro}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, bairro: e.target.value })}
                        placeholder="Centro"
                      />
                    </div>
                    <div>
                      <Label>Município</Label>
                      <Input
                        value={companyConfig.municipio}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, municipio: e.target.value })}
                        placeholder="Boa Vista"
                      />
                    </div>
                    <div>
                      <Label>UF</Label>
                      <select
                        value={companyConfig.uf}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, uf: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="RR">Roraima</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <PI">Piauí</option>
                        <RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={companyConfig.telefone}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, telefone: e.target.value })}
                        placeholder="(95) 99999-9999"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={companyConfig.email}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, email: e.target.value })}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div>
                      <Label>Ambiente</Label>
                      <select
                        value={companyConfig.ambiente}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, ambiente: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="homologacao">Homologação (Teste)</option>
                        <option value="producao">Produção</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">Endereço Completo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>CEP</Label>
                        <Input
                          value={companyConfig.cep}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, cep: e.target.value })}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Logradouro</Label>
                        <Input
                          value={companyConfig.logradouro}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, logradouro: e.target.value })}
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={companyConfig.numero}
                          onChange={(e) => aceito?: string) => setCompanyConfig({ ...companyConfig, numero: e.target.value || '' })}
                          placeholder="123"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Complemento</Label>
                        <Input
                          value={companyConfig.complemento}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, complemento: e.target.value })}
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Bairro</Label>
                        <Input
                          value={companyConfig.bairro}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, bairro: e.target.value })}
                          placeholder="Centro"
                        />
                      </div>
                      <div>
                        <Label>Município</Label>
                        <Input
                          value={companyConfig.municipio}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, municipio: e.target.value })}
                          placeholder="Boa Vista"
                        />
                      </div>
                      <div>
                        <Label>UF</Label>
                        <select
                          value={companyConfig.uf}
                          onChange={(e) => setCompanyConfig({ ...companyConfig, uf: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="RR">Roraima</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
          </option>
          <option value="MG">Minas Gerais</option>
          <option value="PA">Pará</option>
          <option value="PB">Paraíba</option>
          <option value="PR">Paraná</option>
          <option value="PE">Pernambuco</option>
          <option value="PI">Piauí</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="RN">Rio Grande do Norte</option>
          <option value="RS">Rio Grande do Sul</option>
          <value={companyConfig.cnpj.replace(/\D/g, '')}</CNPJ>
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
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${data.valor_total.toFixed(2)}</vProd>
          <vFrete>${data.frete.toFixed(2)}</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
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
    
    // Atualizar o último número usado
    await sql()`
      UPDATE company_fiscal_config
      SET ultima_nfce = ${numero},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${config.id}
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
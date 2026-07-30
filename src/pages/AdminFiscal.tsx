import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Settings,
  Trash2,
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

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/fiscal/certificates');
      if (response.ok) {
        const data = await response.json();
        setCertificates(data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleActivateCert = async (id: string) => {
    try {
      const response = await fetch(`/api/fiscal/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: true }),
      });

      if (response.ok) {
        toast.success('Certificado ativado com sucesso!');
        fetchCertificates();
      } else {
        toast.error('Erro ao ativar certificado');
      }
    } catch (error) {
      toast.error('Erro ao ativar certificado');
    }
  };

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
            cep: config.cep || "",
            logradouro: config.logradouro || "",
            numero: config.numero || "",
            complemento: config.complemento || "",
            bairro: config.bairro || "",
            municipio: config.municipio || "",
            uf: config.uf || "RR",
            telefone: config.telefone || "",
            email: config.email || "",
            ambiente: config.ambiente || "homologacao",
            serie_nfe: String(config.serie_nfe || "1"),
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
        try {
          const error = await response.json();
          toast.error(error.statusMessage || 'Erro ao salvar configurações');
        } catch (e) {
          toast.error('Erro ao salvar configurações');
        }
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações');
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
        setCertForm({ nome: "", arquivo: null as File | null, senha: "" });
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
        try {
          const error = await response.json();
          toast.error('Erro ao testar conexão: ' + error.statusMessage);
        } catch (e) {
          toast.error('Erro ao testar conexão');
        }
      }
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
                      <Input
                        value={companyConfig.cnpj_matriz}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cnpj_matriz: e.target.value })}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div>
                      <Label>Regime Tributário *</Label>
                      <select
                        value={companyConfig.regime_tributario}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, regime_tributario: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="simples_nacional">Simples Nacional</option>
                        <option value="simples_nacional_excesso">Simples Nacional - Excesso</option>
                        <option value="lucro_presumido">Lucro Presumido</option>
                        <option value="lucro_real">Lucro Real</option>
                      </select>
                    </div>
                    <div>
                      <Label>CRT (Código de Regime Tributário)</Label>
                      <select
                        value={companyConfig.CRT}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, CRT: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="1">Simples Nacional</option>
                        <option value="2">Simples Nacional - Excesso</option>
                        <option value="3">Regime Normal</option>
                      </select>
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

                  <div className="space-y-4">
                    <div>
                      <Label>CEP</Label>
                      <Input
                        value={companyConfig.cep}
                        onChange={(e) => setCompanyConfig({ ...companyConfig, cep: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
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
                        onChange={(e) => setCompanyConfig({ ...companyConfig, numero: e.target.value })}
                        placeholder="123"
                      />
                    </div>
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
                        <option value="MG">Minas Gerais</option>
                        <option value="MS">Mato Grosso</option>
                        <option value="MT">Mato Grosso do Sul</option>
                        <option value="PB">Paraíba</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
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
                  </div>

                  <div className="flex justify-end mt-6 md:col-span-2">
                    <Button
                      onClick={handleSaveCompanyConfig}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Salvar Dados da Empresa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Certificado Digital */}
          <TabsContent value="certificados">
            <Card>
              <CardHeader>
                <CardTitle>Certificado Digital A1</CardTitle>
                <CardDescription>
                  Carregue o certificado digital A1 para assinatura digital das notas fiscais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Como funciona</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          O certificado A1 é obrigatório para emissão de NF-e/NFC-e. Selecione o arquivo .p12 ou .pfx e a senha do certificado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUploadCert} className="space-y-4">
                    <div>
                      <Label>Nome do Certificado</Label>
                      <Input
                        value={certForm.nome}
                        onChange={(e) => setCertForm({ ...certForm, nome: e.target.value })}
                        placeholder="Ex: Certificado Principal"
                        required
                      />
                    </div>
                    <div>
                      <Label>Arquivo do Certificado</Label>
                      <Input
                        type="file"
                        accept=".p12,.pfx"
                        onChange={(e) => setCertForm({ ...certForm, arquivo: e.target.files?.[0] || null })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Senha do Certificado</Label>
                      <Input
                        type="password"
                        value={certForm.senha}
                        onChange={(e) => setCertForm({ ...certForm, senha: e.target.value })}
                        placeholder="Senha do arquivo"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={uploadingCert}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {uploadingCert ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Adicionar Certificado
                        </>
                      )}
                    </Button>
                  </form>

                  {certificates.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-4 text-lg">Certificados Cadastrados</h3>
                      <div className="space-y-3">
                        {certificates.map((cert: any) => (
                          <div
                            key={cert.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              cert.ativo
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  cert.ativo
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{cert.nome}</p>
                                <p className="text-xs text-gray-500">
                                  Válido até: {new Date(cert.data_validade).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!cert.ativo && (
                                <Button
                                  onClick={() => handleActivateCert(cert.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Ativar
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCert(cert.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Emissão</CardTitle>
                <CardDescription>
                  Defina a série e o último número de NFC-e/NF-e
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Série NFC-e *</Label>
                    <Input
                      type="number"
                      value={companyConfig.serie_nfce}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, serie_nfce: e.target.value })}
                      placeholder="Ex: 15"
                      min="1"
                      max="999"
                    />
                  </div>
                  <div>
                    <Label>Última NFC-e *</Label>
                    <Input
                      type="number"
                      value={companyConfig.ultima_nfce}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, ultima_nfce: e.target.value })}
                      placeholder="Ex: 15200"
                      min="0"
                    />
                  </div>
                  <div className="bg-yellow-50 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Atenção</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          A série NFC-e e o último número são usados para gerar a chave de acesso da nota fiscal. Verifique se estão corretos antes de emitir notas.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Série NFE</Label>
                    <Input
                      type="number"
                      value={companyConfig.serie_nfe}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, serie_nfe: e.target.value })}
                      placeholder="Ex: 1"
                      min="1"
                      max="999"
                    />
                  </div>
                  <div>
                    <Label>Última NFE</Label>
                    <Input
                      type="number"
                      value={companyConfig.ultima_nfe}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, ultima_nfe: e.target.value })}
                      placeholder="Ex: 15200"
                      min="0"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveCompanyConfig}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Salvar Configurações
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Testar Conexão</h3>
                  <p className="text-gray-600 mb-4">
                    Verifique se a conexão com a SEFAZ-RR está funcionando corretamente.
                  </p>
                  <Button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    variant="outline"
                    className="w-full"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  {connectionResult && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      connectionResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`font-semibold ${
                        connectionResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {connectionResult.success ? 'Conexão estabelecida!' : 'Erro na conexão'}
                      </p>
                      <p className="text-sm mt-1">
                        {connectionResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminFiscal;
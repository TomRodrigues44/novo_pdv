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
          setCompanyConfig(config);
        }
      }
    } catch (error) {
      console.error('Error fetching company config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/fiscal/certificates');
      if (response.ok) {
        const certs = await response.json();
        setCertificates(certs);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleSaveCompanyConfig = async () => {
    try {
      const response = await fetch('/api/fiscal/company-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyConfig),
      });

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
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
          toast.success('Conexão com SEFAZ estabelecida com sucesso!');
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
                  </div>

                  <div className="space-y-4">
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
                          onChange={(e) => setCompanyConfig({ ...companyConfig, numero: e.target.value })}
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
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveCompanyConfig} className="bg-orange-600 hover:bg-orange-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Certificado Digital */}
          <TabsContent value="certificados">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload de Certificado */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Certificado Digital</CardTitle>
                  <CardDescription>
                    Certificado A1 (.pfx) para assinatura digital das notas fiscais
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                      <Label>Arquivo do Certificado (.pfx)</Label>
                      <Input
                        type="file"
                        accept=".pfx,.p12"
                        onChange={(e) => setCertForm({ 
                          ...certForm, 
                          arquivo: e.target.files?.[0] || null 
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Senha do Certificado</Label>
                      <Input
                        type="password"
                        value={certForm.senha}
                        onChange={(e) => setCertForm({ ...certForm, senha: e.target.value })}
                        placeholder="Digite a senha"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={uploadingCert}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingCert ? 'Enviando...' : 'Adicionar Certificado'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Lista de Certificados */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificados Cadastrados</CardTitle>
                  <CardDescription>
                    Certificados digitais disponíveis para uso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certificates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum certificado cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              cert.expirado ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {cert.expirado ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{cert.nome}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Válido até: {new Date(cert.data_validade).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {cert.expirado && (
                                <p className="text-sm text-red-600 font-medium">
                                  Certificado expirado!
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCert(cert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="configuracoes">
            <div className="space-y-6">
              {/* Teste de Conexão */}
              <Card>
                <CardHeader>
                  <CardTitle>Testar Conexão com SEFAZ-RR</CardTitle>
                  <CardDescription>
                    Verifique se o certificado digital está funcionando e se consegue se comunicar com a SEFAZ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
                      {testingConnection ? 'Testando conexão...' : 'Testar Conexão'}
                    </Button>

                    {connectionResult && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        connectionResult.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          {connectionResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              connectionResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {connectionResult.message}
                            </p>
                            
                            {connectionResult.details && (
                              <div className="mt-3 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-600">Ambiente:</span>
                                    <span className="ml-2 font-medium">
                                      {connectionResult.details.ambiente === 'producao' ? 'Produção' : 'Homologação'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">CNPJ:</span>
                                    <span className="ml-2 font-medium">{connectionResult.details.cnpj}</span>
                                  </div>
                                </div>
                                
                                {connectionResult.details.certificado && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="font-medium mb-1">Certificado:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="ml-2">{connectionResult.details.certificado.nome}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Validade:</span>
                                        <span className="ml-2">
                                          {new Date(connectionResult.details.certificado.validade).toLocaleDateString('pt-BR')}
                                        </span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-600">Dias restantes:</span>
                                        <span className={`ml-2 font-bold ${
                                          connectionResult.details.certificado.dias_restantes < 30 
                                            ? 'text-red-600' 
                                            : connectionResult.details.certificado.dias_restantes < 90 
                                              ? 'text-orange-600' 
                                              : 'text-green-600'
                                        }`}>
                                          {connectionResult.details.certificado.dias_restantes} dias
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-gray-600 text-xs">
                                    <Link className="h-3 w-3 inline mr-1" />
                                    URL SEFAZ: {connectionResult.details.sefaz_url}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1 italic">
                                    {connectionResult.details.nota}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Emissão */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Emissão</CardTitle>
                  <CardDescription>
                    Configurações específicas para NF-e e NFC-e
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900">Ambiente de Homologação</p>
                          <p className="text-sm text-blue-700">
                            Atualmente o sistema está configurado para usar o ambiente de homologação da SEFAZ-RR. 
                            Notas emitidas neste ambiente não têm valor fiscal e servem apenas para testes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Série NF-e</Label>
                        <Input defaultValue="1" placeholder="1" />
                        <p className="text-xs text-gray-500 mt-1">Série para Nota Fiscal Eletrônica</p>
                      </div>
                      <div>
                        <Label>Série NFC-e</Label>
                        <Input defaultValue="1" placeholder="1" />
                        <p className="text-xs text-gray-500 mt-1">Série para NFC-e</p>
                      </div>
                      <div>
                        <Label>Última NF-e</Label>
                        <Input defaultValue="0" readOnly />
                      </div>
                      <div>
                        <Label>Última NFC-e</Label>
                        <Input defaultValue="0" readOnly />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminFiscal;
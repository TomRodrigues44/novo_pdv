import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Calendar, Search, Package, ReceiptText, BarChart3, Printer } from "lucide-react";
import { toast } from "sonner";

interface FiscalNote {
  fiscal_id: number;
  model: "NFC-e" | "NF-e";
  id: string;
  xml_chave: string | null;
  xml_numero: number | null;
  xml_status: string;
  created_at: string;
  total_amount: number;
  customer_name: string | null;
}

type ModelFilter = "all" | "NF-e" | "NFC-e";

const AdminXmls = () => {
  const [notes, setNotes] = useState<FiscalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [activeTab, setActiveTab] = useState<"xmls" | "danfes" | "faturamento">("xmls");

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const [nfceResponse, nfeResponse] = await Promise.all([
        fetch('/api/nfce'),
        fetch('/api/nfe'),
      ]);

      if (!nfceResponse.ok || !nfeResponse.ok) {
        throw new Error('Falha ao carregar XMLs');
      }

      const [nfceData, nfeData] = await Promise.all([
        nfceResponse.json(),
        nfeResponse.json(),
      ]);

      const nfceNotes: FiscalNote[] = (Array.isArray(nfceData) ? nfceData : []).map((note) => ({
        ...note,
        fiscal_id: note.nfce_id,
        model: "NFC-e" as const,
      }));

      const nfeNotes: FiscalNote[] = (Array.isArray(nfeData) ? nfeData : []).map((note) => ({
        ...note,
        fiscal_id: note.nfe_id,
        model: "NF-e" as const,
      }));

      setNotes(
        [...nfceNotes, ...nfeNotes].sort(
          (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
        ),
      );
    } catch (error) {
      console.error('Error fetching fiscal XMLs:', error);
      toast.error('Erro ao carregar XMLs fiscais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesModel = modelFilter === "all" || note.model === modelFilter;
    const matchesSearch = searchTerm === ""
      || note.id.includes(searchTerm)
      || note.model.toLowerCase().includes(searchTerm.toLowerCase())
      || (note.xml_chave && note.xml_chave.includes(searchTerm));

    const matchesDate = dateFilter === "" || note.created_at.startsWith(dateFilter);

    return matchesModel && matchesSearch && matchesDate;
  });

  const downloadFile = (content: BlobPart, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  };

  const handleDownloadXml = async (note: FiscalNote) => {
    try {
      const endpoint = note.model === "NF-e"
        ? `/api/nfe/xml/${note.fiscal_id}`
        : `/api/nfce/xml/${note.fiscal_id}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Falha ao baixar XML');
      }

      const xml = await response.blob();
      downloadFile(xml, `${note.model === "NF-e" ? "nfe" : "nfce"}-${note.xml_numero || note.id}.xml`, 'application/xml');
      toast.success(`XML da ${note.model} baixado com sucesso!`);
    } catch (error) {
      console.error('Error downloading fiscal XML:', error);
      toast.error('Erro ao baixar XML');
    }
  };

  const handleDownloadAll = async () => {
    if (!dateFilter) {
      toast.warning('Selecione o mês antes de baixar todos os XMLs.');
      return;
    }

    if (filteredNotes.length === 0) {
      toast.warning('Nenhum XML encontrado para download');
      return;
    }

    try {
      const [year, month] = dateFilter.split('-').map(Number);

      if (!year || !month || month < 1 || month > 12) {
        throw new Error('Competência inválida. Selecione novamente o mês.');
      }

      const lastDay = new Date(year, month, 0).getDate();
      const inicio = `${year}-${String(month).padStart(2, '0')}-01`;
      const fim = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const endpoint = `/api/fiscal/xml-export?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        let message = 'Não foi possível gerar o ZIP dos XMLs fiscais.';

        try {
          const errorData = await response.json();
          message = errorData.statusMessage || errorData.message || message;
        } catch {
          // Mantém a mensagem padrão caso a resposta não seja JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const filenameMatch =
        disposition.match(/filename\*=UTF-8''([^;]+)/i) ||
        disposition.match(/filename="?([^";]+)"?/i);

      const filename = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1].trim())
        : `XML-Fiscais-${inicio.replace(/-/g, '')}-${fim.replace(/-/g, '')}.zip`;

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Pacote ZIP fiscal de ${dateFilter} gerado com sucesso!`);
    } catch (error: any) {
      console.error('Error downloading fiscal ZIP:', error);
      toast.error(error.message || 'Erro ao baixar os XMLs');
    }
  };

  const handleDanfePdf = (note: FiscalNote) => {
    if (note.model !== "NFC-e") {
      toast.info("PDF de NF-e será habilitado na auditoria do modelo 55.");
      return;
    }

    const url = `/api/nfce/pdf/${note.fiscal_id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value || 0));

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FileText className="h-8 w-8 text-orange-600" />
            Central Fiscal
          </h1>
          <p className="mt-1 text-gray-600">
            XMLs, DANFEs e relatórios de faturamento para a contabilidade
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Button
            type="button"
            variant={activeTab === "xmls" ? "default" : "outline"}
            className={activeTab === "xmls" ? "h-12 bg-orange-600 hover:bg-orange-700" : "h-12"}
            onClick={() => setActiveTab("xmls")}
          >
            <FileText className="mr-2 h-4 w-4" /> XMLs Fiscais
          </Button>
          <Button
            type="button"
            variant={activeTab === "danfes" ? "default" : "outline"}
            className={activeTab === "danfes" ? "h-12 bg-orange-600 hover:bg-orange-700" : "h-12"}
            onClick={() => setActiveTab("danfes")}
          >
            <ReceiptText className="mr-2 h-4 w-4" /> DANFEs / PDFs
          </Button>
          <Button
            type="button"
            variant={activeTab === "faturamento" ? "default" : "outline"}
            className={activeTab === "faturamento" ? "h-12 bg-orange-600 hover:bg-orange-700" : "h-12"}
            onClick={() => setActiveTab("faturamento")}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Faturamento
          </Button>
        </div>

        {activeTab === "xmls" && (
          <>
        <Card className="mb-6">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={modelFilter === "all" ? "default" : "outline"}
                className={modelFilter === "all" ? "bg-orange-600 hover:bg-orange-700" : ""}
                onClick={() => setModelFilter("all")}
              >
                Todas ({notes.length})
              </Button>
              <Button
                type="button"
                variant={modelFilter === "NF-e" ? "default" : "outline"}
                className={modelFilter === "NF-e" ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={() => setModelFilter("NF-e")}
              >
                Apenas NF-e ({notes.filter((note) => note.model === "NF-e").length})
              </Button>
              <Button
                type="button"
                variant={modelFilter === "NFC-e" ? "default" : "outline"}
                className={modelFilter === "NFC-e" ? "bg-amber-600 hover:bg-amber-700" : ""}
                onClick={() => setModelFilter("NFC-e")}
              >
                Apenas NFC-e ({notes.filter((note) => note.model === "NFC-e").length})
              </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por modelo, ID ou chave de acesso..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="month"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleDownloadAll}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={filteredNotes.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Todos ({filteredNotes.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais Autorizadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-gray-500">Carregando...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-lg">Nenhum XML encontrado</p>
                <p className="mt-2 text-sm">
                  {searchTerm || dateFilter || modelFilter !== "all"
                    ? 'Tente ajustar os filtros'
                    : 'As NF-e e NFC-e autorizadas aparecerão aqui'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Chave de Acesso</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={`${note.model}-${note.fiscal_id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(note.created_at).toLocaleString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            note.model === "NF-e"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {note.model}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{note.xml_numero || '-'}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-600">
                            {note.xml_chave ? `${note.xml_chave.slice(0, 20)}...` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>{note.customer_name || 'Consumidor não identificado'}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(note.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadXml(note)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            XML
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

          </>
        )}

        {activeTab === "danfes" && (
          <>
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por modelo, ID ou chave de acesso..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="month"
                      value={dateFilter}
                      onChange={(event) => setDateFilter(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DANFEs / PDFs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-gray-500">Carregando...</div>
                ) : filteredNotes.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <ReceiptText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-lg">Nenhum documento encontrado</p>
                    <p className="mt-2 text-sm">Tente ajustar a competência ou a busca.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Número</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">PDF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotes.map((note) => (
                          <TableRow key={`danfe-${note.model}-${note.fiscal_id}`}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(note.created_at).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                note.model === "NF-e" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                              }`}>
                                {note.model}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{note.xml_numero || '-'}</TableCell>
                            <TableCell>{note.customer_name || 'Consumidor não identificado'}</TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(note.total_amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={note.model === "NFC-e" ? "default" : "outline"}
                                className={note.model === "NFC-e" ? "bg-orange-600 hover:bg-orange-700" : ""}
                                onClick={() => handleDanfePdf(note)}
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                {note.model === "NFC-e" ? "Abrir PDF" : "Em breve"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "faturamento" && (
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Faturamento</CardTitle>
            </CardHeader>
            <CardContent className="py-12 text-center">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-orange-300" />
              <h3 className="text-lg font-semibold">Relatório contábil em implantação</h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">
                Aqui serão gerados o PDF consolidado e a planilha detalhada por competência, com vendas, cancelamentos e faturamento considerado.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Arquivos fiscais</h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  <li>• Esta área reúne todas as NF-e e NFC-e autorizadas.</li>
                  <li>• Use os filtros e “Baixar Todos” para organizar os arquivos por mês.</li>
                  <li>• Mantenha os XMLs armazenados por pelo menos 5 anos, conforme a legislação.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminXmls;
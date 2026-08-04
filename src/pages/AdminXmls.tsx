import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Calendar, Search, Filter, Package } from "lucide-react";
import { toast } from "sonner";

interface Sale {
  nfce_id: number;
  id: string;
  xml_content: string;
  xml_chave: string | null;
  xml_numero: number | null;
  xml_status: string;
  created_at: string;
  total_amount: number;
  customer_name: string | null;
}

const AdminXmls = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nfce');
      if (!response.ok) {
        throw new Error('Falha ao carregar XMLs');
      }
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Erro ao carregar XMLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDownloadXml = async (sale: Sale) => {
    try {
      const response = await fetch(`/api/nfce/xml/${sale.nfce_id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nfe-${sale.xml_numero || sale.id.slice(-6)}.xml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('XML baixado com sucesso!');
      } else {
        toast.error('Erro ao baixar XML');
      }
    } catch (error) {
      console.error('Error downloading XML:', error);
      toast.error('Erro ao baixar XML');
    }
  };

  const handleDownloadAll = async () => {
    // Filtrar vendas baseado na busca e data
    const filteredSales = sales.filter((sale) => {
      const matchesSearch = searchTerm === "" || 
        sale.id.includes(searchTerm) ||
        (sale.xml_chave && sale.xml_chave.includes(searchTerm));
      
      const matchesDate = dateFilter === "" || 
        sale.created_at.startsWith(dateFilter);
      
      return matchesSearch && matchesDate;
    });

    if (filteredSales.length === 0) {
      toast.warning('Nenhum XML encontrado para download');
      return;
    }

    // Criar um arquivo ZIP simples (concatenando XMLs em um arquivo texto)
    // Em produção, você usaria uma biblioteca como JSZip
    let combinedXmls = "";
    filteredSales.forEach((sale) => {
      combinedXmls += `<!-- XML da Venda #${sale.id.slice(-6)} - ${new Date(sale.created_at).toLocaleString('pt-BR')} -->\n`;
      combinedXmls += sale.xml_content + "\n\n";
    });

    const blob = new Blob([combinedXmls], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xmls-${dateFilter || 'todos'}.xml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success(`${filteredSales.length} XMLs baixados!`);
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = searchTerm === "" || 
      sale.id.includes(searchTerm) ||
      (sale.xml_chave && sale.xml_chave.includes(searchTerm));
    
    const matchesDate = dateFilter === "" || 
      sale.created_at.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-orange-600" />
            XMLs Fiscais
          </h1>
          <p className="text-gray-600 mt-1">
            Baixe os XMLs das notas fiscais para enviar ao contador
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID ou chave de acesso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="month"
                  placeholder="Filtrar por mês (YYYY-MM)"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleDownloadAll}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={filteredSales.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Todos ({filteredSales.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de XMLs */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Carregando...
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Nenhum XML encontrado</p>
                <p className="text-sm mt-2">
                  {searchTerm || dateFilter 
                    ? 'Tente ajustar os filtros' 
                    : 'As notas fiscais aparecerão aqui após a emissão'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Chave de Acesso</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.nfce_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(sale.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {sale.xml_numero || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-600">
                            {sale.xml_chave ? sale.xml_chave.slice(0, 20) + '...' : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sale.customer_name || '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(parseFloat(String(sale.total_amount)))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadXml(sale)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
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

        {/* Instruções */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Instruções para o Contador</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Baixe os XMLs individualmente ou use "Baixar Todos" para obter todos de um mês</li>
                  <li>• Os XMLs contêm todas as informações fiscais necessárias para cálculo de impostos</li>
                  <li>• Mantenha os arquivos XMLs armazenados por pelo menos 5 anos conforme legislação</li>
                  <li>• Envie mensalmente ao contador para geração das guias de impostos</li>
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
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  Clock,
  FileText,
  Download,
  Printer,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface ContingencyNote {
  id: string;
  sale_id: string;
  numero_nota: number;
  serie: string;
  chave_acesso: string;
  protocolo: string;
  qr_code: string;
  xml_content: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  updated_at: string;
}

const AdminContingency = () => {
  const [notes, setNotes] = [ContingencyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fiscal/contingency');
      if (status === 200) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching contingency notes:', error);
      toast.error('Erro ao carregar notas em contingência');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      const response = await fetch(`/api/fiscal/contingency/${id}/retry`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Nota enviada com sucesso para SEFAZ!');
        fetchNotes();
      } else {
        const error = await response.json();
        toast.error(error.statusMessage || 'Erro ao reenviar nota');
      }
    } catch (error) {
      toast.error('Erro ao reenviar nota');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota em contingência?')) {
      return;
    }

    try {
      const response = await fetch(`/api/fiscal/contingency/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Nota excluída com sucesso!');
        fetchNotes();
      } else {
        toast.error('Erro ao excluir nota');
      }
    } catch (error) {
      toast.error('Erro ao excluir nota');
    }
  };

  const handlePrint = (note: Contingency) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Fiscal em Contingência - Nota ${note.numero_nota}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                margin: 0;
                padding: 10px;
                line-height: 1.4;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px dashed #000;
                padding-bottom: 10px;
              }
              .section {
                margin-bottom: 15px;
              }
              .section-title {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              .total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 10px;
                border-top: 2px dashed #000;
                padding-top: 10px;
              }
              .qr-code {
                text-align: center;
                margin-top: 20px;
                padding: 10px;
                border: 2px solid #000;
              }
              .qr-code img {
                max-width: 200px;
              }
              .protocolo {
                text-align: center;
                margin-top: 10px;
                font-size: 11px;
                color: #666;
              }
              .chave {
                font-size: 9px;
                word-break: break-all;
                margin-top: 10px;
                text-align: center;
                color: #666;
              }
              .contingency-badge {
                background: #fff3cd;
                border: 1px solid #fbbf24;
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                gap: 2px;
                font-size: 12px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>DANFE SEFAZ-RR</h2>
              <p>DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
              <p>PARA USO DO FISCO</p>
              <div class="contingency-badge">
                <AlertTriangle className="h-4 w-4" />
                <span>EM CONTINGÊNCIA</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DADOS DA NOTA FISCAL</div>
              <div class="row">
                <span>Número:</span>
                <span>${note.numero_nota}</span>
              </div>
              <div class="row">
                <span>Série:</span>
                <span>${note.serie}</span>
              </div>
              <div class="row">
                <span>Data Emissão:</span>
                <span>${new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="row">
                <span>Protocolo:</span>
                <span>${note.protocolo || 'Pendente'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">DADOS DO DESTINATÁRIO</div>
              <div class="row">
                <span>CPF/CNPJ:</span>
                <span>***.***.***-**</span>
              </div>
              <div class="row">
                <span>Nome:</span>
                <span>CONSUMIDOR NÃO IDENTIFICADO</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">ITENS DA NOTA</div>
              ${note.xml_content ? extractItemsFromXML(note.xml_content).map((item: any) => `
                <div class="row">
                  <span>${item.quantidade}x ${item.nome}</span>
                  <span>R$ ${item.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>

            <div class="total">
              <div class="row">
                <span>Total da Nota:</span>
                <span>R$ ${extractTotalFromXML(note.xml_content).toFixed(2)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">FORMA DE PAGAMENTO</div>
              <div class="row">
                <span>Dinheiro:</span>
                <span>R$ ${extractTotalFromXML(note.xml_content).toFixed(2)}</span>
              </div>
            </div>

            <div class="qr-code">
              <p style="font-size: 10px; margin-bottom: 5px;">QR Code para consulta:</p>
              <img src="${note.qr_code}" alt="QR Code" />
            </div>

            <div class="protocolo">
              <p>Consulta pela chave de acesso em:</p>
              <p>https://www.sefaz.rs.gov.br/nfce/consulta</p>
            </div>

            <div class="chave">
              <p>Chave de Acesso:</p>
              <p>${note.chave_acesso}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    toast.success('Chave de acesso copiada!');
  };

  const handleDownloadXML = (note: ContingencyNote) => {
    const blob = new Blob([note.xml_content], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfe-${note.numero_nota}-contingencia.xml`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('XML baixado com sucesso!');
  };

  const extractItemsFromXML = (xml: string) => {
    // Extrair itens do XML de forma simplificada
    const items: any[] = [];
    const itemRegex = /<det nItem="(\d+)">[\s\S]*?<cProd>([\s\S]*?)<\/cProd>[\s\S]*?<xProd>([\s\S]*?)<\/xProd>[\s\S]*?<vUnCom>([\s\S]*?)<\/vUnCom>[\s\S]*?<qCom>([\s\S]*?)<\/qCom>[\s\S]*?<vProd>([\s\S]*?)<\/vProd>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      items.push({
        quantidade: parseInt(match[6]),
        nome: match[4],
        total: parseFloat(match[7]),
      });
    }
    return items;
  };

  const extractTotalFromXML = (xml: string): number => {
    const totalMatch = xml.match(/<vNF>([\d.]+)<\/vNF>/);
    return totalMatch ? parseFloat(totalMatch[1]) : 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            Notas em Contingência
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie notas fiscais que não puderam ser enviadas para SEFAZ
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notas Pendentes de Envio</CardTitle>
              <Button
                onClick={fetchNotes}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Carregando notas...
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Nenhuma nota em contingência</p>
                <p className="text-sm mt-2">
                  As notas que não puderam ser enviadas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Protocolo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(note.status)}
                            <span>{new Date(note.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{note.numero_nota}</TableCell>
                        <TableCell className="font-mono">{note.serie}</TableCell>
                        <TableCell>
                          {note.status === 'pending' && (
                            <span className="text-yellow-600 font-medium">Pendente</span>
                          )}
                          {note.status === 'sent' && (
                            <span className="text-green-600 font-medium">Enviado</span>
                          )}
                          {note.status === 'failed' && (
                            <span className="text-red-600 font-medium">Falhou</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {note.protocolo || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {note.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleRetry(note.id)}
                                disabled={retryingId === note.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <RefreshCw className={`h-4 w-4 mr-2 ${retryingId === note.id ? 'animate-spin' : ''}`} />
                                Reenviar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handlePrint(note)}
                              variant="outline"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCopyChave(note.chave_acesso)}
                              variant="outline"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadXML(note)}
                              variant="outline"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sim"
                              onClick={() => handleDelete(note.id)}
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Sobre Contingência</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Notas em contingência são armazenadas automaticamente quando a SEFAZ está offline</li>
                  <li>• Você pode reenviar notas em contingência quando a SEFAZ voltar a funcionar</li>
li>• O sistema gera automaticamente o QR Code e o XML da nota fiscal</li>
                  <li>• As notas em contingência são válidas por 30 dias</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContingency;
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import AdminSidebar from "@/components/AdminSidebar";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import {
 AlertCircle,
 Loader2,
 FileText,
 CheckCircle2,
 XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CancelledNote {
  id: number;
  model: "NFC-e" | "NF-e";
  sale_id: string;
  numero: number | null;
  serie: number | null;
  chave_acesso: string | null;
  protocolo: string | null;
  status: string;
  ambiente: string;
  data_emissao: string;
  data_cancelamento: string | null;
  total_amount: number;
  customer_name: string | null;
  motivo_cancelamento?: string;
}

const AdminCancelSales = () => {
  const { refreshData } = useAdmin();
  const [notes, setNotes] = useState<CancelledNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<CancelledNote | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchCancelledNotes = async () => {
    try {
      setLoading(true);

      const [nfceResponse, nfeResponse] = await Promise.all([
        fetch('/api/nfce'),
        fetch('/api/nfe'),
      ]);

      if (!nfceResponse.ok || !nfeResponse.ok) {
        throw new Error('Falha ao carregar notas canceladas');
      }

      const [nfceData, nfeData] = await Promise.all([
        nfceResponse.json(),
        nfeResponse.json(),
      ]);

      // Filtrar apenas notas canceladas
      const nfceCancelled: CancelledNote[] = (Array.isArray(nfceData) ? nfceData : [])
        .filter((note: any) => note.status === 'cancelada')
        .map((note: any) => ({
          ...note,
          model: "NFC-e" as const,
          fiscal_id: note.nfce_id,
        }));

      const nfeCancelled: CancelledNote[] = (Array.isArray(nfeData) ? nfeData : [])
        .filter((note: any) => note.status === 'cancelada')
        .map((note: any) => ({
          ...note,
          model: "NF-e" as const,
          fiscal_id: note.nfe_id,
        }));

      const allCancelled = [...nfceCancelled, ...nfeCancelled].sort(
        (a, b) => new Date(b.data_emissao || b.created_at).getTime() - new Date(a.data_emissao || a.created_at).getTime(),
      );

      setNotes(allCancelled);
    } catch (error) {
      console.error('Error fetching cancelled notes:', error);
      toast.error('Erro ao carregar notas canceladas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelledNotes();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const handleViewDetail = (note: CancelledNote) => {
    setSelectedNote(note);
    setIsDetailDialogOpen(true);
  };

  const handleDownloadXml = async (note: CancelledNote) => {
    try {
      const endpoint = note.model === "NF-e"
        ? `/api/nfe/xml/${note.fiscal_id}`
        : `/api/nfce/xml/${note.fiscal_id}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Falha ao baixar XML');
      }

      const xml = await response.blob();
      const url = window.URL.createObjectURL(xml);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${note.model === "NF-e" ? "nfe" : "nfce"}-${note.numero || note.fiscal_id}.xml`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
      toast.success(`XML da ${note.model} baixado com sucesso!`);
    } catch (error) {
      console.error('Error downloading fiscal XML:', error);
      toast.error('Erro ao baixar XML');
    }
  };

  return (
    <>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">
          <div className="mb-8">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <XCircle className="h-8 w-8 text-red-600" />
              Notas Canceladas
            </h1>
            <p className="mt-1 text-gray-600">
              Lista de NF-e e NFC-e com status cancelado
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais Canceladas ({notes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Carregando...
                </div>
              ) : notes.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-300" />
                  <p className="text-lg">Nenhuma nota cancelada encontrada</p>
                  <p className="mt-1 text-sm">As notas canceladas aparecerão aqui automaticamente.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Emissão</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Série</TableHead>
                        <TableHead>Chave de Acesso</TableHead>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Ambiente</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={`${note.model}-${note.fiscal_id}`}>
                          <TableCell className="whitespace-nowrap">
                            {formatDateTime(note.data_emissao || note.created_at)}
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
                          <TableCell className="font-mono text-sm">{note.numero || '—'}</TableCell>
                          <TableCell className="font-mono text-sm">{note.serie || '—'}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-gray-600">
                              {note.chave_acesso ? `${note.chave_acesso.slice(0, 20)}...` : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{note.protocolo || '—'}</TableCell>
                          <TableCell>{note.customer_name || 'Consumidor não identificado'}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(note.total_amount)}
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              note.ambiente === 'producao'
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {note.ambiente === 'producao' ? 'Produção' : 'Homologação'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(note)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadXml(note)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                XML
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

          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Informações importantes</h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>• Esta lista mostra apenas NF-e e NFC-e com status <strong>cancelado</strong>.</li>
                    <li>• O cancelamento foi realizado na SEFAZ e no sistema local.</li>
                    <li>• Use o botão "XML" para baixar o arquivo fiscal para contabilidade.</li>
                    <li>• Mantenha os XMLs de cancelamento armazenados por 5 anos conforme legislação.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Detalhes da Nota Cancelada */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Cancelada</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Modelo</p>
                  <p className="font-semibold">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      selectedNote.model === "NF-e"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {selectedNote.model}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Número / Série</p>
                  <p className="font-mono font-semibold">
                    {selectedNote.numero || '—'} / {selectedNote.serie || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Chave de Acesso</p>
                  <p className="font-mono text-xs break-all">
                    {selectedNote.chave_acesso || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Protocolo de Cancelamento</p>
                  <p className="font-mono font-semibold">{selectedNote.protocolo || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Data Emissão</p>
                  <p>{formatDateTime(selectedNote.data_emissao || selectedNote.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Data Cancelamento</p>
                  <p>{formatDateTime(selectedNote.data_cancelamento)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Ambiente</p>
                  <p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedNote.ambiente === 'producao'
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedNote.ambiente === 'producao' ? 'Produção' : 'Homologação'}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p>{selectedNote.customer_name || 'Consumidor não identificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-red-600">{formatCurrency(selectedNote.total_amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Venda ID</p>
                  <p className="font-mono text-sm">{selectedNote.sale_id}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCancelSales;
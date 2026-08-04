import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock3, Loader2, RefreshCw, TriangleAlert, WifiOff } from "lucide-react";
import { toast } from "sonner";

interface ContingencyNote {
  id: number;
  sale_id: string;
  numero: number | null;
  reason: string;
  status: "pending" | "processing" | "resolved";
  attempts: number;
  last_attempt_at: string | null;
  resolved_at: string | null;
  created_at: string;
  total_amount: number;
  customer_name: string | null;
}

const statusDetails = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  processing: { label: "Reenviando", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  resolved: { label: "Autorizada", className: "bg-green-100 text-green-800 hover:bg-green-100" },
};

const AdminContingency = () => {
  const [notes, setNotes] = useState<ContingencyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contingency");
      if (!response.ok) throw new Error("Falha ao carregar contingências");
      setNotes(await response.json());
    } catch (error) {
      console.error("Error loading contingency notes:", error);
      toast.error("Não foi possível carregar as notas em contingência");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const pendingCount = useMemo(
    () => notes.filter((note) => note.status !== "resolved").length,
    [notes],
  );

  const handleRetry = async (note: ContingencyNote) => {
    try {
      setRetryingId(note.id);
      const response = await fetch(`/api/contingency/${note.id}/retry`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.statusMessage || data.message || "Falha no reenvio");
      }
      toast.success(data.message || "NFC-e autorizada com sucesso");
      await loadNotes();
    } catch (error: any) {
      toast.error(error.message || "Não foi possível reenviar a NFC-e");
      await loadNotes();
    } finally {
      setRetryingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString("pt-BR") : "—";

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 min-h-screen flex-1 bg-gray-50 p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <WifiOff className="h-8 w-8 text-amber-600" />
              Contingência
            </h1>
            <p className="mt-1 text-gray-600">
              NFC-e não consolidadas aguardando comunicação com a SEFAZ
            </p>
          </div>
          <Button variant="outline" onClick={loadNotes} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-full bg-amber-100 p-3"><Clock3 className="h-6 w-6 text-amber-700" /></div>
              <div><p className="text-sm text-gray-500">Aguardando reenvio</p><p className="text-2xl font-bold">{pendingCount}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-full bg-green-100 p-3"><CheckCircle2 className="h-6 w-6 text-green-700" /></div>
              <div><p className="text-sm text-gray-500">Resolvidas</p><p className="text-2xl font-bold">{notes.filter((note) => note.status === "resolved").length}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-full bg-blue-100 p-3"><RefreshCw className="h-6 w-6 text-blue-700" /></div>
              <div><p className="text-sm text-gray-500">Tentativas realizadas</p><p className="text-2xl font-bold">{notes.reduce((sum, note) => sum + Number(note.attempts || 0), 0)}</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas em contingência</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
              </div>
            ) : notes.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-300" />
                <p className="text-lg font-medium text-gray-700">Nenhuma nota em contingência</p>
                <p className="mt-1 text-sm">Falhas de comunicação com a SEFAZ aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Venda / NFC-e</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tentativas</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notes.map((note) => {
                      const status = statusDetails[note.status] || statusDetails.pending;
                      const isRetrying = retryingId === note.id;
                      return (
                        <TableRow key={note.id}>
                          <TableCell className="whitespace-nowrap">{formatDate(note.created_at)}</TableCell>
                          <TableCell>
                            <p className="font-medium">Venda #{note.sale_id}</p>
                            <p className="text-xs text-gray-500">NFC-e {note.numero || "—"}</p>
                          </TableCell>
                          <TableCell>{note.customer_name || "Consumidor não identificado"}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">{formatCurrency(note.total_amount)}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex items-start gap-2 text-sm text-red-700">
                              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                              <span className="break-words">{note.reason || "Falha de comunicação não informada"}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge className={status.className}>{status.label}</Badge></TableCell>
                          <TableCell>
                            <p>{note.attempts || 0}</p>
                            {note.last_attempt_at && <p className="whitespace-nowrap text-xs text-gray-500">{formatDate(note.last_attempt_at)}</p>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleRetry(note)}
                              disabled={note.status === "resolved" || isRetrying}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {isRetrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                              {note.status === "resolved" ? "Concluída" : "Reenviar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminContingency;

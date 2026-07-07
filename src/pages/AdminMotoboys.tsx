import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Bike,
  Phone,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface Motoboy {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

const AdminMotoboys = () => {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const fetchMotoboys = async () => {
    try {
      const response = await fetch('/api/motoboys');
      if (response.ok) {
        const data = await response.json();
        setMotoboys(data);
      }
    } catch (error) {
      console.error('Error fetching motoboys:', error);
    }
  };

  useEffect(() => {
    fetchMotoboys();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMotoboy) {
        const response = await fetch(`/api/motoboys/${editingMotoboy.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Motoboy atualizado com sucesso!');
          fetchMotoboys();
        }
      } else {
        const response = await fetch('/api/motoboys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `moto-${Date.now()}`,
            ...formData,
          }),
        });

        if (response.ok) {
          toast.success('Motoboy cadastrado com sucesso!');
          fetchMotoboys();
        }
      }
      
      setIsDialogOpen(false);
      setEditingMotoboy(null);
      setFormData({ name: "", phone: "" });
    } catch (error) {
      toast.error('Erro ao salvar motoboy');
    }
  };

  const handleEdit = (motoboy: Motoboy) => {
    setEditingMotoboy(motoboy);
    setFormData({ name: motoboy.name, phone: motoboy.phone });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este motoboy?")) {
      try {
        const response = await fetch(`/api/motoboys/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Motoboy excluído com sucesso!');
          fetchMotoboys();
        }
      } catch (error) {
        toast.error('Erro ao excluir motoboy');
      }
    }
  };

  const filteredMotoboys = motoboys.filter((motoboy) =>
    motoboy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motoboy.phone.includes(searchTerm)
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Motoboys</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingMotoboy(null);
                    setFormData({ name: "", phone: "" });
                  }}
                  className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Motoboy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMotoboy ? "Editar Motoboy" : "Novo Motoboy"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-600">
                    {editingMotoboy ? "Atualizar" : "Cadastrar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Motoboys
              </CardTitle>
              <div className="p-2 rounded-full bg-orange-500">
                <Bike className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{motoboys.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Disponíveis
              </CardTitle>
              <div className="p-2 rounded-full bg-green-500">
                <Phone className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{motoboys.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Motoboys List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Motoboys</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMotoboys.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum motoboy encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Tente buscar com outro termo</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMotoboys.map((motoboy) => (
                  <div
                    key={motoboy.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <Bike className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{motoboy.name}</p>
                        {motoboy.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {motoboy.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(motoboy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(motoboy.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMotoboys;
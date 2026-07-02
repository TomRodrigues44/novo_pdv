import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
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
  Power,
  PowerOff,
} from "lucide-react";
import { Category } from "@/types/product";

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", icon: "" });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria? Todos os produtos desta categoria também serão excluídos.")) {
      deleteCategory(id);
    }
  };

  const handleToggleActive = (category: Category) => {
    updateCategory(category.id, { active: !category.active });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", icon: "" });
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Salgados"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ícone (Emoji)
                  </label>
                  <Input
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="Ex: 🥟"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-orange-600">
                  {editingCategory ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className={!category.active ? "opacity-50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(category)}
                  >
                    {category.active ? (
                      <Power className="h-5 w-5 text-green-600" />
                    ) : (
                      <PowerOff className="h-5 w-5 text-red-600" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
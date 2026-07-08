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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Package,
  FileText,
  Search,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Product, FiscalInfo } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, updateStock } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "10",
    // Fiscal info
    ncm: "",
    cfop: "",
    cest: "",
    unidade: "UN",
    icms: "17",
    ipi: "0",
    pis: "0.65",
    cofins: "3",
    origem: "0",
    codigoBarras: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const result = await response.json();
      
      if (result.success && result.url) {
        setFormData({ ...formData, image: result.url });
        setImagePreview(result.url);
        toast.success('Imagem carregada com sucesso!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar a imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fiscalInfo: FiscalInfo = {
      ncm: formData.ncm,
      cfop: formData.cfop,
      cest: formData.cest,
      unidade: formData.unidade,
      icms: parseFloat(formData.icms),
      ipi: parseFloat(formData.ipi),
      pis: parseFloat(formData.pis),
      cofins: parseFloat(formData.cofins),
      origem: parseInt(formData.origem),
      codigoBarras: formData.codigoBarras || undefined,
    };

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      stock: parseInt(formData.stock),
      available: parseInt(formData.stock) > 0,
      fiscal: fiscalInfo,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      stock: "10",
      ncm: "",
      cfop: "",
      cest: "",
      unidade: "UN",
      icms: "17",
      ipi: "0",
      pis: "0.65",
      cofins: "3",
      origem: "0",
      codigoBarras: "",
    });
    setImagePreview(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      stock: String(product.stock || 10),
      ncm: product.fiscal?.ncm || "",
      cfop: product.fiscal?.cfop || "",
      cest: product.fiscal?.cest || "",
      unidade: product.fiscal?.unidade || "UN",
      icms: String(product.fiscal?.icms || "17"),
      ipi: String(product.fiscal?.ipi || "0"),
      pis: String(product.fiscal?.pis || "0.65"),
      cofins: String(product.fiscal?.cofins || "3"),
      origem: String(product.fiscal?.origem || "0"),
      codigoBarras: product.fiscal?.codigoBarras || "",
    });
    setImagePreview(product.image || null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduct(id);
    }
  };

  const handleToggleAvailable = (product: Product) => {
    updateProduct(product.id, { available: !product.available });
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    updateStock(productId, newStock);
  };

  // Filtrar produtos por termo de busca
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar produtos por categoria
  const productsByCategory = categories.reduce((acc, category) => {
    const categoryProducts = filteredProducts.filter(
      (product) => product.category === category.id
    );
    if (categoryProducts.length > 0) {
      acc[category.id] = {
        category,
        products: categoryProducts,
      };
    }
    return acc;
  }, {} as Record<string, { category: typeof categories[0]; products: Product[] }>);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                      <TabsTrigger value="fiscal">Informações Fiscais</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Nome
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Ex: Coxinha de Frango"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Preço
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: e.target.value })
                            }
                            placeholder="Ex: 8.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Descrição
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Descrição do produto"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Categoria
                          </label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Estoque
                          </label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) =>
                              setFormData({ ...formData, stock: e.target.value })
                            }
                            placeholder="Ex: 10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Imagem do Produto
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="hidden"
                                id="image-upload"
                              />
                              <label
                                htmlFor="image-upload"
                                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                              >
                                {uploadingImage ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                                    <span>Carregando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" />
                                    <span>Carregar Imagem</span>
                                  </>
                                )}
                              </label>
                            </div>
                            {imagePreview && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          {imagePreview ? (
                            <div className="mt-3">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          ) : (
                            <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                Nenhuma imagem selecionada
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="fiscal" className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900">Informações Fiscais</h4>
                            <p className="text-sm text-blue-700">
                              Dados necessários para emissão de Nota Fiscal e Cupom Fiscal conforme SEFAZ-RR
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            NCM
                          </label>
                          <Input
                            value={formData.ncm}
                            onChange={(e) =>
                              setFormData({ ...formData, ncm: e.target.value })
                            }
                            placeholder="Ex: 1905.90.00"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Nomenclatura Comum do Mercosul</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            CFOP
                          </label>
                          <Input
                            value={formData.cfop}
                            onChange={(e) =>
                              setFormData({ ...formData, cfop: e.target.value })
                            }
                            placeholder="Ex: 5102"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Código Fiscal de Operações</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            CEST
                          </label>
                          <Input
                            value={formData.cest}
                            onChange={(e) =>
                              setFormData({ ...formData, cest: e.target.value })
                            }
                            placeholder="Ex: 0301400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Código Especificador da Substituição Tributária</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Unidade
                          </label>
                          <Select
                            value={formData.unidade}
                            onValueChange={(value) =>
                              setFormData({ ...formData, unidade: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UN">UN - Unidade</SelectItem>
                              <SelectItem value="KG">KG - Quilograma</SelectItem>
                              <SelectItem value="LT">LT - Litro</SelectItem>
                              <SelectItem value="CX">CX - Caixa</SelectItem>
                              <SelectItem value="PCT">PCT - Pacote</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            ICMS (%)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.icms}
                            onChange={(e) =>
                              setFormData({ ...formData, icms: e.target.value })
                            }
                            placeholder="Ex: 17"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            IPI (%)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.ipi}
                            onChange={(e) =>
                              setFormData({ ...formData, ipi: e.target.value })
                            }
                            placeholder="Ex: 0"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            PIS (%)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.pis}
                            onChange={(e) =>
                              setFormData({ ...formData, pis: e.target.value })
                            }
                            placeholder="Ex: 0.65"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            COFINS (%)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.cofins}
                            onChange={(e) =>
                              setFormData({ ...formData, cofins: e.target.value })
                            }
                            placeholder="Ex: 3"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Origem
                          </label>
                          <Select
                            value={formData.origem}
                            onValueChange={(value) =>
                              setFormData({ ...formData, origem: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0 - Nacional</SelectItem>
                              <SelectItem value="1">1 - Importada</SelectItem>
                              <SelectItem value="2">2 - Nacional com conteúdo importado</SelectItem>
                              <SelectItem value="3">3 - Nacional com processo produtivo básico</SelectItem>
                              <SelectItem value="4">4 - Nacional com conteúdo importado {'>'} 40%</SelectItem>
                              <SelectItem value="5">5 - Nacional com conteúdo importado {'>'} 70%</SelectItem>
                              <SelectItem value="6">6 - Estrangeira importada direta</SelectItem>
                              <SelectItem value="7">7 - Estrangeira adquirida no mercado interno</SelectItem>
                              <SelectItem value="8">8 - Nacional com conteúdo importado {'<'} 40%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Código de Barras (EAN)
                          </label>
                          <Input
                            value={formData.codigoBarras}
                            onChange={(e) =>
                              setFormData({ ...formData, codigoBarras: e.target.value })
                            }
                            placeholder="Ex: 7891234567890"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button type="submit" className="w-full bg-orange-600">
                    {editingProduct ? "Atualizar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products grouped by category */}
        {Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nenhum produto encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-2">Tente buscar com outro termo</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([categoryId, { category, products: categoryProducts }]) => (
              <div key={categoryId} className="bg-white rounded-xl border-2 border-orange-200 overflow-hidden">
                {/* Category Header with Stripe */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-orange-100 text-sm">{categoryProducts.length} produto(s)</p>
                    </div>
                  </div>
                </div>
                
                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => {
                      // Garantir que o preço seja um número
                      const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price));
                      const stock = typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock || 0));
                      
                      return (
                        <Card
                          key={product.id}
                          className={!product.available ? "opacity-50" : ""}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {product.image && product.image.startsWith('/products/') ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="text-4xl">{product.image}</span>
                                )}
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-orange-600 font-bold">
                                    R$ {price.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleAvailable(product)}
                              >
                                {product.available ? (
                                  <Power className="h-5 w-5 text-green-600" />
                                ) : (
                                  <PowerOff className="h-5 w-5 text-red-600" />
                                )}
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            {product.fiscal && (
                              <div className="bg-gray-50 rounded p-2 mb-4 text-xs">
                                <p><strong>NCM:</strong> {product.fiscal.ncm}</p>
                                <p><strong>CFOP:</strong> {product.fiscal.cfop}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-4">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Estoque:{" "}
                                <Input
                                  type="number"
                                  value={stock}
                                  onChange={(e) =>
                                    handleStockUpdate(product.id, parseInt(e.target.value))
                                  }
                                  className="w-20 h-8"
                                />
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
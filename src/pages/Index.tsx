import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { CartPanel } from '@/components/CartPanel';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ImportDataDialog } from '@/components/ImportDataDialog';
import { Store, Clock, Loader2, Database, HardDrive, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Category } from '@/types';
import { localStorageUtils } from '@/utils/localStorage';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('API error');
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data from database, using localStorage:', error);
        // Fallback to localStorage
        const localProducts = localStorageUtils.getProducts();
        const localCategories = localStorageUtils.getCategories();
        setProducts(localProducts);
        setCategories(localCategories);
        setUsingLocalStorage(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products.filter((p) => p.available)
    : products.filter((product) => product.category_name === selectedCategory && product.available);

  const handleImport = () => {
    // Reload data from localStorage after import
    const localProducts = localStorageUtils.getProducts();
    const localCategories = localStorageUtils.getCategories();
    setProducts(localProducts);
    setCategories(localCategories);
    setUsingLocalStorage(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-full">
                <Store className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Empório das Coxinhas</h1>
                <p className="text-orange-100 text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Aberto agora • PDV Sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {usingLocalStorage ? (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/50 rounded-lg px-3 py-2 text-sm">
                  <HardDrive className="h-4 w-4" />
                  <span>Modo Local</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/50 rounded-lg px-3 py-2 text-sm">
                  <Database className="h-4 w-4" />
                  <span>Banco de Dados</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhum produto encontrado nesta categoria</p>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CartPanel />
            </div>
          </div>
        </div>
      </div>

      <ImportDataDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
    </div>
  );
};

export default Index;
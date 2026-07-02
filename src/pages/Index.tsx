import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { CartPanel } from '@/components/CartPanel';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Store, Clock, Loader2, Database, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Category } from '@/types';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const { addToCart } = useCart();
  
  // Usar hooks do React Query
  const { products, isLoading: productsLoading, error: productsError, invalidateProducts } = useProducts();
  const { categories, isLoading: categoriesLoading, error: categoriesError, invalidateCategories } = useCategories();

  const isLoading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  const fetchData = async () => {
    try {
      invalidateProducts();
      invalidateCategories();
      setUsingLocalStorage(false);
      toast.success('Dados atualizados do banco de dados!');
    } catch (err) {
      console.error('Error fetching data from database:', err);
      
      // Tentar usar localStorage como fallback
      const localProducts = localStorage.getItem('admin_products');
      const localCategories = localStorage.getItem('admin_categories');
      
      if (localProducts || localCategories) {
        setUsingLocalStorage(true);
        toast.warning('Usando dados em cache. Tente recarregar a página.', {
          action: {
            label: 'Recarregar',
            onClick: () => fetchData()
          }
        });
      } else {
        toast.error('Erro ao carregar produtos. Por favor, recarregue a página.');
      }
    }
  };

  // Limpar localStorage ao carregar a página pela primeira vez
  useEffect(() => {
    localStorage.removeItem('admin_products');
    localStorage.removeItem('admin_categories');
    localStorage.removeItem('admin_sales');
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products.filter((p) => p.available)
    : products.filter((product) => product.category === selectedCategory && product.available);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados</p>
          <Button onClick={() => fetchData()}>Tentar novamente</Button>
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
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-2 text-sm">
                  <HardDrive className="h-4 w-4" />
                  <span>Modo Cache</span>
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
                onClick={() => {
                  localStorage.removeItem('admin_products');
                  localStorage.removeItem('admin_categories');
                  localStorage.removeItem('admin_sales');
                  fetchData();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
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
    </div>
  );
};

export default Index;
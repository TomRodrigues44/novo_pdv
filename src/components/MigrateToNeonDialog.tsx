import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MigrateToNeonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMigrate: () => void;
}

export const MigrateToNeonDialog = ({ open, onOpenChange, onMigrate }: MigrateToNeonDialogProps) => {
  const [step, setStep] = useState<'idle' | 'categories' | 'products' | 'sales' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const migrateCategories = async () => {
    try {
      const localCategories = localStorage.getItem('admin_categories');
      if (!localCategories) {
        toast.info('Nenhuma categoria encontrada no localStorage');
        return 0;
      }

      const categories = JSON.parse(localCategories);
      const response = await fetch('/api/migrate/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
      });

      if (!response.ok) {
        throw new Error('Erro ao migrar categorias');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error migrating categories:', error);
      throw error;
    }
  };

  const migrateProducts = async () => {
    try {
      const localProducts = localStorage.getItem('admin_products');
      if (!localProducts) {
        toast.info('Nenhum produto encontrado no localStorage');
        return 0;
      }

      const products = JSON.parse(localProducts);
      const response = await fetch('/api/migrate/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error('Erro ao migrar produtos');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error migrating products:', error);
      throw error;
    }
  };

  const migrateSales = async () => {
    try {
      const localSales = localStorage.getItem('admin_sales');
      if (!localSales) {
        toast.info('Nenhuma venda encontrada no localStorage');
        return 0;
      }

      const sales = JSON.parse(localSales);
      const response = await fetch('/api/migrate/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sales),
      });

      if (!response.ok) {
        throw new Error('Erro ao migrar vendas');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error migrating sales:', error);
      throw error;
    }
  };

  const handleMigrate = async () => {
    setError(null);
    setProgress(0);

    try {
      // Migrar categorias
      setStep('categories');
      setProgress(10);
      const categoriesCount = await migrateCategories();
      setProgress(30);
      toast.success(`${categoriesCount} categorias migradas`);

      // Migrar produtos
      setStep('products');
      setProgress(40);
      const productsCount = await migrateProducts();
      setProgress(70);
      toast.success(`${productsCount} produtos migrados`);

      // Migrar vendas
      setStep('sales');
      setProgress(80);
      const salesCount = await migrateSales();
      setProgress(100);
      toast.success(`${salesCount} vendas migradas`);

      setStep('done');
      toast.success('Migração concluída com sucesso!');
      
      setTimeout(() => {
        onMigrate();
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Migration error:', error);
      setError('Erro durante a migração. Verifique o console para detalhes.');
      toast.error('Erro na migração');
    }
  };

  const getStepLabel = () => {
    switch (step) {
      case 'idle': return 'Pronto para migrar';
      case 'categories': return 'Migrando categorias...';
      case 'products': return 'Migrando produtos...';
      case 'sales': return 'Migrando vendas...';
      case 'done': return 'Migração concluída!';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'idle': return <Database className="h-5 w-5" />;
      case 'categories':
      case 'products':
      case 'sales': return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'done': return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migrar para Neon Database
          </DialogTitle>
          <DialogDescription>
            Transferir todos os dados do localStorage para o banco de dados Neon.
            Isso não apagará seus dados locais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                {getStepIcon()}
                {getStepLabel()}
              </span>
              {step !== 'idle' && step !== 'done' && (
                <span className="text-gray-500">{progress}%</span>
              )}
            </div>
            {step !== 'idle' && step !== 'done' && (
              <Progress value={progress} className="h-2" />
            )}
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${step === 'categories' || step === 'products' || step === 'sales' || step === 'done' ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className="h-4 w-4" />
              Categorias
            </div>
            <div className={`flex items-center gap-2 text-sm ${step === 'products' || step === 'sales' || step === 'done' ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className="h-4 w-4" />
              Produtos
            </div>
            <div className={`flex items-center gap-2 text-sm ${step === 'sales' || step === 'done' ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle className="h-4 w-4" />
              Vendas
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={step !== 'idle' && step !== 'done'}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={handleMigrate}
              disabled={step !== 'idle'}
            >
              {step === 'idle' ? 'Iniciar Migração' : 'Migrando...'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
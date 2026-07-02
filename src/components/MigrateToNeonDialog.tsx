import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sql } from '@/lib/db';

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
      let migrated = 0;

      for (const cat of categories) {
        try {
          await sql`
            INSERT INTO categories (id, name, icon, active)
            VALUES (${cat.id}, ${cat.name}, ${cat.icon}, ${cat.active ?? true})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              icon = EXCLUDED.icon,
              active = EXCLUDED.active
          `;
          migrated++;
        } catch (err) {
          console.error('Error migrating category:', cat, err);
        }
      }

      return migrated;
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
      let migrated = 0;

      for (const prod of products) {
        try {
          await sql`
            INSERT INTO products (
              id, name, description, price, category, category_name,
              image, available, stock, fiscal
            )
            VALUES (
              ${prod.id},
              ${prod.name},
              ${prod.description || null},
              ${prod.price},
              ${prod.category},
              ${null},
              ${prod.image},
              ${prod.available ?? true},
              ${prod.stock ?? 0},
              ${prod.fiscal ? JSON.stringify(prod.fiscal) : null}::jsonb
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              price = EXCLUDED.price,
              category = EXCLUDED.category,
              image = EXCLUDED.image,
              available = EXCLUDED.available,
              stock = EXCLUDED.stock,
              fiscal = EXCLUDED.fiscal,
              updated_at = CURRENT_TIMESTAMP
          `;
          migrated++;
        } catch (err) {
          console.error('Error migrating product:', prod, err);
        }
      }

      return migrated;
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
      let migrated = 0;

      for (const sale of sales) {
        try {
          // Criar a venda
          const saleResult = await sql`
            INSERT INTO sales (total_amount, payment_method, freight, created_at)
            VALUES (${sale.total}, ${sale.payments?.[0]?.type || 'cash'}, ${sale.freight || 0}, ${sale.date})
            RETURNING id
          `;

          const saleId = saleResult[0].id;

          // Criar os itens da venda
          for (const item of sale.items) {
            await sql`
              INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, flavors)
              VALUES (
                ${saleId},
                ${item.id},
                ${item.name},
                ${item.quantity},
                ${item.price},
                ${item.flavors ? JSON.stringify(item.flavors) : null}::jsonb
              )
            `;
          }

          migrated++;
        } catch (err) {
          console.error('Error migrating sale:', sale, err);
        }
      }

      return migrated;
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
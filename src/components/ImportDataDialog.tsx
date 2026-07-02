import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { localStorageUtils } from '@/utils/localStorage';

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: () => void;
}

export const ImportDataDialog = ({ open, onOpenChange, onImport }: ImportDataDialogProps) => {
  const [productsData, setProductsData] = useState('');
  const [categoriesData, setCategoriesData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    if (!productsData && !categoriesData) {
      toast.error('Cole pelo menos os dados de produtos ou categorias');
      return;
    }

    setIsImporting(true);
    let success = true;

    if (productsData) {
      if (!localStorageUtils.importProducts(productsData)) {
        toast.error('Erro ao importar produtos');
        success = false;
      }
    }

    if (categoriesData) {
      if (!localStorageUtils.importCategories(categoriesData)) {
        toast.error('Erro ao importar categorias');
        success = false;
      }
    }

    if (success) {
      toast.success('Dados importados com sucesso!');
      onImport();
      onOpenChange(false);
      setProductsData('');
      setCategoriesData('');
    }

    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Dados do LocalStorage</DialogTitle>
          <DialogDescription>
            Cole os dados do localStorage aqui para restaurar seus produtos e categorias.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="products">Dados dos Produtos (JSON)</Label>
            <Textarea
              id="products"
              placeholder='[{"id": 1, "name": "Coxinha", ...}]'
              value={productsData}
              onChange={(e) => setProductsData(e.target.value)}
              rows={5}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categories">Dados das Categorias (JSON)</Label>
            <Textarea
              id="categories"
              placeholder='[{"id": 1, "name": "Coxinhas", ...}]'
              value={categoriesData}
              onChange={(e) => setCategoriesData(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                <>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                <>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
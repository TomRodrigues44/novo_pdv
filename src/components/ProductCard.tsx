import { Product } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-4xl">🥟</span>
        </div>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">
            R$ {Number(product.price).toFixed(2)}
          </span>
          {product.category_name && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {product.category_name}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={!product.available}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};
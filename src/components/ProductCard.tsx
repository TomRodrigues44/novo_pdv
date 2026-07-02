import { useState } from "react";
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FlavorDialog } from "./FlavorDialog";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, flavors?: string[]) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isFlavorDialogOpen, setIsFlavorDialogOpen] = useState(false);

  const handleAddToCart = () => {
    // Se for da categoria salgados, abrir modal de sabores
    if (product.category === "salgados") {
      setIsFlavorDialogOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleFlavorConfirm = (flavors: string[]) => {
    onAddToCart(product, flavors);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 hover:border-orange-400">
        <CardContent className="p-4">
          <div className="text-6xl text-center mb-4">{product.image}</div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-600">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={!product.available}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </CardFooter>
      </Card>

      <FlavorDialog
        open={isFlavorDialogOpen}
        onClose={() => setIsFlavorDialogOpen(false)}
        onConfirm={handleFlavorConfirm}
        productName={product.name}
      />
    </>
  );
};
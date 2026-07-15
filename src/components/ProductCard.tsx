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

  // Garantir que o preço seja um número
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price));

  // Verificar se é uma imagem real (começa com /products/) ou emoji
  const isRealImage = product.image && product.image.startsWith('/products/');

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 hover:border-orange-400 flex flex-col cursor-pointer"
        onClick={handleAddToCart}
      >
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Container de Imagem com tamanho fixo e ajuste automático */}
          <div className="w-full h-40 mb-4 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            {isRealImage ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-5xl">{product.image}</span>
            )}
          </div>
          
          <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{product.description}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-orange-600">
              R$ {price.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
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
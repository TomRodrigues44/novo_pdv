import { CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemComponent = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-3xl">{item.image}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.name}</h4>
        <p className="text-sm text-orange-600 font-medium">
          R$ {item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-gray-800">
          R$ {(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
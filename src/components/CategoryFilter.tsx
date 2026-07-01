import { categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        onClick={() => onSelectCategory("all")}
        variant={selectedCategory === "all" ? "default" : "outline"}
        className={cn(
          "whitespace-nowrap",
          selectedCategory === "all"
            ? "bg-orange-500 hover:bg-orange-600 text-white"
            : "border-orange-300 text-orange-700 hover:bg-orange-50"
        )}
      >
        🍽️ Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className={cn(
            "whitespace-nowrap",
            selectedCategory === category.id
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "border-orange-300 text-orange-700 hover:bg-orange-50"
          )}
        >
          {category.icon} {category.name}
        </Button>
      ))}
    </div>
  );
};
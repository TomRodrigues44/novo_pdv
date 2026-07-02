import { Category } from '@/types';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onSelectCategory('all')}
        className={selectedCategory === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}
      >
        🛒 Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.name)}
          className={
            selectedCategory === category.name ? 'bg-orange-600 hover:bg-orange-700' : ''
          }
        >
          {category.icon} {category.name}
        </Button>
      ))}
    </div>
  );
};
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FilterableDropdownProps {
  placeholder: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  showSearch?: boolean;
}

export const FilterableDropdown = ({
  placeholder,
  options,
  value,
  onChange,
  className,
  showSearch = true,
}: FilterableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedOption(null);
    onChange(null);
    setSearchTerm('');
  };

  useEffect(() => {
    if (value) {
      setSelectedOption(value);
    }
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between',
            className,
            selectedOption ? 'border-blue-400' : 'border-gray-300'
          )}
        >
          <span>{selectedOption ? options.find((o) => o.value === selectedOption)?.label : placeholder}</span>
          {selectedOption ? (
            <Button variant="ghost" size="icon" onClick={handleClear} className="h-4 w-4">
              <X className="h-3 w-3" />
            </Button>
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full" align="start">
        {showSearch && (
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none outline-none flex-1"
                onFocus={() => setIsOpen(true)}
              />
            </div>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum item'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100',
                  selectedOption === option.value && 'bg-blue-50 text-blue-600'
                )}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{option.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
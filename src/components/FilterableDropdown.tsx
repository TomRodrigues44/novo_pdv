import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FilterableDropdownProps {
  placeholder?: string;
  options: { value: string; label: string; subLabel?: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  noResultsMessage?: string;
}

export const FilterableDropdown = ({
  placeholder = 'Selecione...',
  options,
  value,
  onChange,
  className,
  disabled = false,
  searchPlaceholder = 'Digite para buscar...',
  noResultsMessage = 'Nenhum resultado encontrado',
}: FilterableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(term) ||
      opt.value.toLowerCase().includes(term) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions.length, searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
  };

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const clearSelection = () => {
    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen && newValue.trim()) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (!disabled && (searchTerm.trim() || options.length > 0)) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clique nas opções
    setTimeout(() => {
      if (isOpen) {
        // Não fecha imediatamente, deixa o mousedown handler cuidar
      }
    }, 200);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
    >
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            className={cn(
              'pl-9 pr-10',
              isOpen ? 'border-orange-500 ring-1 ring-orange-500' : '',
              disabled ? 'bg-gray-100 cursor-not-allowed' : '',
              (value || searchTerm) ? 'bg-white' : ''
            )}
            placeholder={placeholder}
            value={searchTerm || (selectedOption ? selectedOption.label : '')}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            readOnly={!searchTerm && !!value} // Se tem valor selecionado e não está buscando, mostra só o label
            autoComplete="off"
          />
          {(value || searchTerm) && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={clearSelection}
              onMouseDown={(e) => e.preventDefault()} // Previne blur do input
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400"
              onClick={() => setIsOpen(!isOpen)}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={isOpen ? 'Fechar lista' : 'Abrir lista'}
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </Button>
          )}
        </div>

        {/* Dropdown List - Aparece automaticamente quando há resultados filtrados */}
        {(isOpen || (searchTerm.trim() && filteredOptions.length > 0)) && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm.trim() ? noResultsMessage : 'Nenhum cliente cadastrado'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    index === highlightedIndex
                      ? 'bg-orange-50 text-orange-900'
                      : 'hover:bg-gray-50 text-gray-900',
                    value === option.value && 'font-semibold bg-orange-50 text-orange-900'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      index === highlightedIndex || value === option.value
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{option.label}</p>
                      {option.subLabel && (
                        <p className="truncate text-xs text-gray-500">{option.subLabel}</p>
                      )}
                    </div>
                    {value === option.value && (
                      <span className="text-xs text-orange-600 font-medium">Selecionado</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
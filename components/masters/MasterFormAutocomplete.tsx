'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

interface AutocompleteOption {
  value: string;
  label: string;
  id?: number;
}

interface MasterFormAutocompleteProps {
  value: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  onSearch: (text: string) => void;  // Now required
  options: AutocompleteOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function MasterFormAutocomplete({
  value,
  onChange,
  onSearch,
  options = [],
  placeholder = 'Search...',
  label,
  required = false,
  theme = 'light',
  isLoading = false,
  error,
  disabled = false,
}: MasterFormAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search text change - trigger API call
  const handleInputChange = (text: string) => {
    onChange(text);
    setIsOpen(true);
    setHighlightedIndex(0);
    
    // Trigger API search
    onSearch(text);
  };

  // Handle option selection
  const handleSelectOption = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-4 pr-10 py-2.5 rounded-lg border text-sm
              transition-all duration-200
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              }
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            disabled={disabled}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className={`
              absolute z-50 w-full mt-1 rounded-lg shadow-lg border overflow-hidden
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
              }
            `}
          >
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                  <span className={`ml-2 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Searching...
                  </span>
                </div>
              ) : options.length === 0 ? (
                <div className={`py-8 text-center text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {value.length > 0 
                    ? 'No results found' 
                    : 'Start typing to search...'}
                </div>
              ) : (
                <div className="py-1">
                  {options.map((option, index) => (
                    <button
                      key={option.id || option.value}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        w-full px-4 py-2.5 text-left flex items-center justify-between
                        transition-colors text-sm
                        ${highlightedIndex === index
                          ? theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-teal-50'
                          : ''
                        }
                        ${theme === 'dark'
                          ? 'hover:bg-gray-700 text-white'
                          : 'hover:bg-teal-50 text-gray-900'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{option.label}</div>
                        <div className={`text-xs truncate ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Code: {option.value}
                        </div>
                      </div>
                      {value === option.value && (
                        <Check className="w-4 h-4 text-teal-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results count */}
            {!isLoading && options.length > 0 && (
              <div className={`
                px-4 py-2 border-t text-xs
                ${theme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
                }
              `}>
                {options.length} result{options.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
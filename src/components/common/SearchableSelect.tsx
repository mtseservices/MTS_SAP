import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  category?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: (SearchableOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  allowCustom?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  clearable = false,
  allowCustom = false,
  label,
  error,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options
  const normalizedOptions: SearchableOption[] = options.map((opt) =>
    typeof opt === 'string'
      ? { value: opt, label: opt }
      : opt
  );

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const labelMatch = opt.label.toLowerCase().includes(query);
    const sublabelMatch = opt.sublabel?.toLowerCase().includes(query);
    const valueMatch = opt.value.toLowerCase().includes(query);
    const categoryMatch = opt.category?.toLowerCase().includes(query);
    return labelMatch || sublabelMatch || valueMatch || categoryMatch;
  });

  // Find currently selected option object
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (isOpen && allowCustom && searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  // Group options by category if applicable
  const hasCategories = filteredOptions.some((opt) => opt.category);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Trigger Button */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3 py-2 border text-sm rounded-lg cursor-pointer transition-colors select-none ${
          disabled
            ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700 cursor-not-allowed'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 text-gray-900 dark:text-white'
            : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-600'
        } ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={`truncate ${!selectedOption && !value ? 'text-gray-400 dark:text-gray-500' : ''}`}>
            {selectedOption ? selectedOption.label : value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Live Search Input Box */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-2.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                No matching results found
                {allowCustom && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchQuery.trim())}
                    className="mt-2 block w-full px-2 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-md hover:bg-indigo-100"
                  >
                    Use &quot;{searchQuery.trim()}&quot;
                  </button>
                )}
              </div>
            ) : !hasCategories ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value + idx}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                        : isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300'
                        : isHighlighted
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                );
              })
            ) : (
              // Grouped by Category
              Object.entries(
                filteredOptions.reduce((acc, opt) => {
                  const cat = opt.category || 'General';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(opt);
                  return acc;
                }, {} as Record<string, SearchableOption[]>)
              ).map(([categoryName, groupOptions]) => (
                <div key={categoryName} className="mb-2">
                  <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-slate-800/40 rounded">
                    {categoryName}
                  </div>
                  {groupOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => !opt.disabled && handleSelect(opt.value)}
                        className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                          opt.disabled
                            ? 'opacity-50 cursor-not-allowed text-gray-400'
                            : isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="truncate">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

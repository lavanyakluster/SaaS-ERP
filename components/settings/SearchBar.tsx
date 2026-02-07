/**
 * Search Bar Component
 * Reusable search input
 */

import { Search } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme-store';
import { memo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={`relative ${className}`}>
      <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-11 pr-4 py-2.5 rounded-lg border transition-all ${
          isDark
            ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
        } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
      />
    </div>
  );
});
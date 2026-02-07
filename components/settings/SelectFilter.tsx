/**
 * Select Filter Component
 * Dropdown select for filtering
 */

import { ChevronDown } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme-store';
import { memo } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const SelectFilter = memo(function SelectFilter({
  value,
  onChange,
  options,
  className = '',
}: SelectFilterProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-4 pr-10 py-2.5 rounded-lg border font-semibold text-sm transition-all cursor-pointer appearance-none ${
          isDark
            ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
            : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'
        } focus:outline-none`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`} />
    </div>
  );
});
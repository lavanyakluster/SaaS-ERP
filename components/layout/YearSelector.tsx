'use client';

/**
 * Year Selector Component
 * Dropdown to select fiscal year
 * Appears when organization is selected
 * Auto-selects latest year if nothing is selected
 */

import { useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useYears, getLatestYear } from '@/lib/hooks/useYears';

export function YearSelector() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const selectedOrganization = useAuthStore((state) => state.selectedOrganization);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const setSelectedYear = useAuthStore((state) => state.setSelectedYear);

  // Fetch years list
  const { data: years, isLoading } = useYears();

  // Auto-select latest year when years are loaded and no year is selected
  useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      const latestYear = getLatestYear(years);
      if (latestYear) {
        console.log('📅 Auto-selecting latest year:', latestYear);
        setSelectedYear(latestYear);
      }
    }
  }, [years, selectedYear, setSelectedYear]);

  // Don't show if no organization is selected
  if (!selectedOrganization) {
    return null;
  }

  return (
    <div className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
      isDark
        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }`}>
      <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
      
      <select
        value={selectedYear || ''}
        onChange={(e) => setSelectedYear(e.target.value)}
        disabled={isLoading || !years || years.length === 0}
        className={`appearance-none bg-transparent pr-6 font-medium text-sm focus:outline-none cursor-pointer ${
          isDark ? 'text-white' : 'text-gray-900'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <option>Loading...</option>
        ) : years && years.length > 0 ? (
          years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))
        ) : (
          <option>No years</option>
        )}
      </select>
      
      <ChevronDown className={`w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
    </div>
  );
}
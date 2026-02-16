'use client';

/**
 * Year Selector Component
 * Dropdown to select fiscal year
 * Appears when organization is selected
 * Auto-selects latest year if nothing is selected
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useYears, getLatestYear } from '@/lib/hooks/useYears';
import { motion, AnimatePresence } from 'motion/react';

export function YearSelector() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't show if no organization is selected
  if (!selectedOrganization) {
    return null;
  }

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || !years || years.length === 0}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
          isDark
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isOpen ? (isDark ? 'ring-2 ring-blue-500/50' : 'ring-2 ring-blue-500/30') : ''}`}
      >
        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        
        <span className={`font-semibold text-sm min-w-[60px] ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {isLoading ? 'Loading...' : selectedYear || 'Select Year'}
        </span>
        
        <ChevronDown className={`w-4 h-4 transition-transform ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        } ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && years && years.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 right-0 min-w-[160px] rounded-xl border shadow-xl overflow-hidden z-50 ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`py-1 max-h-[280px] overflow-y-auto ${
              isDark ? 'scrollbar-dark' : 'scrollbar-light'
            }`}>
              {years.map((year) => {
                const isSelected = year === selectedYear;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : isDark
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${isSelected ? 'font-semibold' : ''}`}>
                      {year}
                    </span>
                    
                    {isSelected && (
                      <Check className="w-4 h-4 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
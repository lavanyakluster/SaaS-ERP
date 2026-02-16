'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateRangeFilterProps {
  onApply: (fromDate: string, toDate: string) => void;
  isDark?: boolean;
}

type PresetOption = 
  | 'today'
  | 'yesterday'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'last-year'
  | 'custom';

interface Preset {
  id: PresetOption;
  label: string;
}

const presets: Preset[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this-week', label: 'This Week' },
  { id: 'last-week', label: 'Last Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-quarter', label: 'This Quarter' },
  { id: 'last-quarter', label: 'Last Quarter' },
  { id: 'this-year', label: 'This Year' },
  { id: 'last-year', label: 'Last Year' },
  { id: 'custom', label: 'Custom Range' },
];

export function DateRangeFilter({ onApply, isDark = false }: DateRangeFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>('this-quarter');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateRange = (preset: PresetOption): { from: Date; to: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        return { from: today, to: today };

      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: yesterday };
      }

      case 'this-week': {
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());
        return { from: firstDay, to: today };
      }

      case 'last-week': {
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return { from: lastWeekStart, to: lastWeekEnd };
      }

      case 'this-month':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: today };

      case 'last-month': {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { from: lastMonthStart, to: lastMonthEnd };
      }

      case 'this-quarter': {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { from: quarterStart, to: today };
      }

      case 'last-quarter': {
        const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        const lastQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
        return { from: lastQuarterStart, to: lastQuarterEnd };
      }

      case 'this-year':
        return { from: new Date(now.getFullYear(), 0, 1), to: today };

      case 'last-year':
        return {
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(now.getFullYear() - 1, 11, 31),
        };

      default:
        return { from: today, to: today };
    }
  };

  const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handlePresetSelect = (preset: PresetOption) => {
    if (preset === 'custom') {
      setSelectedPreset(preset);
      setIsDropdownOpen(false);
      setIsCustomModalOpen(true);
    } else {
      setSelectedPreset(preset);
      setIsDropdownOpen(false);
      
      const { from, to } = getDateRange(preset);
      onApply(formatDateToYYYYMMDD(from), formatDateToYYYYMMDD(to));
    }
  };

  const handleCustomApply = () => {
    if (customFromDate && customToDate) {
      onApply(customFromDate, customToDate);
      setIsCustomModalOpen(false);
      setSelectedPreset('custom');
    }
  };

  const handleCustomCancel = () => {
    setIsCustomModalOpen(false);
    setCustomFromDate('');
    setCustomToDate('');
  };

  const getSelectedLabel = () => {
    return presets.find((p) => p.id === selectedPreset)?.label || 'This Quarter';
  };

  return (
    <>
      {/* Date Range Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 text-white'
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{getSelectedLabel()}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-xl z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="py-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedPreset === preset.id
                        ? isDark
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-50 text-purple-700'
                        : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Range Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={handleCustomCancel}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[101]"
            >
              <div
                className={`rounded-xl shadow-2xl p-6 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-6 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Custom Date Range
                </h3>

                {/* From Date */}
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                {/* To Date */}
                <div className="mb-6">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    To Date
                  </label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCustomCancel}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customFromDate || !customToDate}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      !customFromDate || !customToDate
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

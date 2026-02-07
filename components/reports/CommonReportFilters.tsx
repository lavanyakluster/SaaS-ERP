'use client';

/**
 * Common Report Filters Component
 * Reusable filter bar for all report pages with Branch, Date Range, and Load button
 */

import { useState, useCallback, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useBranches } from '@/lib/hooks';

interface CommonReportFiltersProps {
  onLoad?: (filters: ReportFilters) => void;
  showBranch?: boolean;
  defaultFromDate?: string;
  defaultToDate?: string;
  defaultBranch?: string;
}

export interface ReportFilters {
  branchCode: string;
  fromDate: string;
  toDate: string;
}

export function CommonReportFilters({
  onLoad,
  showBranch = true,
  defaultFromDate,
  defaultToDate,
  defaultBranch = '0',
}: CommonReportFiltersProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ✅ Fetch branches from API
  const { data: branchesData, isLoading: isBranchesLoading } = useBranches();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [fromDate, setFromDate] = useState(defaultFromDate || getTodayDate());
  const [toDate, setToDate] = useState(defaultToDate || getTodayDate());

  const handleLoad = useCallback(() => {
    const filters: ReportFilters = {
      branchCode: selectedBranch,
      fromDate,
      toDate,
    };

    console.log('📊 Loading report with filters:', filters);
    onLoad?.(filters);
  }, [selectedBranch, fromDate, toDate, onLoad]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLoad();
      }
    },
    [handleLoad]
  );

  // Auto-load on mount
  useEffect(() => {
    if (!isBranchesLoading) {
      handleLoad();
    }
  }, [isBranchesLoading]);

  return (
    <div
      className={`rounded-lg border p-3 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Branch Selector */}
        {showBranch && (
          <div className="flex-1 min-w-[180px] max-w-[220px]">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isBranchesLoading}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${isBranchesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="0">All Branch</option>
              {branchesData?.map((branch) => (
                <option key={branch.bR_COD} value={branch.bR_COD}>
                  {branch.bR_NM}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* From Date */}
        <div className="flex-1 min-w-[160px] max-w-[200px]">
          <div className="relative">
            <label
              className={`absolute -top-2 left-2 px-1 text-[10px] font-medium ${
                isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
              }`}
            >
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white [color-scheme:dark]'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* To Date */}
        <div className="flex-1 min-w-[160px] max-w-[200px]">
          <div className="relative">
            <label
              className={`absolute -top-2 left-2 px-1 text-[10px] font-medium ${
                isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
              }`}
            >
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white [color-scheme:dark]'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Load Button */}
        <button
          onClick={handleLoad}
          disabled={isBranchesLoading}
          className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md font-medium text-sm hover:shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isBranchesLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isBranchesLoading ? 'Loading...' : 'Load'}
        </button>
      </div>
    </div>
  );
}
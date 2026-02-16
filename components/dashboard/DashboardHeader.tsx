'use client';

import { useState } from 'react';
import { Building2, ChevronDown, Search, Check, LayoutDashboard, TrendingUp, Wallet, Package, Target, Download, RefreshCw, Award, BarChart2 } from 'lucide-react';
import type { Branch } from '@/lib/api';
import { DateRangeFilterWrapper } from './DateRangeFilterWrapper';

type DashboardType = 'overview' | 'sales' | 'account' | 'item' | 'sales-kpi' | 'loyalty' | 'sales-target';

interface DashboardHeaderProps {
  firm: string;
  year: string;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  branches: Branch[];
  branchesLoading?: boolean;
  isDark?: boolean;
  customFromDate?: string;
  customToDate?: string;
  onCustomDateChange?: (fromDate: string, toDate: string) => void;
  activeDashboard: DashboardType;
  onDashboardChange: (dashboard: DashboardType) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  // Account dashboard specific props
  isCumulative?: boolean;
  onCumulativeChange?: (checked: boolean) => void;
  onCumulate?: () => void; // ✅ NEW: Manual cumulation handler
  isCumulating?: boolean;   // ✅ NEW: Cumulation loading state
}

const DASHBOARD_TABS = [
  { id: 'overview' as DashboardType, label: 'Overview', icon: LayoutDashboard },
  { id: 'sales' as DashboardType, label: 'Sales', icon: TrendingUp },
  { id: 'account' as DashboardType, label: 'Account', icon: Wallet },
  { id: 'item' as DashboardType, label: 'Item', icon: Package },
  { id: 'sales-kpi' as DashboardType, label: 'Sale KPI', icon: Target },
  { id: 'loyalty' as DashboardType, label: 'Loyalty', icon: Award },
  { id: 'sales-target' as DashboardType, label: 'Sales Target', icon: BarChart2 },
];

export function DashboardHeader({
  firm,
  year,
  selectedBranch,
  onBranchChange,
  dateRange,
  onDateRangeChange,
  branches,
  branchesLoading = false,
  isDark = false,
  customFromDate,
  customToDate,
  onCustomDateChange,
  activeDashboard,
  onDashboardChange,
  onExport,
  onRefresh,
  isRefreshing = false,
  // Account dashboard specific props
  isCumulative,
  onCumulativeChange,
  onCumulate,
  isCumulating,
}: DashboardHeaderProps) {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  // Filter branches based on search query
  const filteredBranches = branches.filter(branch =>
    branch.bR_NM.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const handleBranchSelect = (branchName: string) => {
    onBranchChange(branchName);
    setShowBranchDropdown(false);
    setBranchSearchQuery('');
  };

  const handleDateRangeApply = (fromDate: string, toDate: string) => {
    if (onCustomDateChange) {
      onCustomDateChange(fromDate, toDate);
    }
  };

  return (
    <div className={`sticky top-0 z-30 border-b backdrop-blur-sm ${
      isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
    }`}>
      <div className="px-6 py-4">
        {/* Top Row - Title & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Dashboard
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {firm} • {year}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Branch Selector */}
            <div className="relative">
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                disabled={branchesLoading}
                className={`pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md min-w-[180px] flex items-center justify-between ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } ${branchesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Building2 className="absolute left-3 w-4 h-4" />
                <span className="truncate">{branchesLoading ? 'Loading...' : selectedBranch}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showBranchDropdown && !branchesLoading && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => {
                      setShowBranchDropdown(false);
                      setBranchSearchQuery('');
                    }}
                  />
                  <div className={`absolute right-0 top-12 w-80 max-w-md rounded-lg border shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {/* Search Input */}
                    <div className={`sticky top-0 p-3 border-b ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <input
                          type="text"
                          placeholder="Search branches..."
                          value={branchSearchQuery}
                          onChange={(e) => setBranchSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Branch List */}
                    <div className="max-h-80 overflow-y-auto py-1">
                      {/* All Branches Option */}
                      <button
                        onClick={() => handleBranchSelect('All Branches')}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center justify-between group ${
                          selectedBranch === 'All Branches'
                            ? isDark
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600'
                            : isDark
                              ? 'text-gray-200 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>All Branches</span>
                        </div>
                        {selectedBranch === 'All Branches' && (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>

                      {/* Individual Branches */}
                      {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <button
                            key={branch.bR_COD}
                            onClick={() => handleBranchSelect(branch.bR_NM)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between group ${
                              selectedBranch === branch.bR_NM
                                ? isDark
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                  : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600'
                                : isDark
                                  ? 'text-gray-200 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <div className="flex flex-col">
                                <span className="font-medium truncate">{branch.bR_NM}</span>
                                <span className={`text-xs ${
                                  selectedBranch === branch.bR_NM
                                    ? isDark ? 'text-blue-200' : 'text-blue-600'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Code: {branch.bR_COD}
                                </span>
                              </div>
                            </div>
                            {selectedBranch === branch.bR_NM && (
                              <Check className="w-4 h-4 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className={`px-4 py-8 text-center text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No branches found
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date Range Selector or Custom Date Picker */}
            <DateRangeFilterWrapper
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              customFromDate={customFromDate}
              customToDate={customToDate}
              onCustomDateApply={handleDateRangeApply}
              isDark={isDark}
            />

            {/* Export Button */}
            {onExport && (
              <button
                onClick={onExport}
                className={`p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row - Dashboard Tabs */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            {DASHBOARD_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDashboard === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onDashboardChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cumulative Checkbox - Only visible for Account Dashboard */}
          {activeDashboard === 'account' && isCumulative !== undefined && onCumulativeChange && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCumulative}
                onChange={(e) => onCumulativeChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-emerald-600"
              />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cumulative
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
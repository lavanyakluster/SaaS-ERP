'use client';

/**
 * Sales Reports Page with Tabs
 * Similar structure to Dashboard with multiple report views
 */

import { useState } from 'react';
import { FileBarChart, RefreshCw, Building2, ChevronDown, Search, Check } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useSearchParams } from 'next/navigation';
import { useBranches } from '@/lib/hooks/useBranches';
import Link from 'next/link';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';

// Import individual report components (to be created)
import DailySalesSummary from '@/components/reports/sales/DailySalesSummary';
import SalesConversion from '@/components/reports/sales/SalesConversion';
import SalesRegisterTanStack from '@/components/reports/sales/SalesRegisterTanStack';
import SalesReturnTanStack from '@/components/reports/sales/SalesReturnTanStack';

type SalesTab = 'daily-sales-summary' | 'sales-conversion' | 'sales-register' | 'sales-return';

export default function SalesReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SalesTab>(
    (searchParams.get('tab') as SalesTab) || 'daily-sales-summary'
  );

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const branches = branchesData || [];

  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Applied filters (after Load button is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    branchCode: '',
    fromDate: '',
    toDate: '',
  });

  // Filter branches based on search query
  const filteredBranches = branches.filter(branch =>
    branch.bR_NM.toLowerCase().includes(branchSearchQuery.toLowerCase())
  );

  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
    setShowBranchDropdown(false);
    setBranchSearchQuery('');
  };

  const handleDateRangeApply = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  const handleLoad = () => {
    // Find branch code from selected branch name
    const branchCode = selectedBranch === 'All Branches' 
      ? '0' 
      : branches.find(b => b.bR_NM === selectedBranch)?.bR_COD || '0';

    setAppliedFilters({
      branchCode,
      fromDate,
      toDate,
    });
  };

  const tabs = [
    { id: 'daily-sales-summary', label: 'Daily Sales Summary', icon: FileBarChart },
    { id: 'sales-conversion', label: 'Sales Conversion', icon: FileBarChart },
    { id: 'sales-register', label: 'Sales Register', icon: FileBarChart },
    { id: 'sales-return', label: 'Sales Return', icon: FileBarChart },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily-sales-summary':
        return <DailySalesSummary filters={appliedFilters} />;
      case 'sales-conversion':
        return <SalesConversion filters={appliedFilters} />;
      case 'sales-register':
        return <SalesRegisterTanStack filters={appliedFilters} />;
      case 'sales-return':
        return <SalesReturnTanStack filters={appliedFilters} />;
      default:
        return <DailySalesSummary filters={appliedFilters} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Reports
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive sales analysis and reporting
          </p>
        </div>

        {/* Filters - Right Side */}
        <div className="flex items-center gap-3">
          {/* Branch Selector */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              disabled={branchesLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors min-w-[180px] ${
                isDark
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 text-white'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
              } ${branchesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium flex-1 text-left truncate">
                {branchesLoading ? 'Loading...' : selectedBranch}
              </span>
              <ChevronDown className="w-4 h-4" />
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

          {/* Date Range Picker */}
          <DateRangeFilter
            onApply={handleDateRangeApply}
            isDark={isDark}
          />

          {/* Load Button */}
          <button
            onClick={handleLoad}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Load
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl border overflow-x-auto flex-shrink-0 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 p-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/reports/sales?tab=${tab.id}`}
                onClick={() => setActiveTab(tab.id as SalesTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
    </div>
  );
}
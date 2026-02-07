'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Eye, ChevronDown } from 'lucide-react';
import { BranchReportWidget } from './BranchReportWidget';
import { useSalesKpi } from '@/lib/hooks/useSalesKpi';

interface ModernSalesKPIDashboardProps {
  isDark: boolean;
  onFullscreen?: (id: string, data: any) => void;
}

interface BranchReportData {
  branch: string;
  todaySales: number;
  yesterdaySales: number;
  forecastNextDay: number;
  dayChange: number;
  thisMonthSales: number;
  lastMonthSales: number;
  forecastNextMonth: number;
  monthChange: number;
  thisYearSales: number;
  lastYearSales: number;
  forecastNextYear: number;
  yearChange: number;
}

export function ModernSalesKPIDashboard({ isDark, onFullscreen }: ModernSalesKPIDashboardProps) {
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBranchReport, setSelectedBranchReport] = useState<BranchReportData | null>(null);

  // ✅ Fetch real Sales KPI data from API
  const { data: salesKpiData, isLoading, error } = useSalesKpi();

  // ✅ Process KPI summary data
  const kpiSummary = useMemo(() => {
    if (!salesKpiData || salesKpiData.length === 0) {
      return {
        totalRevenue: 0,
        totalRevenueChange: 0,
        avgYearPerc: 0,
        totalBranches: 0,
        yesterdaySales: 0,
        thisYearSales: 0,
        pharmacySales: 0,
        redFlagCount: 0,
        greenFlagCount: 0,
        redFlagPercentage: 0,
      };
    }

    const totalThisYear = salesKpiData.reduce((sum, item) => sum + item.thisYearSales, 0);
    const totalLastYear = salesKpiData.reduce((sum, item) => sum + item.lastYearSales, 0);
    const totalRevenueChange = totalLastYear > 0 
      ? ((totalThisYear - totalLastYear) / totalLastYear) * 100 
      : 0;
    const avgYearPerc = salesKpiData.reduce((sum, item) => sum + item.yearPerc, 0) / salesKpiData.length;

    // ✅ Calculate summary metrics from API data
    const yesterdaySales = salesKpiData.reduce((sum, item) => sum + item.yesterdaySales, 0);
    const thisYearSales = salesKpiData.reduce((sum, item) => sum + item.thisYearSales, 0);
    
    // Pharmacy sales (assuming branches with 'P' prefix or specific branch codes)
    const pharmacySales = salesKpiData
      .filter(item => item.branch && (item.branch.startsWith('P') || item.branch === '009' || item.branch === '010'))
      .reduce((sum, item) => sum + item.thisYearSales, 0);
    
    // Count flags
    const redFlagCount = salesKpiData.filter(d => d.yearFlag === 'Red').length;
    const greenFlagCount = salesKpiData.filter(d => d.yearFlag === 'Green').length;
    const redFlagPercentage = salesKpiData.length > 0 ? (redFlagCount / salesKpiData.length) * 100 : 0;

    return {
      totalRevenue: totalThisYear,
      totalRevenueChange,
      avgYearPerc,
      totalBranches: salesKpiData.length,
      yesterdaySales,
      thisYearSales,
      pharmacySales,
      redFlagCount,
      greenFlagCount,
      redFlagPercentage,
    };
  }, [salesKpiData]);

  // ✅ Format revenue for display
  const formatRevenue = (value: number): string => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(0)}K`;
    }
    return `AED ${value.toFixed(0)}`;
  };

  // ✅ Branch Sales Table Data - Using Real API Data
  const branchSalesData = useMemo(() => {
    if (!salesKpiData || salesKpiData.length === 0) {
      return [];
    }

    return salesKpiData.map(item => ({
      branch: item.branch,
      todaySales: item.todaySales,
      todayTrend: item.dayPerc ?? 0, // ✅ Null-safe with fallback to 0
      monthSales: item.thisMonthSales,
      monthTrend: item.monthPerc ?? 0, // ✅ Null-safe with fallback to 0
      yearSales: item.thisYearSales,
      yearTrend: item.yearPerc ?? 0, // ✅ Null-safe with fallback to 0
      // Additional data for modal
      yesterdaySales: item.yesterdaySales,
      forecastNextDay: item.forecastNextDay,
      lastMonthSales: item.lastMonthSales,
      forecastNextMonth: item.forecastNextMonth,
      lastYearSales: item.lastYearSales,
      forecastNextYear: item.forecastNextYear,
    }));
  }, [salesKpiData]);

  const totalPages = Math.ceil(branchSalesData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = branchSalesData.slice(startIndex, endIndex);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) return <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>;
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span className="text-xs font-semibold">{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
    );
  };

  // ✅ Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 animate-pulse ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`h-12 rounded mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-8 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
        <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading sales data...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Failed to load sales data</p>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Summary Widgets from Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Branch Sales Summary */}
        <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200'}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Branch Sales Summary
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(kpiSummary.yesterdaySales)}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                Yesterday Sales
              </p>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            </div>
          </div>
        </div>

        {/* Store Sales Summary */}
        <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-200'}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Store Sales Summary
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(kpiSummary.thisYearSales)}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Total This Year Sales
              </p>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-blue-500/30' : 'bg-blue-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
            </div>
          </div>
        </div>

        {/* Pharmacy Sales Summary */}
        <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-200'}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Pharmacy Sales Summary
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(kpiSummary.pharmacySales)}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                Total This Year Sales
              </p>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-pink-100 border border-pink-200'}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                Flags
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${isDark ? 'bg-pink-500/30 text-pink-300' : 'bg-pink-200 text-pink-700'}`}>
                  {kpiSummary.redFlagPercentage.toFixed(0)}%
                </div>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                {kpiSummary.redFlagCount} Red / {kpiSummary.greenFlagCount} Green
              </p>
            </div>
            <div className={`p-2 rounded ${isDark ? 'bg-pink-500/30' : 'bg-pink-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-pink-300' : 'text-pink-700'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Branch Sales Table */}
      <div
        className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
      >
        {/* Table Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Branch-wise Sales Report
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {startIndex + 1}-{Math.min(endIndex, branchSalesData.length)} of {branchSalesData.length} branches
            </p>
          </div>
          
          {/* Rows Per Page */}
          <div className="flex items-center gap-3">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rows:</span>
            <div className="relative">
              <button
                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {rowsPerPage}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showRowsDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)} />
                  <div
                    className={`absolute right-0 top-10 rounded-lg border shadow-xl z-20 py-1 min-w-[80px] animate-in fade-in slide-in-from-top-2 duration-150 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setRowsPerPage(size);
                          setCurrentPage(1);
                          setShowRowsDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-all ${
                          rowsPerPage === size
                            ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                            : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Branch</th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Today Sales</th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Month Sales</th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Year Sales</th>
                <th className={`text-center p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr
                  key={row.branch}
                  className={`border-t transition-all duration-200 hover:scale-[1.01] ${
                    isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                  style={{ animation: `slideUp 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <td className={`p-3 font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{row.branch}</td>
                  <td className={`p-3 text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(row.todaySales)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {(row.todayTrend ?? 0) >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-500">
                              +{(row.todayTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-500">
                              {(row.todayTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`p-3 text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(row.monthSales)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {(row.monthTrend ?? 0) >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-500">
                              +{(row.monthTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-500">
                              {(row.monthTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`p-3 text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(row.yearSales)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {(row.yearTrend ?? 0) >= 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-500">
                              +{(row.yearTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-500">
                              {(row.yearTrend ?? 0).toFixed(1)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                        isDark ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title="View Details"
                      onClick={() => {
                        const todaySales = row.todaySales;
                        const yesterdaySales = row.yesterdaySales;
                        const forecastNextDay = row.forecastNextDay;
                        
                        const thisMonthSales = row.monthSales;
                        const lastMonthSales = row.lastMonthSales;
                        const forecastNextMonth = row.forecastNextMonth;
                        
                        const thisYearSales = row.yearSales;
                        const lastYearSales = row.lastYearSales;
                        const forecastNextYear = row.forecastNextYear;
                        
                        setSelectedBranchReport({
                          branch: row.branch,
                          todaySales: todaySales,
                          yesterdaySales: yesterdaySales,
                          forecastNextDay: forecastNextDay,
                          dayChange: row.todayTrend,
                          thisMonthSales: thisMonthSales,
                          lastMonthSales: lastMonthSales,
                          forecastNextMonth: forecastNextMonth,
                          monthChange: row.monthTrend,
                          thisYearSales: thisYearSales,
                          lastYearSales: lastYearSales,
                          forecastNextYear: forecastNextYear,
                          yearChange: row.yearTrend,
                        });
                        setShowReportModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Branch Report Modal */}
      {showReportModal && selectedBranchReport && (
        <BranchReportWidget
          isOpen={showReportModal}
          branchData={selectedBranchReport}
          onClose={() => setShowReportModal(false)}
          isDark={isDark}
        />
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
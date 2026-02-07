'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { BranchReportWidget } from './BranchReportWidget';

interface SalesKPIDashboardProps {
  isDark: boolean;
}

interface SalesData {
  branch: string;
  todaySales: number;
  todayTrend: number;
  monthSales: number;
  monthTrend: number;
  yearSales: number;
  yearTrend: number;
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

export function SalesKPIDashboard({ isDark }: SalesKPIDashboardProps) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBranchReport, setSelectedBranchReport] = useState<BranchReportData | null>(null);

  // TODO: Replace with real API data when available
  // For now, show empty state
  const totalWeightedSales = 0;
  const branchSalesPercentage = 0;

  const salesData: SalesData[] = [];

  const totalPages = Math.ceil(salesData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = salesData.slice(startIndex, endIndex);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleReportClick = (salesRow: SalesData) => {
    // Generate detailed report data based on the sales row
    const yesterdaySales = salesRow.todaySales * 0.92;
    const forecastNextDay = salesRow.todaySales * 1.08;
    const lastMonthSales = salesRow.monthSales * 0.85;
    const forecastNextMonth = salesRow.monthSales * 1.12;
    const lastYearSales = salesRow.yearSales * 0.88;
    const forecastNextYear = salesRow.yearSales * 1.15;

    const reportData: BranchReportData = {
      branch: salesRow.branch,
      todaySales: salesRow.todaySales,
      yesterdaySales: yesterdaySales,
      forecastNextDay: forecastNextDay,
      dayChange: salesRow.todayTrend,
      thisMonthSales: salesRow.monthSales,
      lastMonthSales: lastMonthSales,
      forecastNextMonth: forecastNextMonth,
      monthChange: salesRow.monthTrend,
      thisYearSales: salesRow.yearSales,
      lastYearSales: lastYearSales,
      forecastNextYear: forecastNextYear,
      yearChange: salesRow.yearTrend,
    };

    setSelectedBranchReport(reportData);
    setShowReportModal(true);
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
      <div className="flex items-center gap-1 ml-2">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Branch Sales Summary */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-medium opacity-90">Branch Sales Summary</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{formatNumber(totalWeightedSales)}</div>
            <p className="text-xs opacity-75">Total Weighted Sales</p>
          </div>
        </div>

        {/* Store Sales Summary */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-medium opacity-90">Store Sales Summary</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{formatNumber(totalWeightedSales)}</div>
            <p className="text-xs opacity-75">Total Weighted Sales</p>
          </div>
        </div>

        {/* Pharmacy Sales Summary */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-medium opacity-90">Pharmacy Sales Summary</h3>
            </div>
            <div className="text-3xl font-bold mb-1">{formatNumber(totalWeightedSales)}</div>
            <p className="text-xs opacity-75">Total Weighted Sales</p>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-sm font-medium opacity-90">Total</h3>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs opacity-75">Overall Progress</span>
                <span className="text-sm font-semibold">{branchSalesPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${branchSalesPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Data Table */}
      <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-lg`}>
        {/* Table Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Sales Data
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`px-6 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Branch
                </th>
                <th className={`px-6 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Today Sales
                </th>
                <th className={`px-6 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This Month Sales
                </th>
                <th className={`px-6 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This Year Sales
                </th>
                <th className={`px-6 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr
                  key={row.branch}
                  className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:bg-opacity-50 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {row.branch}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatNumber(row.todaySales)}
                      </span>
                      <TrendIndicator value={row.todayTrend} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatNumber(row.monthSales)}
                      </span>
                      <TrendIndicator value={row.monthTrend} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatNumber(row.yearSales)}
                      </span>
                      <TrendIndicator value={row.yearTrend} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-all"
                      onClick={() => handleReportClick(row)}
                    >
                      Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Rows per page:
            </span>
            <div className="relative">
              <button
                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                className={`px-3 py-1.5 rounded border text-sm flex items-center gap-2 ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                {rowsPerPage}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showRowsDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)} />
                  <div className={`absolute bottom-full mb-1 left-0 rounded border shadow-xl z-20 py-1 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {[5, 10, 25, 50].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setRowsPerPage(value);
                          setCurrentPage(1);
                          setShowRowsDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          value === rowsPerPage
                            ? isDark
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {startIndex + 1}-{Math.min(endIndex, salesData.length)} of {salesData.length}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded transition-all ${
                  currentPage === 1
                    ? 'opacity-30 cursor-not-allowed'
                    : isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded transition-all ${
                  currentPage === totalPages
                    ? 'opacity-30 cursor-not-allowed'
                    : isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Report Modal */}
      {showReportModal && selectedBranchReport && (
        <BranchReportWidget
          isOpen={showReportModal}
          isDark={isDark}
          branchData={selectedBranchReport}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
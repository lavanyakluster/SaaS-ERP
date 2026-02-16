/**
 * Modern Sales KPI Dashboard Component
 * 
 * ✅ Enterprise Features:
 * - Real API integration with sales KPI data
 * - TanStack Table for branch sales table
 * - Professional KPI cards
 * - Branch report modal with ECharts
 * - Trend indicators
 * - Multi-tenant architecture
 */

'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
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

  // ✅ Format number
  const formatNumber = (num: number | null | undefined): string => {
    if (num == null || isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ✅ Branch Sales Table Data - Using Real API Data
  const branchSalesData = useMemo(() => {
    if (!salesKpiData || salesKpiData.length === 0) {
      return [];
    }

    return salesKpiData.map(item => ({
      branch: item.branch,
      todaySales: item.todaySales,
      todayTrend: item.dayPerc ?? 0,
      monthSales: item.thisMonthSales,
      monthTrend: item.monthPerc ?? 0,
      yearSales: item.thisYearSales,
      yearTrend: item.yearPerc ?? 0,
      // Additional data for modal
      yesterdaySales: item.yesterdaySales,
      forecastNextDay: item.forecastNextDay,
      lastMonthSales: item.lastMonthSales,
      forecastNextMonth: item.forecastNextMonth,
      lastYearSales: item.lastYearSales,
      forecastNextYear: item.forecastNextYear,
    }));
  }, [salesKpiData]);

  // TanStack Table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ getValue }) => (
        <div className="text-left font-semibold pl-2">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'todaySales',
      header: 'Today Sales',
      cell: ({ row }) => {
        const value = row.original.todaySales ?? 0;
        const trend = row.original.todayTrend ?? 0;
        const isPositive = trend >= 0;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <span className="font-medium">{formatNumber(value)}</span>
            {trend !== 0 && (
              <div className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'monthSales',
      header: 'This Month Sales',
      cell: ({ row }) => {
        const value = row.original.monthSales ?? 0;
        const trend = row.original.monthTrend ?? 0;
        const isPositive = trend >= 0;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <span className="font-medium">{formatNumber(value)}</span>
            {trend !== 0 && (
              <div className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'yearSales',
      header: 'This Year Sales',
      cell: ({ row }) => {
        const value = row.original.yearSales ?? 0;
        const trend = row.original.yearTrend ?? 0;
        const isPositive = trend >= 0;
        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <span className="font-medium">{formatNumber(value)}</span>
            {trend !== 0 && (
              <div className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'report',
      header: 'Report',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setSelectedBranchReport({
                branch: row.original.branch,
                todaySales: row.original.todaySales,
                yesterdaySales: row.original.yesterdaySales,
                forecastNextDay: row.original.forecastNextDay,
                dayChange: row.original.todayTrend,
                thisMonthSales: row.original.monthSales,
                lastMonthSales: row.original.lastMonthSales,
                forecastNextMonth: row.original.forecastNextMonth,
                monthChange: row.original.monthTrend,
                thisYearSales: row.original.yearSales,
                lastYearSales: row.original.lastYearSales,
                forecastNextYear: row.original.forecastNextYear,
                yearChange: row.original.yearTrend,
              });
              setShowReportModal(true);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Report
          </button>
        </div>
      ),
    },
  ];

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
      {/* ✅ Summary Widgets */}
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

      {/* Branch Sales Table (TanStack Table) */}
      <div className={`rounded-xl overflow-hidden ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <h3 className={`font-sans text-base font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Branch-wise Sales Report
          </h3>
          <p className={`font-sans text-xs mt-0.5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {branchSalesData.length} branches with sales performance trends
          </p>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={branchSalesData}
            isDark={isDark}
            height="700px"
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
            enableColumnPinning={true}
            enableColumnReordering={true}
            enableColumnResizing={true}
            enableGlobalFilter={true}
            pageSize={15}
          />
        </div>
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
    </div>
  );
}
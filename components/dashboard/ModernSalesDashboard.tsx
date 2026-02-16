/**
 * Modern Sales Dashboard Component
 * 
 * ✅ Enterprise Features:
 * - Real API integration with sales and rep data
 * - Apache ECharts for sales growth chart
 * - AG Grid for sales rep table
 * - Dynamic date range and branch selection
 * - Multi-tenant architecture
 * - Professional enterprise UI
 */

'use client';

import { useMemo, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users,
  Calendar,
  ChevronDown
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { BranchSalesAnalysisWidget } from './BranchSalesAnalysisWidget';
import { BranchProfitAnalysisWidget } from './BranchProfitAnalysisWidget';
import { SalesRepAnalysisWidget } from './SalesRepAnalysisWidget';
import { GrowthRatioAnalysisWidget } from './GrowthRatioAnalysisWidget';
import { SalesRatioAnalysisWidget } from './SalesRatioAnalysisWidget';
import { useSalesDashboard } from '@/lib/hooks/useSalesDashboard';
import type { Branch } from '@/lib/api/branch.api';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';

interface ModernSalesDashboardProps {
  isDark: boolean;
  onFullscreen?: (id: string, data?: any) => void;
  dateRange: string;
  selectedBranch: string;
  branches: Branch[] | undefined; // ✅ Allow undefined when disabled
}

export function ModernSalesDashboard({ 
  isDark, 
  onFullscreen,
  dateRange,
  selectedBranch,
  branches 
}: ModernSalesDashboardProps) {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'branch-sales' | 'branch-profit' | 'sales-ratio' | 'growth-ratio' | 'sales-rep'>('branch-sales');
  
  // Helper function to convert date range to actual dates
  const getDateRange = (range: string): { fromDt: string; toDt: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (range) {
      case 'Today':
        return { fromDt: formatDate(today), toDt: formatDate(today) };
      case 'This Week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { fromDt: formatDate(weekStart), toDt: formatDate(today) };
      }
      case 'This Month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { fromDt: formatDate(monthStart), toDt: formatDate(today) };
      }
      case 'This Quarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        return { fromDt: formatDate(quarterStart), toDt: formatDate(today) };
      }
      case 'Year 2025':
      default:
        return { fromDt: '2025-01-01', toDt: '2025-12-31' };
    }
  };

  // Get branch code from selected branch - ✅ Dynamic mapping from real API data
  const getBranchCode = (): string => {
    // ✅ CRITICAL: Guard against undefined branches
    if (!branches || branches.length === 0) {
      return '0'; // Default to all branches if no data loaded
    }

    // Handle "All Branches" case
    if (selectedBranch === 'All Branches') {
      return '0'; // API uses "0" for all branches
    }

    // Find the selected branch
    const branch = branches.find(b => b.bR_NM === selectedBranch);
    
    if (branch) {
      return branch.bR_COD;
    }

    // If specific branch is selected but not found, use first branch
    if (branches.length > 0) {
      return branches[0].bR_COD;
    }

    // Final fallback
    return '0';
  };

  // Get date range and branch code
  const { fromDt, toDt } = getDateRange(dateRange);
  const branchCode = getBranchCode();

  // ✅ Fetch real sales dashboard data from API
  const { data: salesData, isLoading, error } = useSalesDashboard({
    fromDt,
    toDt,
    brCode: branchCode,
  });

  // ✅ Process monthly sales data
  const salesGrowthData = useMemo(() => {
    if (!salesData?.Table || salesData.Table.length === 0) {
      return [];
    }

    return salesData.Table.map(item => ({
      name: item.YRMTH.replace('/', '-'), // Convert "2025/05" to "2025-05"
      month: item.YRMTH,
      sales: item.Sale,
      profit: item.Profit,
    }));
  }, [salesData]);

  // ✅ Process sales rep data
  const repSalesData = useMemo(() => {
    if (!salesData?.Table1 || salesData.Table1.length === 0) {
      return [];
    }

    return salesData.Table1.map(item => ({
      name: item.SalesMan ? `${item.SalesMan}#${item.Code}` : `Rep #${item.Code}`,
      sale: item.Sale,
      profit: item.Profit,
    }));
  }, [salesData]);

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ECharts colors based on theme
  const chartColors = {
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  };

  // Sales Growth Chart (ECharts Multi-series Bar)
  const salesGrowthOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      formatter: (params: any) => {
        const month = params[0].axisValue;
        let result = `<strong>${month}</strong><br/>`;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${formatCurrency(item.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Sales', 'Profit'],
      top: 0,
      textStyle: {
        color: chartColors.textColor,
        fontSize: 12,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: salesGrowthData.map(d => d.name),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        rotate: salesGrowthData.length > 6 ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        formatter: (value: number) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
          return value.toString();
        },
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: salesGrowthData.map(d => d.sales),
        itemStyle: {
          color: chartColors.purple,
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Profit',
        type: 'bar',
        data: salesGrowthData.map(d => d.profit),
        itemStyle: {
          color: chartColors.cyan,
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  // TanStack Table columns for sales rep table
  const repSalesTableColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Rep',
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'sale',
      header: 'Sales',
      cell: ({ getValue }) => (
        <div className="text-right font-medium text-purple-600">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    },
    {
      accessorKey: 'profit',
      header: 'Profit',
      cell: ({ getValue }) => (
        <div className="text-right font-medium text-cyan-600">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    },
  ];

  // Calculate totals for pinned row
  const totals = useMemo(() => {
    const totalSales = repSalesData.reduce((sum, item) => sum + (item.sale || 0), 0);
    const totalProfit = repSalesData.reduce((sum, item) => sum + (item.profit || 0), 0);
    return { totalSales, totalProfit };
  }, [repSalesData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Failed to load sales data</div>
        <p className="text-gray-600 dark:text-gray-400">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Analysis Tabs */}
      <div className={`rounded-lg overflow-hidden ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-1 px-3 py-2">
            <button
              onClick={() => setActiveAnalysisTab('branch-sales')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeAnalysisTab === 'branch-sales'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Branch Wise Sales
            </button>
            <button
              onClick={() => setActiveAnalysisTab('branch-profit')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeAnalysisTab === 'branch-profit'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Branch Wise Profit
            </button>
            <button
              onClick={() => setActiveAnalysisTab('sales-ratio')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeAnalysisTab === 'sales-ratio'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sales Ratio Analysis
            </button>
            <button
              onClick={() => setActiveAnalysisTab('growth-ratio')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeAnalysisTab === 'growth-ratio'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Growth Ratio Analysis
            </button>
            <button
              onClick={() => setActiveAnalysisTab('sales-rep')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeAnalysisTab === 'sales-rep'
                  ? 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sales Rep Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Branch Sales Analysis Widget - ✅ New widget with API data */}
      {activeAnalysisTab === 'branch-sales' && salesData?.Table2 && (
        <BranchSalesAnalysisWidget
          branchData={salesData.Table2}
          isDark={isDark}
          title="Branch wise Sales analysis"
        />
      )}

      {/* Branch Profit Analysis Widget - ✅ New widget with API data */}
      {activeAnalysisTab === 'branch-profit' && salesData?.Table2 && (
        <BranchProfitAnalysisWidget
          branchData={salesData.Table2}
          isDark={isDark}
        />
      )}

      {/* Placeholder for other analysis tabs */}
      {activeAnalysisTab === 'sales-ratio' && salesData?.Table2 && (
        <SalesRatioAnalysisWidget
          branchData={salesData.Table2}
          isDark={isDark}
          title="Sales Ratio analysis"
        />
      )}

      {activeAnalysisTab === 'growth-ratio' && salesData?.Table2 && (
        <GrowthRatioAnalysisWidget
          branchData={salesData.Table2}
          isDark={isDark}
          title="Growth Ratio analysis"
        />
      )}

      {activeAnalysisTab === 'sales-rep' && (
        <SalesRepAnalysisWidget
          repData={salesData?.Table1 || []}
          isDark={isDark}
          title="Sales Representative analysis"
        />
      )}

      {/* Sales Growth Chart and Rep Sales Table - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Sales Growth Chart */}
        <div className={`rounded-lg overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className={`px-4 py-2.5 border-b ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <h3 className={`font-sans text-sm font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Sales Growth
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {salesGrowthData.length} Month{salesGrowthData.length !== 1 ? 's' : ''} - {dateRange}
            </p>
          </div>
          <div className="p-4">
            <ReactECharts
              option={salesGrowthOption}
              style={{ height: '280px' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        </div>

        {/* Rep Sales Table */}
        <div className={`rounded-lg overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className={`px-4 py-2.5 border-b ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <h3 className={`font-sans text-sm font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Rep Sales
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {repSalesData.length} Sales Representatives - {dateRange}
            </p>
          </div>
          <div className="p-4">
            <DataTable
              columns={repSalesTableColumns}
              data={repSalesData}
              isDark={isDark}
              height="320px"
              enablePagination={true}
              enableSorting={true}
              pageSize={20}
            />
            {/* Totals Row */}
            <div className={`mt-3 pt-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center px-3">
                <div className="font-bold text-sm">Total</div>
                <div className="flex gap-12">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Sales</div>
                    <div className="font-bold text-sm text-purple-600">
                      {formatCurrency(totals.totalSales)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Profit</div>
                    <div className="font-bold text-sm text-cyan-600">
                      {formatCurrency(totals.totalProfit)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ColumnDef } from '@tanstack/react-table';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesSummary, useDashSalesSummary } from '@/lib/hooks/useSalesSummary';
import { useSalesDashboard } from '@/lib/hooks';

interface DailySalesSummaryProps {
  filters: {
    branchCode: string;
    fromDate: string;
    toDate: string;
  };
}

// Helper function to get current quarter dates
const getQuarterDates = (): { fromDate: string; toDate: string } => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const quarter = Math.floor(today.getMonth() / 3);
  const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
  return { 
    fromDate: formatDate(quarterStart), 
    toDate: formatDate(today) 
  };
};

export default function DailySalesSummary({ filters }: DailySalesSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for active tab
  const [activeTab, setActiveTab] = useState<'summary' | 'salesman'>('summary');

  // Use default values if no filters are provided from parent
  const defaultDates = getQuarterDates();
  const effectiveFilters = {
    branchCode: filters.branchCode || '000', // '000' = All Branches
    fromDate: filters.fromDate || defaultDates.fromDate,
    toDate: filters.toDate || defaultDates.toDate,
  };

  // Always fetch data with effective filters (defaults or provided)
  const hasFilters = true; // Always enabled

  // Fetch data from both APIs using effective filters
  const { data: salesSummaryData, isLoading: isSalesSummaryLoading } = useSalesSummary(
    {
      dtf: effectiveFilters.fromDate,
      dtt: effectiveFilters.toDate,
      brcode: effectiveFilters.branchCode,
      shift: '0',
    },
    hasFilters
  );

  const { data: dashSalesData, isLoading: isDashSalesLoading } = useDashSalesSummary(
    {
      dtf: effectiveFilters.fromDate,
      dtt: effectiveFilters.toDate,
      brcode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Only fetch salesdashboard API when Salesman tab is active
  const { data: salesDashboardData, isLoading: isSalesDashboardLoading } = useSalesDashboard(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters && activeTab === 'salesman' // Only fetch when Salesman tab is active
  );

  const isLoading = isSalesSummaryLoading || isDashSalesLoading || isSalesDashboardLoading;

  // Process data for bar chart
  const chartData = useMemo(() => {
    if (!dashSalesData || !Array.isArray(dashSalesData) || dashSalesData.length === 0) {
      return [];
    }

    return dashSalesData.map((item) => ({
      branchCode: item.branchCode || 'Unknown',
      'Cash Sales': item.cashWet || item.cashNet || 0,
      'Card Sales': item.cardWet || item.cardNet || 0,
      'Credit Sales': item.creditWet || item.creditNet || 0,
      'Returned Sales': 0,
      'Total Sales': (item.cashWet || item.cashNet || 0) + 
                     (item.cardWet || item.cardNet || 0) + 
                     (item.creditWet || item.creditNet || 0),
    }));
  }, [dashSalesData]);

  // Process data for table
  const tableData = useMemo(() => {
    if (activeTab === 'salesman') {
      if (!salesDashboardData?.Table1 || salesDashboardData.Table1.length === 0) {
        return [];
      }

      return salesDashboardData.Table1.map((item) => ({
        code: item.Code,
        salesman: item.SalesMan,
        sale: item.Sale,
        profit: item.Profit,
      }));
    }
    
    if (!dashSalesData || !Array.isArray(dashSalesData) || dashSalesData.length === 0) {
      return [];
    }

    return dashSalesData.map((item, index) => ({
      code: item.branchCode || `Branch ${index + 1}`,
      description: item.branchName || item.branchCode || `Branch ${index + 1}`,
      cashSales: item.cashWet || item.cashNet || 0,
      cardSales: item.cardWet || item.cardNet || 0,
      creditSales: item.creditWet || item.creditNet || 0,
      insurance: item.insuranceWet || item.insuranceNet || 0,
      pointsRedeemed: item.redeemedPoints || 0,
      totalBills: item.totalBills || 0,
    }));
  }, [dashSalesData, salesDashboardData, activeTab]);

  // Process data for salesman chart
  const salesmanChartData = useMemo(() => {
    if (activeTab !== 'salesman' || !salesDashboardData?.Table1) {
      return [];
    }

    return salesDashboardData.Table1.map((item) => ({
      salesman: item.SalesMan,
      sales: item.Sale,
      profit: item.Profit,
    }));
  }, [salesDashboardData, activeTab]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!tableData.length) {
      if (activeTab === 'salesman') {
        return { sale: 0, profit: 0 };
      }
      return { 
        cashSales: 0, 
        cardSales: 0, 
        creditSales: 0, 
        insurance: 0, 
        pointsRedeemed: 0, 
        totalBills: 0 
      };
    }

    if (activeTab === 'salesman') {
      return tableData.reduce((acc, row: any) => ({
        sale: acc.sale + row.sale,
        profit: acc.profit + row.profit,
      }), { sale: 0, profit: 0 });
    }

    return tableData.reduce((acc, row: any) => ({
      cashSales: acc.cashSales + row.cashSales,
      cardSales: acc.cardSales + row.cardSales,
      creditSales: acc.creditSales + row.creditSales,
      insurance: acc.insurance + row.insurance,
      pointsRedeemed: acc.pointsRedeemed + row.pointsRedeemed,
      totalBills: acc.totalBills + row.totalBills,
    }), { 
      cashSales: 0, 
      cardSales: 0, 
      creditSales: 0, 
      insurance: 0, 
      pointsRedeemed: 0, 
      totalBills: 0 
    });
  }, [tableData, activeTab]);

  // TanStack Table column definitions
  const summaryColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'Branch Code',
      cell: ({ getValue }) => (
        <div className="font-semibold">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Branch Name',
      cell: ({ getValue }) => (
        <div className="min-w-[200px]">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'cashSales',
      header: 'Cash Sales',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'cardSales',
      header: 'Card Sales',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'creditSales',
      header: 'Credit Sales',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'insurance',
      header: 'Insurance',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'pointsRedeemed',
      header: 'Points Redeemed',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'totalBills',
      header: 'Total Bills',
      cell: ({ getValue }) => (
        <div className="text-right font-semibold">{getValue() as number}</div>
      ),
    },
  ];

  const salesmanColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ getValue }) => (
        <div className="font-semibold">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'salesman',
      header: 'Salesman',
      cell: ({ getValue }) => (
        <div className="min-w-[200px]">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'sale',
      header: 'Sale',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'profit',
      header: 'Profit',
      cell: ({ getValue }) => (
        <div className="text-right">
          {((getValue() as number) ?? 0).toFixed(2)}
        </div>
      ),
    },
  ];

  // ECharts theme-aware colors
  const chartColors = {
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
  };

  // ECharts option for Summary chart
  const summaryChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: chartColors.tooltipBg,
      borderColor: chartColors.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      valueFormatter: (value: any) => {
        return typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
      },
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: chartColors.textColor,
        fontSize: 11,
      },
      padding: 15,
    },
    grid: {
      left: '0%',
      right: '2%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.branchCode),
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 12,
        formatter: (value: number) => {
          return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString();
        },
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
    },
    series: [
      {
        name: 'Cash Sales',
        type: 'bar',
        data: chartData.map(item => item['Cash Sales']),
        itemStyle: { 
          color: '#C026D3',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '16%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
      {
        name: 'Card Sales',
        type: 'bar',
        data: chartData.map(item => item['Card Sales']),
        itemStyle: { 
          color: '#EC4899',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '16%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
      {
        name: 'Credit Sales',
        type: 'bar',
        data: chartData.map(item => item['Credit Sales']),
        itemStyle: { 
          color: '#22D3EE',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '16%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
      {
        name: 'Returned Sales',
        type: 'bar',
        data: chartData.map(item => item['Returned Sales']),
        itemStyle: { 
          color: '#FBBF24',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '16%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
      {
        name: 'Total Sales',
        type: 'bar',
        data: chartData.map(item => item['Total Sales']),
        itemStyle: { 
          color: '#10B981',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '16%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
    ],
  };

  // ECharts option for Salesman chart
  const salesmanChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: chartColors.tooltipBg,
      borderColor: chartColors.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      valueFormatter: (value: any) => {
        return typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
      },
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: chartColors.textColor,
        fontSize: 11,
      },
      padding: 15,
    },
    grid: {
      left: '0%',
      right: '2%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: salesmanChartData.map(item => item.salesman),
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
        rotate: salesmanChartData.length > 5 ? 45 : 0,
      },
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 12,
        formatter: (value: number) => {
          return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString();
        },
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: salesmanChartData.map(item => item.sales),
        itemStyle: { 
          color: '#6366F1',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '40%', // Increased from default
        barMaxWidth: 80, // Increased from 50
      },
    ],
  };

  // Calculate dynamic chart width based on data count
  const summaryChartWidth = Math.max(1000, chartData.length * 120); // 120px per branch
  const salesmanChartWidth = Math.max(1000, salesmanChartData.length * 100); // 100px per salesman

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Tabs */}
      <div className={`rounded-lg border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-blue-500 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('salesman')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'salesman'
                ? 'bg-blue-500 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Salesman
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={`rounded-lg border p-8 text-center ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading sales data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ECharts Bar Chart */}
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-sans text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sales Summary
                </h3>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className={`font-sans text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bar Graph
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {activeTab === 'salesman' ? (
                salesmanChartData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`font-sans ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No salesman data available for the selected filters
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <ReactECharts
                      option={salesmanChartOption}
                      style={{ height: '350px', width: `${salesmanChartWidth}px` }}
                      theme={isDark ? 'dark' : undefined}
                    />
                  </div>
                )
              ) : (
                chartData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`font-sans ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No data available for the selected filters
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <ReactECharts
                      option={summaryChartOption}
                      style={{ height: '350px', width: `${summaryChartWidth}px` }}
                      theme={isDark ? 'dark' : undefined}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* TanStack Table */}
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
              <h3 className={`font-sans text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'summary' ? 'Branch Sales Summary' : 'Salesman Performance'}
              </h3>
              <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {tableData.length} {activeTab === 'summary' ? 'branches' : 'salesmen'}
              </p>
            </div>
            <div className="p-4">
              <EnhancedDataTable
                columns={activeTab === 'summary' ? summaryColumns : salesmanColumns}
                data={tableData}
                isDark={isDark}
                height="500px"
                enablePagination={true}
                enableSorting={true}
                pageSize={10}
              />
              
              {/* Totals Row */}
              {tableData.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="grid grid-cols-8 gap-4 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    {activeTab === 'summary' ? (
                      <>
                        <div className="col-span-2">
                          <span className="font-bold text-blue-900 dark:text-blue-300">Total</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).cashSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).cardSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).creditSales.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).insurance.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).pointsRedeemed.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-900 dark:text-blue-300">
                            {(totals as any).totalBills}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <span className="font-bold text-blue-900 dark:text-blue-300">Total</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).sale.toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="font-semibold text-blue-900 dark:text-blue-300">
                            {(totals as any).profit.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


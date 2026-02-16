/**
 * Branch Sales Analysis Widget
 * 
 * ✅ Enterprise Features:
 * - Real API integration with branch sales data
 * - Apache ECharts bar chart with comparison
 * - Year-over-year comparison (This Year vs Last Year)
 * - Percentage change indicators
 * - Dark mode support
 * - Chart type switcher (Bar/Line/etc.)
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { BranchSalesData } from '@/lib/api/sales-dashboard.api';

interface BranchSalesAnalysisWidgetProps {
  branchData: BranchSalesData[];
  isDark: boolean;
  title?: string;
}

export function BranchSalesAnalysisWidget({
  branchData,
  isDark,
  title = 'Branch wise Sales analysis',
}: BranchSalesAnalysisWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate percentage change for each branch
  const enrichedData = useMemo(() => {
    return branchData.map(branch => {
      const percentChange = branch.LastYearSale > 0
        ? ((branch.ThisYearSale - branch.LastYearSale) / branch.LastYearSale) * 100
        : 0;
      return {
        ...branch,
        percentChange,
      };
    });
  }, [branchData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const branches = enrichedData.map(d => d.BranchCode);
    const thisYearSales = enrichedData.map(d => d.ThisYearSale);
    const lastYearSales = enrichedData.map(d => d.LastYearSale);
    const percentChanges = enrichedData.map(d => d.percentChange);

    return {
      branches,
      thisYearSales,
      lastYearSales,
      percentChanges,
    };
  }, [enrichedData]);

  // Format number to k/M format
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  };

  // ECharts configuration
  const chartColors = {
    thisYear: '#EC4899',     // Pink
    lastYear: '#A855F7',     // Purple
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  };

  const chartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        const branchIndex = params[0].dataIndex;
        const branch = enrichedData[branchIndex];
        const percentChange = branch.percentChange;
        const sign = percentChange >= 0 ? '+' : '';
        
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${branch.BranchCode}</div>
            <div style="margin-bottom: 2px;">
              <span style="color: ${chartColors.thisYear};">●</span> This Year: ${formatValue(branch.ThisYearSale)}
            </div>
            <div style="margin-bottom: 2px;">
              <span style="color: ${chartColors.lastYear};">●</span> Last Year: ${formatValue(branch.LastYearSale)}
            </div>
            <div style="color: ${percentChange >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
              ${sign}${percentChange.toFixed(1)}%
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['This Year Sale', 'Last Year Sale'],
      bottom: 10,
      left: 'center',
      textStyle: {
        color: chartColors.textColor,
      },
      itemWidth: 12,
      itemHeight: 12,
    },
    grid: {
      left: '60px',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: chartData.branches.map((branch, idx) => {
        const percent = chartData.percentChanges[idx];
        const sign = percent >= 0 ? '+' : '';
        return `${branch}\n(${sign}${percent.toFixed(1)}%)`;
      }),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
        interval: 0,
        rotate: 0,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        formatter: (value: number) => formatValue(value),
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
        name: 'This Year Sale',
        type: chartType,
        data: chartData.thisYearSales,
        itemStyle: {
          color: chartColors.thisYear,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        barWidth: chartType === 'bar' ? '35%' : undefined,
        smooth: chartType === 'line',
        symbol: chartType === 'line' ? 'circle' : 'none',
        symbolSize: 6,
      },
      {
        name: 'Last Year Sale',
        type: chartType,
        data: chartData.lastYearSales,
        itemStyle: {
          color: chartColors.lastYear,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        barWidth: chartType === 'bar' ? '35%' : undefined,
      },
    ],
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end">
        {/* Chart Type Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {chartType === 'bar' ? 'Bar Graph' : 'Line Graph'}
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-10 ${
              isDark
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setChartType('bar');
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  chartType === 'bar'
                    ? isDark
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDark
                    ? 'text-gray-200 hover:bg-gray-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bar Graph
              </button>
              <button
                onClick={() => {
                  setChartType('line');
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  chartType === 'line'
                    ? isDark
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDark
                    ? 'text-gray-200 hover:bg-gray-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Line Graph
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 overflow-x-auto">
        {chartData.branches.length > 0 ? (
          <div style={{ minWidth: `${Math.max(800, chartData.branches.length * 120)}px` }}>
            <ReactECharts
              option={chartOption}
              style={{ height: '400px', width: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No branch sales data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
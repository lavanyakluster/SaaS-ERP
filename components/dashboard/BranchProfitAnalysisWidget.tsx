/**
 * Branch Profit Analysis Widget
 * 
 * ✅ Enterprise Features:
 * - Real API integration with branch profit data
 * - Apache ECharts bar chart with comparison
 * - Year-over-year comparison (This Year vs Last Year)
 * - Exact value labels on bars
 * - Percentage change indicators
 * - Dark mode support
 * - Chart type switcher (Bar/Line)
 * - Horizontal scrolling for many branches
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { BranchProfitData } from '@/lib/api/sales-dashboard.api';

interface BranchProfitAnalysisWidgetProps {
  branchData: BranchProfitData[];
  isDark: boolean;
}

export function BranchProfitAnalysisWidget({
  branchData,
  isDark,
}: BranchProfitAnalysisWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate percentage change for each branch
  const enrichedData = useMemo(() => {
    return branchData.map(branch => {
      const percentChange = branch.LastYearProfit > 0
        ? ((branch.ThisYearProfit - branch.LastYearProfit) / branch.LastYearProfit) * 100
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
    const thisYearProfit = enrichedData.map(d => d.ThisYearProfit);
    const lastYearProfit = enrichedData.map(d => d.LastYearProfit);
    const percentChanges = enrichedData.map(d => d.percentChange);

    return {
      branches,
      thisYearProfit,
      lastYearProfit,
      percentChanges,
    };
  }, [enrichedData]);

  // Format number with commas and 2 decimal places
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format Y-axis values to k/M format
  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(0) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  };

  // ECharts configuration
  const chartColors = {
    thisYear: '#EC4899',     // Pink - This Year Profit
    lastYear: '#A855F7',     // Purple - Last Year Profit
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    labelColor: isDark ? '#1f2937' : '#1f2937',
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
        const changeColor = percentChange >= 0 ? '#10b981' : '#ef4444';
        
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 6px;">${branch.BranchCode}</div>
            <div style="margin-bottom: 2px;">
              <span style="color: ${chartColors.thisYear};">●</span> 
              This Year Profit: <strong>${formatValue(branch.ThisYearProfit)}</strong>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: ${chartColors.lastYear};">●</span> 
              Last Year Profit: <strong>${formatValue(branch.LastYearProfit)}</strong>
            </div>
            <div style="color: ${changeColor}; font-weight: 600; font-size: 11px;">
              ${sign}${percentChange.toFixed(1)}% vs last year
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['This Year Profit', 'Last Year Profit'],
      bottom: 10,
      left: 'center',
      textStyle: {
        color: chartColors.textColor,
        fontSize: 12,
      },
      itemWidth: 12,
      itemHeight: 12,
      icon: 'circle',
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
      data: chartData.branches,
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        interval: 0,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Profit Amount',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: chartColors.textColor,
        fontSize: 12,
        fontWeight: 500,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        formatter: (value: number) => formatYAxisValue(value),
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
        name: 'This Year Profit',
        type: chartType,
        data: chartData.thisYearProfit,
        itemStyle: {
          color: chartColors.thisYear,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        barWidth: chartType === 'bar' ? '35%' : undefined,
        smooth: chartType === 'line',
        symbol: chartType === 'line' ? 'circle' : 'none',
        symbolSize: 6,
        label: {
          show: true,
          position: 'top',
          color: chartColors.labelColor,
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: any) => {
            return formatValue(params.value);
          },
        },
      },
      {
        name: 'Last Year Profit',
        type: chartType,
        data: chartData.lastYearProfit,
        itemStyle: {
          color: chartColors.lastYear,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        barWidth: chartType === 'bar' ? '35%' : undefined,
        smooth: chartType === 'line',
        symbol: chartType === 'line' ? 'circle' : 'none',
        symbolSize: 6,
        label: {
          show: true,
          position: 'top',
          color: chartColors.labelColor,
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: any) => {
            return formatValue(params.value);
          },
        },
      },
    ],
  };

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end">
        {/* Chart Type Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                className={`w-full px-4 py-2 text-left text-sm transition-colors rounded-t-lg ${
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
                className={`w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg ${
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
      <div className="p-4 overflow-x-auto">
        {chartData.branches.length > 0 ? (
          <div style={{ minWidth: `${Math.max(800, chartData.branches.length * 120)}px` }}>
            <ReactECharts
              option={chartOption}
              style={{ height: '350px', width: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No branch profit data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
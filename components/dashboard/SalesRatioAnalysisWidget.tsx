/**
 * Sales Ratio Analysis Widget
 * 
 * ✅ Enterprise Features:
 * - Real API integration with branch sales data
 * - Apache ECharts bar/line chart
 * - Sales percentage change calculation (positive/negative)
 * - Color-coded X-axis labels (green/red)
 * - Zero reference line
 * - Dark mode support
 * - Chart type switcher (Bar/Line)
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { BranchSalesData } from '@/lib/api/sales-dashboard.api';

interface SalesRatioAnalysisWidgetProps {
  branchData: BranchSalesData[];
  isDark: boolean;
  title?: string;
}

export function SalesRatioAnalysisWidget({
  branchData,
  isDark,
  title = 'Sales Ratio Analysis',
}: SalesRatioAnalysisWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate sales change percentage for each branch
  const salesRatioData = useMemo(() => {
    return branchData
      .map(branch => {
        // Calculate sales change percentage
        const changePercent = branch.LastYearSale > 0
          ? ((branch.ThisYearSale - branch.LastYearSale) / branch.LastYearSale) * 100
          : branch.ThisYearSale > 0 ? 100 : 0;

        return {
          branchCode: branch.BranchCode,
          branchName: branch.BranchName,
          changePercent,
          thisYearSale: branch.ThisYearSale,
          lastYearSale: branch.LastYearSale,
        };
      })
      // Sort by branch code for consistent display
      .sort((a, b) => a.branchCode.localeCompare(b.branchCode));
  }, [branchData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const branches = salesRatioData.map(d => d.branchCode);
    const changes = salesRatioData.map(d => d.changePercent);

    return { branches, changes };
  }, [salesRatioData]);

  // Format percentage
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(1) + '%';
  };

  // Format simple percentage (for bar labels)
  const formatSimplePercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  // ECharts configuration
  const chartColors = {
    cyan: '#06b6d4',        // Cyan bars to match screenshot
    green: '#10b981',       // Green for positive
    red: '#ef4444',         // Red for negative
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    labelColor: isDark ? '#d1d5db' : '#1f2937',
    zeroLineColor: isDark ? '#6b7280' : '#9ca3af',
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
        if (!Array.isArray(params) || params.length === 0) return '';
        const dataIndex = params[0].dataIndex;
        const data = salesRatioData[dataIndex];
        
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.branchCode}</div>
            <div>
              <span style="color: ${chartColors.cyan};">●</span> Sales % Change: ${formatPercent(data.changePercent)}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
              This Year: ${data.thisYearSale.toLocaleString()}<br/>
              Last Year: ${data.lastYearSale.toLocaleString()}
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Sales % Change'],
      bottom: 10,
      left: 'center',
      textStyle: {
        color: chartColors.textColor,
        fontSize: 12,
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
        formatter: (value: string, index: number) => {
          // Get the percentage for this branch
          const percent = salesRatioData[index]?.changePercent || 0;
          const percentText = formatPercent(percent);
          
          // Return rich text format for color coding
          return `{branchCode|${value}}\n{${percent >= 0 ? 'positive' : 'negative'}|${percentText}}`;
        },
        rich: {
          branchCode: {
            color: chartColors.textColor,
            fontSize: 11,
            fontWeight: 500,
          },
          positive: {
            color: chartColors.green,
            fontSize: 10,
            fontWeight: 600,
          },
          negative: {
            color: chartColors.red,
            fontSize: 10,
            fontWeight: 600,
          },
        },
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
        name: 'Sales % Change',
        type: chartType,
        data: chartData.changes,
        itemStyle: {
          color: chartColors.cyan,
          borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0,
        },
        barWidth: chartType === 'bar' ? '60%' : undefined,
        smooth: chartType === 'line',
        symbol: chartType === 'line' ? 'circle' : 'none',
        symbolSize: 8,
        label: {
          show: true,
          position: 'top',
          color: chartColors.labelColor,
          fontSize: 10,
          fontWeight: 600,
          formatter: (params: any) => {
            return formatSimplePercent(params.value);
          },
        },
        // Add baseline at 0
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: chartColors.zeroLineColor,
            type: 'dashed',
            width: 2,
          },
          label: {
            show: false,
          },
          data: [
            {
              yAxis: 0,
            },
          ],
        },
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
      <div className="p-6 overflow-x-auto">
        {chartData.branches.length > 0 ? (
          <div style={{ minWidth: `${Math.max(800, chartData.branches.length * 100)}px` }}>
            <ReactECharts
              option={chartOption}
              style={{ height: '450px', width: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No sales ratio data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

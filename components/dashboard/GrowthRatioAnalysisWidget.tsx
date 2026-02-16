/**
 * Growth Ratio Analysis Widget
 * 
 * ✅ Enterprise Features:
 * - Real API integration with branch sales data
 * - Apache ECharts bar/line chart
 * - Profit growth percentage calculation
 * - Exact percentage labels on bars
 * - Dark mode support
 * - Chart type switcher (Bar/Line)
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { BranchSalesData } from '@/lib/api/sales-dashboard.api';

interface GrowthRatioAnalysisWidgetProps {
  branchData: BranchSalesData[];
  isDark: boolean;
  title?: string;
}

export function GrowthRatioAnalysisWidget({
  branchData,
  isDark,
  title = 'Growth Ratio Analysis',
}: GrowthRatioAnalysisWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate growth percentage for each branch
  const growthData = useMemo(() => {
    return branchData
      .map(branch => {
        // Calculate profit growth percentage
        const growthPercent = branch.LastYearProfit > 0
          ? ((branch.ThisYearProfit - branch.LastYearProfit) / branch.LastYearProfit) * 100
          : branch.ThisYearProfit > 0 ? 100 : 0;

        return {
          branchCode: branch.BranchCode,
          branchName: branch.BranchName,
          growthPercent,
          thisYearProfit: branch.ThisYearProfit,
          lastYearProfit: branch.LastYearProfit,
        };
      })
      // Sort by growth percent (descending) to match screenshot
      .sort((a, b) => b.growthPercent - a.growthPercent);
  }, [branchData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const branches = growthData.map(d => d.branchCode);
    const growthPercentages = growthData.map(d => d.growthPercent);

    return { branches, growthPercentages };
  }, [growthData]);

  // Format percentage
  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  // ECharts configuration
  const chartColors = {
    pink: '#EC4899',        // Pink to match screenshot
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
        const data = growthData[dataIndex];
        
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${data.branchCode}</div>
            <div style="margin-bottom: 2px;">
              <span style="color: ${chartColors.pink};">●</span> Growth: ${formatPercent(data.growthPercent)}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
              This Year Profit: ${data.thisYearProfit.toLocaleString()}<br/>
              Last Year Profit: ${data.lastYearProfit.toLocaleString()}
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Profit % Growth'],
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
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Growth Percent',
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
          formatter: (value: number) => value.toString(),
        },
        splitLine: {
          lineStyle: {
            color: chartColors.gridColor,
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        position: 'right',
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: chartColors.textColor,
          fontSize: 11,
          formatter: (value: number) => formatPercent(value),
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Profit % Growth',
        type: chartType,
        data: chartData.growthPercentages,
        yAxisIndex: 0,
        itemStyle: {
          color: chartColors.pink,
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
          fontSize: 11,
          fontWeight: 600,
          formatter: (params: any) => {
            return formatPercent(params.value);
          },
        },
        // Add baseline at 0
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: chartColors.zeroLineColor,
            type: 'solid',
            width: 1,
          },
          data: [
            {
              yAxis: 0,
              label: {
                show: true,
                position: 'end',
                formatter: '0%',
                color: chartColors.textColor,
                fontSize: 10,
              },
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
              No growth data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
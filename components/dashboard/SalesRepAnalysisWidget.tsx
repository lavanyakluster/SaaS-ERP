/**
 * Sales Rep Analysis Widget
 * 
 * ✅ Enterprise Features:
 * - Real API integration with sales rep data
 * - Apache ECharts bar/line chart
 * - Exact value labels on bars
 * - Dark mode support
 * - Chart type switcher (Bar/Line)
 * - Professional styling matching design
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, BarChart3 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { SalesRepData } from '@/lib/api/sales-dashboard.api';

interface SalesRepAnalysisWidgetProps {
  repData: SalesRepData[];
  isDark: boolean;
  title?: string;
}

export function SalesRepAnalysisWidget({
  repData,
  isDark,
  title = 'Sales Rep Analysis',
}: SalesRepAnalysisWidgetProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sort data by sales (descending) to match screenshot
  const sortedData = useMemo(() => {
    return [...repData].sort((a, b) => b.Sale - a.Sale);
  }, [repData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = sortedData.map(d => {
      // Format: "NAME#CODE" - matching screenshot
      return d.SalesMan ? `${d.SalesMan}#${d.Code}` : `Rep#${d.Code}`;
    });
    const sales = sortedData.map(d => d.Sale);

    return { labels, sales };
  }, [sortedData]);

  // Format number for display
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format Y-axis labels
  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  };

  // ECharts configuration
  const chartColors = {
    purple: '#9333EA',      // Purple to match screenshot
    textColor: isDark ? '#9ca3af' : '#374151',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    labelColor: isDark ? '#d1d5db' : '#1f2937',
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
        const rep = sortedData[dataIndex];
        
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${rep.SalesMan || 'Rep'} #${rep.Code}</div>
            <div>
              <span style="color: ${chartColors.purple};">●</span> Sales: ${formatValue(rep.Sale)}
            </div>
            <div>
              <span style="color: #06b6d4;">●</span> Profit: ${formatValue(rep.Profit)}
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Sales'],
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
      bottom: '12%',
      top: '10%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: chartData.labels,
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
        interval: 0,
        rotate: 45,
        formatter: (value: string) => {
          // Truncate long names if needed
          if (value.length > 25) {
            return value.substring(0, 22) + '...';
          }
          return value;
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Total Sales',
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
        name: 'Sales',
        type: chartType,
        data: chartData.sales,
        itemStyle: {
          color: chartColors.purple,
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
            return formatValue(params.value);
          },
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
        {chartData.sales.length > 0 ? (
          <div style={{ minWidth: `${Math.max(800, chartData.sales.length * 100)}px` }}>
            <ReactECharts
              option={chartOption}
              style={{ height: '450px', width: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No sales rep data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
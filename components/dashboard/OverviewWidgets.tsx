/**
 * Overview Dashboard Widgets
 * 
 * ✅ Enterprise Features:
 * - Apache ECharts for all visualizations
 * - Real API integration with profit/loss endpoint
 * - Multi-tenant architecture
 * - Interactive chart type dropdowns
 * - Responsive design with dark mode
 * - Compact grid layout (2 columns)
 * - Fullscreen modal support
 */

'use client';

import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Maximize2 } from 'lucide-react';
import { ChartFullscreenModal } from './ChartFullscreenModal';

// ============================================================================
// TYPES
// ============================================================================

interface MonthlyData {
  monthNumber: number;
  income: number;
  expense: number;
  profit: number;
}

interface OverviewWidgetsProps {
  data: MonthlyData[];
  isDark: boolean;
  year: number;
  dateRange?: string;
  onFullscreen?: (widgetId: string, title: string, option: EChartsOption) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value: number | null | undefined) => {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getMonthName = (monthNum: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNum - 1] || '';
};

// Generate random color based on seed (deterministic)
const generateColorFromSeed = (seed: number) => {
  // Use seed to generate consistent pseudo-random values
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Generate vibrant colors with good saturation and lightness
  const hue = Math.floor(random(seed) * 360); // 0-360 for full color spectrum
  const saturation = 65 + Math.floor(random(seed + 1) * 25); // 65-90% for vibrant colors
  const lightness = 50 + Math.floor(random(seed + 2) * 15); // 50-65% for good visibility

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Get color by index (generates random but consistent color)
const getChartColor = (index: number) => {
  return generateColorFromSeed(index * 7919); // Use prime number for better distribution
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Dropdown Component
 */
interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  isDark: boolean;
}

const Dropdown = ({ value, options, onChange, isDark }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {value}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-20 ${
              isDark
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    isDark
                      ? 'text-gray-200 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${value === option ? (isDark ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Main Overview Widgets Component
 */
export function OverviewWidgets({ data, isDark, year, dateRange, onFullscreen }: OverviewWidgetsProps) {
  // Chart type states
  const [expenseChartType, setExpenseChartType] = useState('Spline');
  const [incomeChartType, setIncomeChartType] = useState('Radial Bar');
  const [profitChartType, setProfitChartType] = useState('Column');

  // Fullscreen modal state
  const [fullscreenModal, setFullscreenModal] = useState<{
    isOpen: boolean;
    title: string;
    option: EChartsOption | null;
  }>({
    isOpen: false,
    title: '',
    option: null,
  });

  // Handle fullscreen
  const handleFullscreen = (widgetId: string, title: string, option: EChartsOption) => {
    // Create fullscreen version with better x-axis labels
    const fullscreenOption = {
      ...option,
      grid: {
        ...(option.grid as any),
        left: '5%',
        right: '5%',
        bottom: '8%',
        top: '12%',
        containLabel: true,
      },
    };

    // Improve x-axis labels for fullscreen
    if ((option as any).xAxis) {
      fullscreenOption.xAxis = {
        ...(option as any).xAxis,
        axisLabel: {
          ...(option as any).xAxis?.axisLabel,
          fontSize: 13,
          rotate: 0,
          interval: 0, // Show all labels
        },
      };
    }

    setFullscreenModal({
      isOpen: true,
      title,
      option: fullscreenOption,
    });
  };

  const closeFullscreen = () => {
    setFullscreenModal({
      isOpen: false,
      title: '',
      option: null,
    });
  };

  // Chart data
  const chartData = useMemo(() => {
    return data.map(item => ({
      month: getMonthName(item.monthNumber),
      income: item.income,
      expense: item.expense,
      profit: item.profit,
    }));
  }, [data]);

  // Chart colors
  const chartColors = {
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  };

  // Expense Chart Options
  const expenseChartOption: EChartsOption = useMemo(() => {
    const baseOption: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.gridColor,
        borderWidth: 1,
        textStyle: { color: chartColors.textColor },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.month),
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { color: chartColors.textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { 
          color: chartColors.textColor, 
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: chartColors.gridColor, type: 'dashed' } },
      },
    };

    if (expenseChartType === 'Column') {
      return {
        ...baseOption,
        series: [{
          type: 'bar',
          data: chartData.map(d => d.expense),
          itemStyle: {
            color: '#8b5cf6',
            borderRadius: [6, 6, 0, 0],
          },
        }],
      };
    } else if (expenseChartType === 'Bar') {
      return {
        ...baseOption,
        xAxis: baseOption.yAxis as any,
        yAxis: {
          ...baseOption.xAxis as any,
          type: 'category',
        },
        series: [{
          type: 'bar',
          data: chartData.map(d => d.expense),
          itemStyle: {
            color: '#8b5cf6',
            borderRadius: [0, 6, 6, 0],
          },
        }],
      };
    } else if (expenseChartType === 'Line') {
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.expense),
          lineStyle: { color: '#8b5cf6', width: 2 },
          itemStyle: { color: '#8b5cf6' },
        }],
      };
    } else if (expenseChartType === 'Area') {
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.expense),
          lineStyle: { color: '#8b5cf6', width: 2 },
          areaStyle: { color: '#8b5cf640' },
          itemStyle: { color: '#8b5cf6' },
        }],
      };
    } else { // Spline
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.expense),
          smooth: true,
          lineStyle: { color: '#8b5cf6', width: 3 },
          itemStyle: { color: '#8b5cf6' },
        }],
      };
    }
  }, [chartData, expenseChartType, isDark, chartColors]);

  // Income Chart Options
  const incomeChartOption: EChartsOption = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + d.income, 0);

    if (incomeChartType === 'Pie') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.gridColor,
          borderWidth: 1,
          textStyle: { color: chartColors.textColor },
        },
        legend: {
          bottom: 10,
          left: 'center',
          textStyle: { color: chartColors.textColor, fontSize: 11 },
        },
        series: [{
          type: 'pie',
          radius: '60%',
          data: chartData.map((d, i) => ({
            value: d.income,
            name: d.month,
            itemStyle: { color: getChartColor(i) },
          })),
          label: { color: chartColors.textColor, fontSize: 11 },
        }],
      };
    } else if (incomeChartType === 'Donut') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.gridColor,
          borderWidth: 1,
          textStyle: { color: chartColors.textColor },
        },
        legend: {
          bottom: 10,
          left: 'center',
          textStyle: { color: chartColors.textColor, fontSize: 11 },
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: chartData.map((d, i) => ({
            value: d.income,
            name: d.month,
            itemStyle: { color: getChartColor(i) },
          })),
          label: { color: chartColors.textColor, fontSize: 11 },
        }],
      };
    } else if (incomeChartType === 'Polar Area') {
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.gridColor,
          borderWidth: 1,
          textStyle: { color: chartColors.textColor },
        },
        angleAxis: {
          type: 'category',
          data: chartData.map(d => d.month),
          axisLabel: { color: chartColors.textColor },
          axisLine: { lineStyle: { color: chartColors.gridColor } },
        },
        radiusAxis: {
          axisLabel: { color: chartColors.textColor },
          axisLine: { lineStyle: { color: chartColors.gridColor } },
          splitLine: { lineStyle: { color: chartColors.gridColor } },
        },
        polar: {
          radius: '70%',
        },
        series: [{
          type: 'bar',
          data: chartData.map((d, i) => ({
            value: d.income,
            itemStyle: { color: getChartColor(i) },
          })),
          coordinateSystem: 'polar',
          label: {
            show: false,
          },
        }],
      };
    } else { // Radial Bar
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: chartColors.backgroundColor,
          borderColor: chartColors.gridColor,
          borderWidth: 1,
          textStyle: { color: chartColors.textColor },
        },
        legend: {
          bottom: 10,
          left: 'center',
          textStyle: { color: chartColors.textColor, fontSize: 11 },
          data: chartData.map(d => d.month),
        },
        series: [{
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '45%'],
          roseType: 'area',
          data: chartData.map((d, i) => ({
            value: d.income,
            name: d.month,
            itemStyle: { 
              color: getChartColor(i),
              borderRadius: 8,
              borderColor: isDark ? '#1f2937' : '#ffffff',
              borderWidth: 3,
            },
          })),
          label: {
            show: false,
          },
          labelLine: { show: false },
        }],
      };
    }
  }, [chartData, incomeChartType, isDark, chartColors]);

  // Report Chart (Combined)
  const reportChartOption: EChartsOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.gridColor,
        borderWidth: 1,
        textStyle: { color: chartColors.textColor },
      },
      legend: {
        data: ['Profit', 'Income', 'Expense'],
        top: 0,
        right: 20,
        textStyle: { color: chartColors.textColor, fontSize: 12 },
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
        data: chartData.map(d => d.month),
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { color: chartColors.textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { color: chartColors.textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: chartColors.gridColor, type: 'dashed' } },
      },
      series: [
        {
          name: 'Profit',
          type: 'bar',
          data: chartData.map(d => d.profit),
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [6, 6, 0, 0],
          },
        },
        {
          name: 'Income',
          type: 'line',
          data: chartData.map(d => d.income),
          smooth: true,
          lineStyle: { color: '#06b6d4', width: 2 },
          areaStyle: { color: '#06b6d440' },
          itemStyle: { color: '#06b6d4' },
        },
        {
          name: 'Expense',
          type: 'line',
          data: chartData.map(d => d.expense),
          smooth: true,
          lineStyle: { color: '#f59e0b', width: 2 },
          areaStyle: { color: '#f59e0b40' },
          itemStyle: { color: '#f59e0b' },
        },
      ],
    };
  }, [chartData, isDark, chartColors]);

  // Top Profit Chart
  const topProfitChartOption: EChartsOption = useMemo(() => {
    const baseOption: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.gridColor,
        borderWidth: 1,
        textStyle: { color: chartColors.textColor },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.month),
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { color: chartColors.textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: chartColors.gridColor } },
        axisLabel: { color: chartColors.textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: chartColors.gridColor, type: 'dashed' } },
      },
    };

    if (profitChartType === 'Column') {
      return {
        ...baseOption,
        series: [{
          type: 'bar',
          data: chartData.map(d => d.profit),
          itemStyle: {
            color: '#ec4899',
            borderRadius: [6, 6, 0, 0],
          },
        }],
      };
    } else if (profitChartType === 'Bar') {
      return {
        ...baseOption,
        xAxis: baseOption.yAxis as any,
        yAxis: {
          ...baseOption.xAxis as any,
          type: 'category',
        },
        series: [{
          type: 'bar',
          data: chartData.map(d => d.profit),
          itemStyle: {
            color: '#ec4899',
            borderRadius: [0, 6, 6, 0],
          },
        }],
      };
    } else if (profitChartType === 'Line') {
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.profit),
          lineStyle: { color: '#ec4899', width: 2 },
          itemStyle: { color: '#ec4899' },
        }],
      };
    } else if (profitChartType === 'Area') {
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.profit),
          lineStyle: { color: '#ec4899', width: 2 },
          areaStyle: { color: '#ec489940' },
          itemStyle: { color: '#ec4899' },
        }],
      };
    } else { // Spline
      return {
        ...baseOption,
        series: [{
          type: 'line',
          data: chartData.map(d => d.profit),
          smooth: true,
          lineStyle: { color: '#ec4899', width: 3 },
          itemStyle: { color: '#ec4899' },
        }],
      };
    }
  }, [chartData, profitChartType, isDark, chartColors]);

  const monthCount = data.length;
  const monthText = `${monthCount} Month${monthCount !== 1 ? 's' : ''}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Expense Chart */}
      <div className={`rounded-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-4 py-3 border-b flex items-start justify-between ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div>
            <h3 className={`font-sans text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Expense : Year {year}
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {monthText}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              value={expenseChartType}
              options={['Column', 'Bar', 'Line', 'Area', 'Spline']}
              onChange={setExpenseChartType}
              isDark={isDark}
            />
            {onFullscreen && (
              <button
                onClick={() => handleFullscreen('expense', `Expense : Year ${year}`, expenseChartOption)}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
                title="Expand chart"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <ReactECharts
            option={expenseChartOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      {/* Income Chart */}
      <div className={`rounded-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-4 py-3 border-b flex items-start justify-between ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div>
            <h3 className={`font-sans text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Income : {year}
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {monthText}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              value={incomeChartType}
              options={['Pie', 'Donut', 'Polar Area', 'Radial Bar']}
              onChange={setIncomeChartType}
              isDark={isDark}
            />
            {onFullscreen && (
              <button
                onClick={() => handleFullscreen('income', `Income : Year ${year}`, incomeChartOption)}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
                title="Expand chart"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <ReactECharts
            option={incomeChartOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      {/* Report Chart */}
      <div className={`rounded-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-4 py-3 border-b flex items-start justify-between ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div>
            <h3 className={`font-sans text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Report: Year {year}
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {monthText}
            </p>
          </div>
          {onFullscreen && (
            <button
              onClick={() => handleFullscreen('report', `Report: Year ${year}`, reportChartOption)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              title="Expand chart"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="p-4">
          <ReactECharts
            option={reportChartOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      {/* Top Profit Chart */}
      <div className={`rounded-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-4 py-3 border-b flex items-start justify-between ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <div>
            <h3 className={`font-sans text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Profit : Year {year}
            </h3>
            <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {monthText}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dropdown
              value={profitChartType}
              options={['Column', 'Bar', 'Line', 'Area', 'Spline']}
              onChange={setProfitChartType}
              isDark={isDark}
            />
            {onFullscreen && (
              <button
                onClick={() => handleFullscreen('profit', `Top Profit : Year ${year}`, topProfitChartOption)}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
                title="Expand chart"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <ReactECharts
            option={topProfitChartOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenModal.isOpen && fullscreenModal.option && (
        <ChartFullscreenModal
          isOpen={fullscreenModal.isOpen}
          title={fullscreenModal.title}
          option={fullscreenModal.option}
          isDark={isDark}
          onClose={closeFullscreen}
        />
      )}
    </div>
  );
}

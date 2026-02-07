'use client';

import { useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Maximize2, MoreVertical, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Table as TableIcon } from 'lucide-react';

interface ModernChartWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  isDark: boolean;
  defaultChartType?: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table' | 'area';
  onFullscreen?: (id: string) => void;
  compact?: boolean;
  tableFirstColumnName?: string; // Optional custom name for first column in table view
  customMetric?: { value: string; label: string }; // For displaying circular progress indicator with value
  showCategoryHeaders?: boolean; // Show category headers in table view (for Balance Sheet)
  showMetricAndChart?: boolean; // NEW: Show both metric circle AND chart in same widget
}

export function ModernChartWidget({
  id,
  title,
  subtitle,
  data,
  dataKeys,
  isDark,
  defaultChartType = 'column',
  onFullscreen,
  compact = false,
  tableFirstColumnName = 'Period', // Default to 'Period'
  customMetric,
  showCategoryHeaders = false,
  showMetricAndChart = false,
}: ModernChartWidgetProps) {
  const [chartType, setChartType] = useState<'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table' | 'area'>(defaultChartType);
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    if (onFullscreen) {
      onFullscreen(id);
    }
  };

  const chartOptions = [
    { type: 'column' as const, icon: BarChart3, label: 'Column Chart' },
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
    { type: 'line' as const, icon: LineChartIcon, label: 'Line Chart' },
    { type: 'pie' as const, icon: PieChartIcon, label: 'Pie Chart' },
    { type: 'donut' as const, icon: PieChartIcon, label: 'Donut Chart' },
    { type: 'table' as const, icon: TableIcon, label: 'Table View' },
    { type: 'area' as const, icon: LineChartIcon, label: 'Area Chart' },
  ];

  const renderChart = () => {
    if (chartType === 'table') {
      // Table view with proper overflow handling
      return (
        <div className="h-full overflow-auto">
          <table className="w-full text-sm">
            <thead className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {tableFirstColumnName}
                </th>
                {dataKeys.map((key) => (
                  <th
                    key={key.key}
                    className={`text-right py-3 px-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {key.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b transition-colors ${
                    isDark
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {row.name}
                  </td>
                  {dataKeys.map((key) => (
                    <td
                      key={key.key}
                      className={`py-3 px-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {typeof row[key.key] === 'number'
                        ? row[key.key].toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : row[key.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // **AGGRESSIVE DEBUGGING**
    console.log('🔍 ModernChartWidget Debug:', {
      id,
      title,
      chartType,
      dataLength: data.length,
      dataSample: data.slice(0, 3),
      dataKeys: dataKeys.map(k => k.key),
      allDataValues: data.map(d => dataKeys.map(k => ({ key: k.key, value: d[k.key] }))),
    });

    if (chartType === 'pie' || chartType === 'donut') {
      const pieData = data.map((item, index) => ({
        ...item,
        value: item[dataKeys[0]?.key] || item.value,
        fill: dataKeys[index]?.color || `hsl(${index * 45}, 70%, 50%)`,
      }));

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? '60%' : 0}
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              label={(entry) => entry.name}
              animationBegin={0}
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      // Custom tooltip formatter
      const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
          <div
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </p>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 mt-1">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: entry.color,
                    borderRadius: '2px',
                  }}
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {entry.name}:
                </span>
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {typeof entry.value === 'number'
                    ? entry.value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        );
      };

      // Custom axis tick formatter for numbers
      const formatAxisTick = (value: any) => {
        if (typeof value === 'number') {
          // Format large numbers with K, M suffixes
          if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        return value;
      };

      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tickFormatter={formatAxisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key) => (
              <Line
                key={key.key}
                type="monotone"
                dataKey={key.key}
                stroke={key.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      // Custom tooltip formatter
      const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
          <div
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </p>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 mt-1">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: entry.color,
                    borderRadius: '2px',
                  }}
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {entry.name}:
                </span>
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {typeof entry.value === 'number'
                    ? entry.value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        );
      };

      // Custom axis tick formatter for numbers
      const formatAxisTick = (value: any) => {
        if (typeof value === 'number') {
          // Format large numbers with K, M suffixes
          if (Math.abs(value) >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (Math.abs(value) >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        return value;
      };

      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key.key} id={`gradient-${key.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={key.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={key.color} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tickFormatter={formatAxisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key) => (
              <Area
                key={key.key}
                type="monotone"
                dataKey={key.key}
                stroke={key.color}
                fillOpacity={1}
                fill={`url(#gradient-${key.key})`}
                strokeWidth={2}
                animationDuration={800}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Column or Bar chart
    const ChartComponent = BarChart;
    const BarComponent = Bar;
    const layout = chartType === 'bar' ? 'horizontal' : 'vertical';

    // Calculate max value from data for proper domain
    const maxValue = Math.max(
      ...data.flatMap(item => 
        dataKeys.map(key => {
          const value = item[key.key];
          return typeof value === 'number' ? Math.abs(value) : 0;
        })
      ),
      1 // Minimum of 1 to avoid division by zero
    );

    // Calculate domain with 10% padding
    const calculatedDomain = [0, Math.ceil(maxValue * 1.1)];

    // Debug logging
    console.log('📊 Chart Debug:', {
      chartType,
      layout,
      dataLength: data.length,
      dataSample: data.slice(0, 2),
      dataKeys: dataKeys.map(k => k.key),
      maxValue,
      calculatedDomain,
    });

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      return (
        <div
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  borderRadius: '2px',
                }}
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {entry.name}:
              </span>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    };

    // Custom axis tick formatter for numbers
    const formatAxisTick = (value: any) => {
      if (typeof value === 'number') {
        // Format large numbers with K, M suffixes
        if (Math.abs(value) >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (Math.abs(value) >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
      }
      return value;
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'} 
            tickFormatter={formatAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key) => (
            <BarComponent
              key={key.key}
              dataKey={key.key}
              fill={key.color}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div
      ref={widgetRef}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-xl border h-full group transition-all duration-300 cursor-pointer ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${isHovered ? 'shadow-2xl scale-[1.01] ring-2 ring-blue-500/50' : 'shadow-sm'}`}
      style={{ animation: 'fadeInUp 0.5s ease-out' }}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />

      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex-1">
          <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <div className="relative">
            <button
              onClick={() => setShowChartMenu(!showChartMenu)}
              className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Change Chart Type"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showChartMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowChartMenu(false)}
                />
                <div
                  className={`absolute right-0 top-10 rounded-lg border shadow-xl z-20 py-1 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  {chartOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => {
                          setChartType(option.type);
                          setShowChartMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-all hover:translate-x-1 ${
                          chartType === option.type
                            ? isDark
                              ? 'bg-blue-500/20 text-blue-400 font-medium'
                              : 'bg-blue-50 text-blue-600 font-medium'
                            : isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleDoubleClick}
            className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className={`${compact ? 'p-3 h-[calc(100%-60px)]' : 'p-4 h-[calc(100%-70px)]'}`}>
        {customMetric && showMetricAndChart ? (
          <div className="h-full flex flex-col">
            {/* Circular Progress Indicator */}
            <div className="flex justify-center items-center mb-4">
              <div className="relative w-32 h-32">
                {/* Circular Progress SVG */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={isDark ? '#374151' : '#e5e7eb'}
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={dataKeys[0]?.color || '#3b82f6'}
                    strokeWidth="8"
                    strokeDasharray={`${parseFloat(customMetric.value) * 3.52} 352`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {customMetric.value}
                  </span>
                </div>
              </div>
            </div>
            {/* Chart Below */}
            <div className="flex-1">
              {renderChart()}
            </div>
          </div>
        ) : customMetric && !showMetricAndChart ? (
          <div className="h-full flex flex-col items-center justify-center">
            {/* Only show circular metric */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={isDark ? '#374151' : '#e5e7eb'}
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={dataKeys[0]?.color || '#3b82f6'}
                  strokeWidth="10"
                  strokeDasharray={`${parseFloat(customMetric.value) * 4.4} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {customMetric.value}
                </span>
                <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {customMetric.label}
                </span>
              </div>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
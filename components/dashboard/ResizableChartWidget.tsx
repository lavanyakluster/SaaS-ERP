'use client';

import { useState } from 'react';
import { Resizable } from 're-resizable';
import { ChevronDown, MoreVertical, Trash2, GripVertical, Settings2, Copy } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type WidgetSize = 'small' | 'medium' | 'large' | 'full';

interface ResizableChartWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  chartType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  isDark: boolean;
  size: WidgetSize;
  onRemove?: (id: string) => void;
  onChangeChartType?: (id: string, type: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table') => void;
  onChangeSize?: (id: string, size: WidgetSize) => void;
  onDuplicate?: (id: string) => void;
  onFullscreen?: (id: string) => void;
  onDoubleClick?: () => void;
  onCustomize?: () => void;
  hideHeader?: boolean;
}

export function ResizableChartWidget({
  id,
  title,
  subtitle,
  chartType,
  data,
  dataKeys,
  isDark,
  size,
  onRemove,
  onChangeChartType,
  onChangeSize,
  onDuplicate,
  onFullscreen,
  onDoubleClick,
  onCustomize,
  hideHeader,
}: ResizableChartWidgetProps) {
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const chartTypeLabels = {
    column: 'Column',
    bar: 'Bar',
    line: 'Line',
    donut: 'Donut',
    pie: 'Pie',
    table: 'Table',
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              {dataKeys.map((key) => (
                <Line
                  key={key.key}
                  type="monotone"
                  dataKey={key.key}
                  stroke={key.color}
                  strokeWidth={3}
                  name={key.label}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'column':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              {dataKeys.map((key) => (
                <Bar
                  key={key.key}
                  dataKey={key.key}
                  fill={key.color}
                  name={key.label}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f3f4f6'} horizontal={false} />
              <XAxis 
                type="number"
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                dataKey="name"
                type="category"
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '11px' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              {dataKeys.map((key) => (
                <Bar
                  key={key.key}
                  dataKey={key.key}
                  fill={key.color}
                  name={key.label}
                  radius={[0, 4, 4, 0]}
                />
              ))}</BarChart>
          </ResponsiveContainer>
        );

      case 'donut':
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKeys[0]?.key || 'value'}
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? '60%' : 0}
                outerRadius="70%"
                paddingAngle={2}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={dataKeys[index % dataKeys.length]?.color || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="w-full h-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </th>
                  {dataKeys.map((key) => (
                    <th key={key.key} className={`text-right py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {key.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {row.name}
                    </td>
                    {dataKeys.map((key) => (
                      <td key={key.key} className={`text-right py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row[key.key]?.toLocaleString() || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="h-full relative animate-in fade-in duration-300"
    >
      <Resizable
        defaultSize={{
          width: '100%',
          height: '100%',
        }}
        minHeight={250}
        minWidth={300}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false,
        }}
        handleStyles={{
          right: {
            width: '8px',
            right: '-4px',
            cursor: 'ew-resize',
          },
          bottom: {
            height: '8px',
            bottom: '-4px',
            cursor: 'ns-resize',
          },
          bottomRight: {
            width: '12px',
            height: '12px',
            right: '-6px',
            bottom: '-6px',
            cursor: 'nwse-resize',
          },
        }}
        handleClasses={{
          right: `opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`,
          bottom: `opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`,
          bottomRight: `opacity-0 group-hover:opacity-100 transition-opacity rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`,
        }}
        className="group"
      >
        <div className={`rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-200`}>
          {/* Drag Handle */}
          <div className={`absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-grab active:cursor-grabbing p-1 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <GripVertical className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>

          {/* Header */}
          {!hideHeader && (
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Customize Button */}
                  {onCustomize && (
                    <button
                      onClick={onCustomize}
                      className={`p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                        isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                      }`}
                      title="Customize Chart"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Chart Type Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowChartMenu(!showChartMenu)}
                      className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isDark 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {chartTypeLabels[chartType]}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showChartMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowChartMenu(false)}
                        />
                        <div 
                          className={`absolute right-0 top-8 w-32 rounded-lg border shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-150 ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          {Object.entries(chartTypeLabels).map(([type, label]) => (
                            <button
                              key={type}
                              onClick={() => {
                                if (onChangeChartType) {
                                  onChangeChartType(id, type as any);
                                }
                                setShowChartMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-all hover:translate-x-1 ${
                                chartType === type
                                  ? isDark
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : isDark
                                    ? 'text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu(!showActionMenu)}
                      className={`p-1.5 rounded transition-all hover:scale-110 active:scale-90 ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActionMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowActionMenu(false)}
                        />
                        <div 
                          className={`absolute right-0 top-8 w-40 rounded-lg border shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-150 ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          {onFullscreen && (
                            <button
                              onClick={() => {
                                onFullscreen(id);
                                setShowActionMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-all hover:translate-x-1 ${
                                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Settings2 className="w-4 h-4" />
                              Fullscreen
                            </button>
                          )}
                          {onDuplicate && (
                            <button
                              onClick={() => {
                                onDuplicate(id);
                                setShowActionMenu(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-all hover:translate-x-1 ${
                                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                          )}
                          {onRemove && (
                            <>
                              <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                              <button
                                onClick={() => {
                                  onRemove(id);
                                  setShowActionMenu(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-all hover:translate-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="flex-1 p-5 min-h-0">
            {renderChart()}
          </div>
        </div>
      </Resizable>
    </div>
  );
}
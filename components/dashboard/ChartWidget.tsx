'use client';

import { useState } from 'react';
import { MoreVertical, Maximize2, X, Settings2, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type WidgetSize = 'small' | 'medium' | 'large' | 'full';

interface ChartWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  chartType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  isDark: boolean;
  size: WidgetSize;
  onFullscreen?: (id: string) => void;
}

export function ChartWidget({
  id,
  title,
  subtitle,
  chartType,
  data,
  dataKeys,
  isDark,
  size,
  onFullscreen,
}: ChartWidgetProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = () => {
    if (onFullscreen) {
      onFullscreen(id);
    }
  };

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No data available
          </p>
        </div>
      );
    }

    const colors = dataKeys.map(k => k.color);

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Line
                  key={key.key}
                  type="monotone"
                  dataKey={key.key}
                  stroke={key.color}
                  strokeWidth={2}
                  name={key.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'column':
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={chartType === 'bar' ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              {chartType === 'column' ? (
                <>
                  <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                </>
              ) : (
                <>
                  <XAxis type="number" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                </>
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
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

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? '60%' : '0%'}
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                label={(entry) => entry.name}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div className="overflow-auto h-full">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Name
                  </th>
                  {dataKeys.map((key) => (
                    <th
                      key={key.key}
                      className={`px-4 py-3 text-right text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
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
                    className={`border-b transition-colors hover:bg-opacity-50 ${
                      isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {row.name}
                    </td>
                    {dataKeys.map((key) => (
                      <td
                        key={key.key}
                        className={`px-4 py-3 text-sm text-right font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                      >
                        {row[key.key]?.toLocaleString() || 0}
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
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${
        isHovered 
          ? 'shadow-2xl scale-[1.02] ring-2 ring-blue-500/50' 
          : 'shadow-sm hover:shadow-lg'
      }`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Header */}
      <div className={`relative z-10 px-5 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              {/* Live indicator */}
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            </div>
            {subtitle && (
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen && onFullscreen(id);
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className={`absolute right-0 top-8 w-48 rounded-lg border shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-150 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <button
                      onClick={() => {
                        onFullscreen && onFullscreen(id);
                        setShowMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Maximize2 className="w-4 h-4" />
                      View Fullscreen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative z-10 p-5" style={{ height: 'calc(100% - 80px)' }}>
        {renderChart()}
      </div>

      {/* Hover Border Animation */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
        isHovered
          ? `ring-2 ring-blue-500/50 ring-offset-2 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'}`
          : ''
      }`} />
    </div>
  );
}

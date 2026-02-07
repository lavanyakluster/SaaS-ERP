'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, Maximize2, MoreVertical } from 'lucide-react';

interface SalesAnalysisWidgetProps {
  isDark: boolean;
  onFullscreen?: () => void;
}

export function SalesAnalysisWidget({ isDark, onFullscreen }: SalesAnalysisWidgetProps) {
  const [activeTab, setActiveTab] = useState<'wise' | 'profit' | 'analysis' | 'rep'>('analysis');
  const [showBarGraphDropdown, setShowBarGraphDropdown] = useState(false);
  const [barGraphView, setBarGraphView] = useState('Bar Graph');
  const [isHovered, setIsHovered] = useState(false);

  // Growth Rate Analysis Data
  const growthRateData = [
    { month: 'M71', growth: 627.6 },
    { month: 'M72', growth: 183.2 },
    { month: 'M73', growth: 178.8 },
    { month: 'M74', growth: 86.7 },
    { month: 'M75', growth: 88.6 },
    { month: 'M76', growth: 87.7 },
    { month: 'M77', growth: 92.2 },
    { month: 'M78', growth: 88.6 },
    { month: 'M79', growth: 89.9 },
    { month: 'M80', growth: 88.6 },
    { month: 'M81', growth: 88.6 },
    { month: 'M82', growth: 87.9 },
  ];

  // Sales Growth Data
  const salesGrowthData = [
    { name: 'Male', value: 3500, color: '#8b5cf6' },
    { name: 'Female', value: 2800, color: '#06b6d4' },
  ];

  // Sales Rep Data
  const salesRepData = [
    { rep: 'Mary Brown/M74', sales: '1672.76', profit: '886.32' },
    { rep: 'Michael/Suspec/M25', sales: '202.50', profit: '21.44' },
    { rep: 'Online Pharmacy', sales: '10.00', profit: '13.27' },
    { rep: 'Paula Sanders/M73', sales: '#17134.64', profit: '12215.76' },
  ];

  const tabs = [
    { id: 'wise' as const, label: 'Branch Wise Sales' },
    { id: 'profit' as const, label: 'Branch Wise Profit' },
    { id: 'analysis' as const, label: 'Sales Rep. Analysis' },
    { id: 'rep' as const, label: 'Growth Rate Analysis' },
  ];

  const maxGrowth = Math.max(...growthRateData.map(d => d.growth));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-xl border overflow-hidden group transition-all duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${isHovered ? 'shadow-2xl scale-[1.01]' : 'shadow-sm'}`}
      style={{ animation: 'fadeInUp 0.5s ease-out' }}
    >
      {/* Tabs Header */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? isDark
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-blue-600 text-blue-600 bg-blue-50'
                    : isDark
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={onFullscreen}
            className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'rep' && (
          <div className="space-y-4">
            {/* Title and Bar Graph Selector */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Growth Rate Analysis
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowBarGraphDropdown(!showBarGraphDropdown)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 min-w-[120px] ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {barGraphView}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showBarGraphDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowBarGraphDropdown(false)} />
                    <div
                      className={`absolute right-0 top-10 rounded-lg border shadow-xl z-20 py-1 min-w-[120px] ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      {['Bar Graph', 'Line Graph', 'Area Chart'].map((view) => (
                        <button
                          key={view}
                          onClick={() => {
                            setBarGraphView(view);
                            setShowBarGraphDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs transition-all ${
                            barGraphView === view
                              ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                              : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Growth Rate Chart */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: '0%', position: 'insideLeft', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Growth']}
                  />
                  <Bar dataKey="growth" radius={[4, 4, 0, 0]} animationDuration={800}>
                    {growthRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#ec4899" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-pink-500" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Growth % Growth</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Sales Growth */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sales Growth
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setShowBarGraphDropdown(!showBarGraphDropdown)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 min-w-[120px] ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bar Graph
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="h-[280px] flex items-end justify-center gap-8 px-4">
                {salesGrowthData.map((item, index) => (
                  <div key={item.name} className="flex flex-col items-center gap-2" style={{ animation: `growBar 0.8s ease-out ${index * 0.2}s both` }}>
                    <div
                      className="w-24 rounded-t-lg relative group/bar transition-all duration-300 hover:scale-105"
                      style={{
                        height: `${(item.value / 4000) * 100}%`,
                        backgroundColor: item.color,
                        minHeight: '150px',
                      }}
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                        }`}>
                          {item.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-purple-600" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Male</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-cyan-500" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Female</span>
                </div>
              </div>
            </div>

            {/* Right Side - Sales Rep Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Top Sales
                </h3>
                <button className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                  View all
                </button>
              </div>

              <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full text-xs">
                  <thead className={`${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <tr>
                      <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Rep
                      </th>
                      <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sales
                      </th>
                      <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesRepData.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-t transition-all ${
                          isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                        }`}
                        style={{ animation: `slideUp 0.3s ease-out ${index * 0.1}s both` }}
                      >
                        <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{row.rep}</td>
                        <td className={`p-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {row.sales}
                        </td>
                        <td className={`p-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {row.profit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'wise' || activeTab === 'profit') && (
          <div className="flex items-center justify-center h-[400px]">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeTab === 'wise' ? 'Branch Wise Sales' : 'Branch Wise Profit'} data coming soon...
            </p>
          </div>
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

        @keyframes growBar {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
          }
        }
      `}</style>
    </div>
  );
}

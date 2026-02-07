'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BranchSalesData, SalesRepData } from '@/lib/api/sales-dashboard.api';

interface BranchAnalysisDashboardProps {
  isDark: boolean;
  branchSalesData?: BranchSalesData[];
  salesRepData?: SalesRepData[];
}

type TabType = 'sales' | 'profit' | 'ratio' | 'growth' | 'rep';
type ChartType = 'bar' | 'line' | 'column';
type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<any>;
};

export function BranchAnalysisDashboard({ 
  isDark, 
  branchSalesData: apibranchSalesData,
  salesRepData: apiSalesRepData 
}: BranchAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showChartMenu, setShowChartMenu] = useState(false);

  // ✅ Transform API data to chart format
  const branchSalesData = useMemo(() => {
    if (!apibranchSalesData || apibranchSalesData.length === 0) {
      return [];
    }

    return apibranchSalesData.map(item => ({
      name: item.BranchCode,
      thisYear: item.ThisYearSale,
      lastYear: item.LastYearSale,
      growth: item.LastYearSale 
        ? `${((item.ThisYearSale - item.LastYearSale) / item.LastYearSale * 100).toFixed(1)}%`
        : 'N/A',
      growthValue: item.LastYearSale 
        ? ((item.ThisYearSale - item.LastYearSale) / item.LastYearSale * 100)
        : 0,
    }));
  }, [apibranchSalesData]);

  // ✅ Transform API data for profit
  const branchProfitData = useMemo(() => {
    if (!apibranchSalesData || apibranchSalesData.length === 0) {
      return [];
    }

    return apibranchSalesData.map(item => ({
      name: item.BranchCode,
      thisYear: item.ThisYearProfit,
      lastYear: item.LastYearProfit,
      growth: item.LastYearProfit 
        ? `${((item.ThisYearProfit - item.LastYearProfit) / item.LastYearProfit * 100).toFixed(1)}%`
        : 'N/A',
      growthValue: item.LastYearProfit 
        ? ((item.ThisYearProfit - item.LastYearProfit) / item.LastYearProfit * 100)
        : 0,
    }));
  }, [apibranchSalesData]);

  // ✅ Sales Ratio Analysis Data (Growth percentage)
  const salesRatioData = useMemo(() => {
    if (!apibranchSalesData || apibranchSalesData.length === 0) {
      return [];
    }

    return apibranchSalesData.map(item => {
      const ratio = item.LastYearSale 
        ? ((item.ThisYearSale - item.LastYearSale) / item.LastYearSale * 100)
        : 0;
      return {
        name: item.BranchCode,
        ratio,
        label: `${ratio.toFixed(1)}%`,
      };
    });
  }, [apibranchSalesData]);

  // ✅ Transform Sales Rep data
  const salesRepData = useMemo(() => {
    if (!apiSalesRepData || apiSalesRepData.length === 0) {
      return [];
    }

    return apiSalesRepData.map(item => ({
      name: item.SalesMan ? `${item.SalesMan}#${item.Code}` : `Rep #${item.Code}`,
      sales: item.Sale,
      profit: item.Profit,
      displayName: item.SalesMan ? `${item.SalesMan}#${item.Code}` : `Rep #${item.Code}`,
    }));
  }, [apiSalesRepData]);

  // Sales Growth Data (same as sales ratio for now)
  const salesGrowthData = useMemo(() => {
    if (branchSalesData.length === 0) return [];
    
    return branchSalesData.map(item => ({
      name: item.name,
      sales: item.thisYear,
      profit: 0, // We don't have monthly profit breakdown
    }));
  }, [branchSalesData]);

  const tabs = [
    { id: 'sales' as TabType, label: 'Branch Wise Sales' },
    { id: 'profit' as TabType, label: 'Branch Wise Profit' },
    { id: 'ratio' as TabType, label: 'Sales Ratio Analysis' },
    { id: 'growth' as TabType, label: 'Growth Ratio Analysis' },
    { id: 'rep' as TabType, label: 'Sales Rep Analysis' },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'sales':
        return branchSalesData;
      case 'profit':
        return branchProfitData;
      case 'ratio':
        return salesRatioData;
      case 'growth':
        return salesRatioData;
      case 'rep':
        return salesRepData;
      default:
        return branchSalesData;
    }
  };

  const getChartTitle = () => {
    switch (activeTab) {
      case 'sales':
        return 'Branch wise Sales analysis';
      case 'profit':
        return 'Branch wise Profit analysis';
      case 'ratio':
        return 'Sales Ratio Analysis';
      case 'growth':
        return 'Growth Ratio Analysis';
      case 'rep':
        return 'Sales Rep Analysis';
      default:
        return 'Analysis';
    }
  };

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg border shadow-xl p-3 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].payload.name}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-semibold">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </p>
          ))}
          {payload[0].payload.growth && (
            <p className={`text-xs mt-1 ${
              (payload[0].payload.growthValue as number) > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {payload[0].payload.growth}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = getCurrentData();

    // ✅ Show loading or empty state
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {!apibranchSalesData && !apiSalesRepData 
                ? 'Loading data...' 
                : 'No data available for the selected period'}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'rep') {
      // Sales Rep Analysis - Single bar chart
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
            <XAxis
              dataKey="displayName"
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={11}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `${value / 1000}k`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => (
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {value === 'sales' ? 'Sales' : value}
                </span>
              )}
            />
            <Bar
              dataKey="sales"
              fill="#9333ea"
              radius={[4, 4, 0, 0]}
              label={{
                position: 'top',
                fill: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 11,
                formatter: (value?: any) => {
                  if (value === undefined || value === null) return '';
                  return value.toLocaleString();
                },
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeTab === 'ratio' || activeTab === 'growth') {
      // Single bar chart for ratio analysis
      const ratioData = data as Array<{ name: string; ratio: number; label: string }>;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={0} stroke={isDark ? '#6b7280' : '#9ca3af'} strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => (
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {value === 'ratio' ? 'Sales % Change' : value}
                </span>
              )}
            />
            <Bar
              dataKey="ratio"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              label={{
                position: 'top',
                fill: isDark ? '#9ca3af' : '#6b7280',
                fontSize: 11,
                formatter: (value?: any) => {
                  if (value === undefined || value === null) return '';
                  const numericValue = typeof value === 'number' ? value : Number(value);
                  const item = ratioData.find(d => d.ratio === numericValue);
                  return item?.label || value;
                },
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Grouped bar chart for sales and profit
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis
            dataKey="name"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 1000) return `${value / 1000}k`;
              return value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {value === 'thisYear'
                  ? activeTab === 'profit'
                    ? 'This Year Profit'
                    : 'This Year Sale'
                  : value === 'lastYear'
                  ? activeTab === 'profit'
                    ? 'Last Year Profit'
                    : 'Last Year Sale'
                  : value}
              </span>
            )}
          />
          <Bar
            dataKey="thisYear"
            fill="#ec4899"
            radius={[4, 4, 0, 0]}
            label={activeTab === 'profit' ? {
              position: 'top',
              fill: isDark ? '#9ca3af' : '#6b7280',
              fontSize: 10,
              formatter: (value?: any) => {
                if (value === undefined || value === null) return '';
                return value.toLocaleString();
              },
            } : undefined}
          />
          <Bar
            dataKey="lastYear"
            fill="#9333ea"
            radius={[4, 4, 0, 0]}
            label={activeTab === 'profit' ? {
              position: 'top',
              fill: isDark ? '#9ca3af' : '#6b7280',
              fontSize: 10,
              formatter: (value?: any) => {
                if (value === undefined || value === null) return '';
                return value.toLocaleString();
              },
            } : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getChartTitle()}
            </h3>

            <div className="flex items-center gap-2">
              {/* Chart Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowChartMenu(!showChartMenu)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {chartType === 'bar' ? 'Bar Graph' : chartType === 'line' ? 'Line Graph' : 'Column Graph'}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showChartMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowChartMenu(false)}
                    />
                    <div className={`absolute right-0 top-12 rounded-lg border shadow-xl z-20 py-1 min-w-[150px] ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      {['bar', 'line', 'column'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setChartType(type as ChartType);
                            setShowChartMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-all hover:translate-x-1 ${
                            chartType === type
                              ? isDark
                                ? 'bg-blue-500/20 text-blue-400 font-medium'
                                : 'bg-blue-50 text-blue-600 font-medium'
                              : isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)} Graph
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* More Options */}
              <button
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[500px] relative">
            {renderChart()}

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
              <button
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={`h-1 w-24 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
                <div className="h-full w-1/2 bg-blue-500 rounded-full" />
              </div>
              <button
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Growth Split View - Only shown on Sales Rep Analysis tab */}
      {activeTab === 'rep' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Sales Growth Chart */}
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sales Growth
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    Bar Graph
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      stroke={isDark ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `${value / 1000}k`;
                        return value;
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                      formatter={(value) => (
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {value === 'sales' ? 'Sales' : value === 'profit' ? 'Profit' : value}
                        </span>
                      )}
                    />
                    <Bar dataKey="sales" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Rep Sales Table */}
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="bg-purple-600 px-6 py-4">
              <h3 className="font-semibold text-white">Rep Sales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Rep
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sale
                    </th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesRepData.map((rep, index) => (
                    <tr
                      key={index}
                      className={`border-b transition-colors ${
                        isDark
                          ? 'border-gray-700 hover:bg-gray-700/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {rep.displayName}
                      </td>
                      <td className={`px-6 py-4 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {rep.sales.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-sm text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {rep.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

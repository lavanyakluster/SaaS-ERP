/**
 * Enhanced Sales Dashboard Component with Tabs
 * 
 * ✅ Enterprise Features:
 * - Tab navigation: Branch Wise Sales, Branch Wise Profit, Sales Ratio, Growth Ratio, Sales Rep
 * - Real API integration with salesProfitBranch endpoint
 * - Dynamic date and branch filtering from dashboard nav
 * - This Year vs Last Year comparison
 * - Interactive bar charts
 * - Multi-tenant architecture
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSalesProfitBranch } from '@/lib/hooks/useSalesProfitBranch';
import type { Branch } from '@/lib/api/branch.api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'branchSales' | 'branchProfit' | 'salesRatio' | 'growthRatio' | 'salesRep';

interface EnhancedSalesDashboardProps {
  isDark: boolean;
  dateRange: string;
  selectedBranch: string;
  branches: Branch[] | undefined;
  fromDt: string;
  toDt: string;
}

// ============================================================================
// TABS CONFIGURATION
// ============================================================================

const TABS = [
  { id: 'branchSales' as TabType, label: 'Branch Wise Sales' },
  { id: 'branchProfit' as TabType, label: 'Branch Wise Profit' },
  { id: 'salesRatio' as TabType, label: 'Sales Ratio Analysis' },
  { id: 'growthRatio' as TabType, label: 'Growth Ratio Analysis' },
  { id: 'salesRep' as TabType, label: 'Sales Rep Analysis' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function EnhancedSalesDashboard({
  isDark,
  dateRange,
  selectedBranch,
  branches,
  fromDt,
  toDt,
}: EnhancedSalesDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('branchSales');

  // Get branch code
  const getBranchCode = (): string => {
    if (!branches || branches.length === 0) return '0';
    if (selectedBranch === 'All Branches') return '0';
    const branch = branches.find(b => b.bR_NM === selectedBranch);
    return branch ? branch.bR_COD : '0';
  };

  const branchCode = getBranchCode();

  // Fetch API data
  const { data, isLoading, error } = useSalesProfitBranch({
    fromDt,
    toDt,
    brCode: branchCode,
  }, true);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Enhanced Sales Dashboard:', {
      fromDt,
      toDt,
      branchCode,
      selectedBranch,
      dataLoaded: !!data,
    });
  }

  // Process branch sales data for chart
  const branchSalesData = useMemo(() => {
    if (!data?.Table2) return [];
    
    return data.Table2.map(item => ({
      name: item.BranchCode, // ✅ Use branch code instead of name
      fullName: item.BranchName,
      code: item.BranchCode,
      thisYear: item.ThisYearSale,
      lastYear: item.LastYearSale,
    })).sort((a, b) => b.thisYear - a.thisYear); // Sort by this year sales descending
  }, [data]);

  // Process branch profit data for chart
  const branchProfitData = useMemo(() => {
    if (!data?.Table2) return [];
    
    return data.Table2.map(item => ({
      name: item.BranchCode, // ✅ Use branch code instead of name
      fullName: item.BranchName,
      code: item.BranchCode,
      thisYear: item.ThisYearProfit,
      lastYear: item.LastYearProfit,
    })).sort((a, b) => b.thisYear - a.thisYear); // Sort by this year profit descending
  }, [data]);

  // Process sales rep data
  const salesRepData = useMemo(() => {
    if (!data?.Table1) return [];
    
    return data.Table1.map(item => ({
      name: `${item.SalesMan}#${item.Code}`, // ✅ Format as "Name#Code"
      shortName: item.SalesMan.length > 15 ? item.SalesMan.substring(0, 15) + '...' : item.SalesMan,
      fullName: item.SalesMan,
      code: item.Code,
      sales: item.Sale, // ✅ Use "sales" instead of "sale"
      profit: item.Profit,
    })).sort((a, b) => b.sales - a.sales); // Sort by sales descending
  }, [data]);

  // Process monthly data for growth ratio
  const monthlyData = useMemo(() => {
    if (!data?.Table) return [];
    
    return data.Table.map(item => ({
      month: item.YRMTH,
      sale: item.Sale,
      profit: item.Profit,
    }));
  }, [data]);

  // Calculate sales ratio (profit margin %)
  const salesRatioData = useMemo(() => {
    if (!data?.Table2) return [];
    
    return data.Table2.map(item => ({
      name: item.BranchCode, // ✅ Use branch code instead of name
      fullName: item.BranchName,
      code: item.BranchCode,
      profitMargin: item.ThisYearSale > 0 ? (item.ThisYearProfit / item.ThisYearSale) * 100 : 0,
    })).sort((a, b) => b.profitMargin - a.profitMargin);
  }, [data]);

  // Calculate growth ratio (YoY growth %)
  const growthRatioData = useMemo(() => {
    if (!data?.Table2) return [];
    
    return data.Table2.map(item => {
      const salesGrowth = item.LastYearSale > 0 
        ? ((item.ThisYearSale - item.LastYearSale) / item.LastYearSale) * 100 
        : 0;
      
      return {
        name: item.BranchCode, // ✅ Use branch code instead of name
        fullName: item.BranchName,
        code: item.BranchCode,
        growth: salesGrowth,
      };
    }).sort((a, b) => b.growth - a.growth);
  }, [data]);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'branchSales':
        return branchSalesData;
      case 'branchProfit':
        return branchProfitData;
      case 'salesRatio':
        return salesRatioData;
      case 'growthRatio':
        return growthRatioData;
      case 'salesRep':
        return salesRepData;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].payload.fullName || payload[0].payload.name}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                activeTab === 'salesRatio' || activeTab === 'growthRatio'
                  ? `${formatCurrency(entry.value)}%`
                  : formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Failed to load sales data</div>
        <p className="text-gray-600 dark:text-gray-400">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-gray-400 dark:text-gray-500">
          <TrendingUp className="w-24 h-24 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          No sales data available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Please select a different date range or branch from the dashboard header
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className={`flex items-center gap-2 p-1 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      } overflow-x-auto`}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Chart Title */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h3>
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={500}>
              <BarChart 
                data={currentData}
                margin={{ 
                  top: activeTab === 'salesRep' ? 30 : 5, 
                  right: 30, 
                  left: 50, 
                  bottom: 80 
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#374151' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => 
                    activeTab === 'salesRatio' || activeTab === 'growthRatio'
                      ? `${value.toFixed(0)}%`
                      : value.toLocaleString()
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                {activeTab === 'branchSales' && (
                  <>
                    <Legend />
                    <Bar dataKey="thisYear" name="This Year Sale" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastYear" name="Last Year Sale" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                  </>
                )}
                {activeTab === 'branchProfit' && (
                  <>
                    <Legend />
                    <Bar dataKey="thisYear" name="This Year Profit" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastYear" name="Last Year Profit" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                  </>
                )}
                {activeTab === 'salesRatio' && (
                  <Bar dataKey="profitMargin" name="Profit Margin %" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                )}
                {activeTab === 'growthRatio' && (
                  <Bar dataKey="growth" name="Growth %" fill="#10B981" radius={[4, 4, 0, 0]} />
                )}
                {activeTab === 'salesRep' && (
                  <>
                    <Bar dataKey="sales" name="Sales" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                      <LabelList 
                        dataKey="sales" 
                        position="top" 
                        formatter={(value?: any) => {
                          if (value === undefined || value === null) return '';
                          return formatCurrency(Number(value));
                        }}
                        style={{ 
                          fontSize: '10px', 
                          fill: isDark ? '#9CA3AF' : '#6B7280',
                          fontWeight: 600 
                        }}
                      />
                    </Bar>
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

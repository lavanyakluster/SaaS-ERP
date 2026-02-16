'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  Activity,
  Percent
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesTarget } from '@/lib/hooks/useSalesTarget';
import { 
  getCurrentMonthValue, 
  DASHBOARD_LIMITS
} from '@/lib/constants/dashboard';
import {
  calculateTargetOverview,
  getTopPerformingBranches,
  getBottomPerformingBranches,
  getAchievementDistribution,
  processMonthlyTrend,
  getBranchesByCategory,
  type SalesTargetOverview,
} from '@/lib/api/sales-target.api';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  iconBgColor?: string;
}

const MetricCard = ({ title, value, icon, trend, subtitle, iconBgColor = 'bg-blue-600' }: MetricCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`rounded-lg border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${iconBgColor}`}>
          <div className="text-white">{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
            trend.isPositive 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className={`font-sans text-xs font-medium mb-1 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <p className={`font-sans text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </p>
        {subtitle && (
          <p className={`font-sans text-xs mt-1 ${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// Utility functions for formatting
const formatCurrency = (value: number): string => {
  if (value == null || isNaN(value)) return '0';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const formatNumber = (value: number): string => {
  if (value == null || isNaN(value)) return '0';
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatPercentage = (value: number): string => {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};

export function SalesTargetDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthValue());
  const { data: apiResponse, isLoading, error } = useSalesTarget({ 
    month: selectedMonth,
    topN: 10 
  });

  // Extract table1 data (branch target data) from the API response
  const rawData = useMemo(() => {
    return apiResponse?.table1 || [];
  }, [apiResponse]);

  // Process data
  const overview = useMemo(() => {
    if (!rawData?.length) return null;
    return calculateTargetOverview(rawData);
  }, [rawData]);

  const monthlyTrend = useMemo(() => {
    if (!rawData?.length) return [];
    return processMonthlyTrend(rawData);
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading sales targets...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Failed to load sales targets</p>
        </div>
      </div>
    );
  }

  // ECharts colors based on theme
  const chartColors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  };

  // Monthly Trend Chart (ECharts Line)
  const monthlyTrendOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
      formatter: (params: any) => {
        const month = params[0].axisValue;
        let result = `<strong>${month}</strong><br/>`;
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${formatCurrency(item.value)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Target', 'Achieved'],
      top: 0,
      textStyle: {
        color: chartColors.textColor,
        fontSize: 12,
      },
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
      data: monthlyTrend.map(d => d.month),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 11,
        formatter: (value: number) => {
          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
          return value.toString();
        },
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
        name: 'Target',
        type: 'line',
        data: monthlyTrend.map(d => d.target),
        smooth: true,
        lineStyle: {
          color: chartColors.primary,
          width: 2,
        },
        itemStyle: {
          color: chartColors.primary,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${chartColors.primary}40` },
              { offset: 1, color: `${chartColors.primary}10` },
            ],
          },
        },
      },
      {
        name: 'Achieved',
        type: 'line',
        data: monthlyTrend.map(d => d.achieved),
        smooth: true,
        lineStyle: {
          color: chartColors.success,
          width: 2,
        },
        itemStyle: {
          color: chartColors.success,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${chartColors.success}40` },
              { offset: 1, color: `${chartColors.success}10` },
            ],
          },
        },
      },
    ],
  };

  // TanStack Table columns for branch target data
  const branchColumns: ColumnDef<any>[] = [
    { 
      accessorKey: 'tA_BRCOD',
      header: 'Branch Code', 
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue() as string}</div>
      ),
    },
    { 
      accessorKey: 'branchName',
      header: 'Branch Name', 
      cell: ({ getValue }) => (
        <div className="font-semibold min-w-[150px]">{getValue() as string}</div>
      ),
    },
    { 
      accessorKey: 'targetAmount',
      header: 'Target Amount', 
      cell: ({ getValue }) => (
        <div className="text-right">
          {formatCurrency((getValue() as number) ?? 0)}
        </div>
      ),
    },
    { 
      accessorKey: 'achievedAmount',
      header: 'Achieved Amount', 
      cell: ({ getValue }) => (
        <div className="text-right font-medium">
          {formatCurrency((getValue() as number) ?? 0)}
        </div>
      ),
    },
    { 
      accessorKey: 'variance',
      header: 'Variance', 
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return (
          <div className={`text-right font-medium ${
            value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {value >= 0 ? '+' : ''}{formatCurrency(value)}
          </div>
        );
      },
    },
    { 
      accessorKey: 'achievementPercent',
      header: 'Achievement %', 
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return (
          <div className={`text-right font-semibold ${
            value >= 100 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {value.toFixed(1)}%
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Target"
          value={formatCurrency(overview.totalTarget)}
          icon={<Target className="w-5 h-5" />}
          iconBgColor="bg-blue-600"
          subtitle={`${overview.totalBranches} branches`}
        />
        <MetricCard
          title="Total Achieved"
          value={formatCurrency(overview.totalAchieved)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-green-600"
          subtitle={`${formatPercentage(overview.achievementRate)} of target`}
        />
        <MetricCard
          title="Achievement Rate"
          value={formatPercentage(overview.achievementRate)}
          icon={<Percent className="w-5 h-5" />}
          iconBgColor="bg-purple-600"
          trend={{
            value: overview.achievementRate - 100,
            isPositive: overview.achievementRate >= 100,
          }}
        />
        <MetricCard
          title="Total Variance"
          value={formatCurrency(overview.totalVariance)}
          icon={<Activity className="w-5 h-5" />}
          iconBgColor={overview.totalVariance >= 0 ? 'bg-green-600' : 'bg-red-600'}
          subtitle={overview.totalVariance >= 0 ? 'Above target' : 'Below target'}
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className={`rounded-xl overflow-hidden ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <h3 className={`font-sans text-sm font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Monthly Trend
          </h3>
          <p className={`font-sans text-xs mt-0.5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Target vs Achievement
          </p>
        </div>
        <div className="p-6">
          <ReactECharts
            option={monthlyTrendOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
          />
        </div>
      </div>

      {/* Branch Target Analysis Table */}
      <div className={`rounded-xl overflow-hidden ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <h3 className={`font-sans text-sm font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Branch Target Analysis
          </h3>
          <p className={`font-sans text-xs mt-0.5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Detailed performance data for all branches
          </p>
        </div>
        <div className="p-4">
          <DataTable
            columns={branchColumns}
            data={rawData}
            isDark={isDark}
            enablePagination={true}
            enableSorting={true}
            enableGlobalFilter={true}
            enableFiltering={true}
          />
        </div>
      </div>
    </div>
  );
}

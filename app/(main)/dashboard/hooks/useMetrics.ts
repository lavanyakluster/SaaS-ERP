import { useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Target,
  BarChart3,
  Package,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import type { DashboardType } from '@/components/dashboard/types';
import type { MetricData } from '@/components/dashboard/MetricsGrid';

interface ProfitLossTotals {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  profitMargin: number;
}

export const useMetrics = (
  activeDashboard: DashboardType,
  totals: ProfitLossTotals | null | undefined,
  isProfitLossLoading: boolean,
  profitLossError: any
): MetricData[] => {
  return useMemo(() => {
    const formatNumber = (value: number) =>
      value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    switch (activeDashboard) {
      case 'overview':
        // Use real API data if available
        if (totals && !isProfitLossLoading && !profitLossError) {
          const changePercentage = 0; // TODO: Calculate from historical data when available
          return [
            {
              title: 'Net Income',
              value: formatNumber(totals.totalIncome),
              change: changePercentage,
              trend: changePercentage >= 0 ? ('up' as const) : ('down' as const),
              icon: DollarSign,
              status: 'good' as const,
            },
            {
              title: 'Expenses',
              value: formatNumber(totals.totalExpense),
              change: 0,
              trend: 'down' as const,
              icon: CreditCard,
              status: 'good' as const,
            },
            {
              title: 'Profit',
              value: formatNumber(totals.totalProfit),
              change: 0,
              trend: totals.totalProfit > 0 ? ('up' as const) : ('down' as const),
              icon: ShoppingCart,
              status: totals.totalProfit > 0 ? ('good' as const) : ('critical' as const),
            },
            {
              title: 'Profit Margin',
              value: `${formatNumber(totals.profitMargin)}%`,
              change: 0,
              trend: totals.profitMargin > 0 ? ('up' as const) : ('down' as const),
              icon: TrendingUp,
              status:
                totals.profitMargin > 30
                  ? ('good' as const)
                  : totals.profitMargin > 10
                  ? ('warning' as const)
                  : ('critical' as const),
            },
          ];
        }

        // Show loading state or empty state
        return [
          {
            title: 'Net Income',
            value: isProfitLossLoading ? 'Loading...' : '0.00',
            change: 0,
            trend: 'up' as const,
            icon: DollarSign,
            status: 'good' as const,
          },
          {
            title: 'Expenses',
            value: isProfitLossLoading ? 'Loading...' : '0.00',
            change: 0,
            trend: 'down' as const,
            icon: CreditCard,
            status: 'good' as const,
          },
          {
            title: 'Profit',
            value: isProfitLossLoading ? 'Loading...' : '0.00',
            change: 0,
            trend: 'up' as const,
            icon: ShoppingCart,
            status: 'good' as const,
          },
          {
            title: 'Profit Margin',
            value: isProfitLossLoading ? 'Loading...' : '0.00%',
            change: 0,
            trend: 'up' as const,
            icon: TrendingUp,
            status: 'good' as const,
          },
        ];

      case 'sales':
        // TODO: Replace with real sales API data
        return [
          {
            title: 'Total Sales',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: ShoppingCart,
            status: 'good' as const,
          },
          {
            title: 'Orders',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: Receipt,
            status: 'good' as const,
          },
          {
            title: 'Avg Order Value',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: DollarSign,
            status: 'good' as const,
          },
          {
            title: 'Conversion Rate',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: Target,
            status: 'good' as const,
          },
        ];

      case 'account':
        // TODO: Replace with real account API data
        return [
          {
            title: 'Total Assets',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: DollarSign,
            status: 'good' as const,
          },
          {
            title: 'Total Liabilities',
            value: 'No Data',
            change: 0,
            trend: 'down' as const,
            icon: CreditCard,
            status: 'warning' as const,
          },
          {
            title: 'Net Worth',
            value: 'No Data',
            change: 0,
            trend: 'down' as const,
            icon: TrendingUp,
            status: 'critical' as const,
          },
          {
            title: 'Net Profit',
            value: 'No Data',
            change: 0,
            trend: 'down' as const,
            icon: BarChart3,
            status: 'critical' as const,
          },
        ];

      case 'item':
        // TODO: Replace with real inventory API data
        return [
          {
            title: 'Total Items',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: Package,
            status: 'good' as const,
          },
          {
            title: 'In Stock',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: CheckCircle,
            status: 'good' as const,
          },
          {
            title: 'Low Stock',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: AlertCircle,
            status: 'warning' as const,
          },
          {
            title: 'Out of Stock',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: AlertCircle,
            status: 'critical' as const,
          },
        ];

      case 'sales-kpi':
        // TODO: Replace with real sales KPI API data
        return [
          {
            title: 'Target Achievement',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: Target,
            status: 'good' as const,
          },
          {
            title: 'Conversion Rate',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: TrendingUp,
            status: 'good' as const,
          },
          {
            title: 'Avg Deal Size',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: DollarSign,
            status: 'good' as const,
          },
          {
            title: 'Team Performance',
            value: 'No Data',
            change: 0,
            trend: 'up' as const,
            icon: Users,
            status: 'good' as const,
          },
        ];

      default:
        return [];
    }
  }, [activeDashboard, totals, isProfitLossLoading, profitLossError]);
};

'use client';

import { useMemo } from 'react';
import { Users, Gift, BadgePercent, Wallet, ShoppingBag, Trophy } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ColumnDef } from '@tanstack/react-table';
import { useTheme } from '@/lib/store/theme-store';
import { useLoyaltyDashboard } from '@/lib/hooks/useLoyaltyDashboard';
import { DataTable } from '@/components/ui/data-table';
import type { LoyaltyMember } from '@/lib/api/loyalty.api';

interface LoyaltyDashboardProps {
  dateFrom?: string;
  dateTo?: string;
}

const formatNumber = (value: number) =>
  value.toLocaleString('en-US', { maximumFractionDigits: 0 });

const formatMoney = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TIER_COLOR_MAP: Record<string, string> = {
  platinum: '#8b5cf6',
  gold: '#f59e0b',
  silver: '#94a3b8',
  bronze: '#b45309',
  standard: '#0ea5e9',
  unassigned: '#6b7280',
};

const TIER_ORDER: Record<string, number> = {
  platinum: 1,
  gold: 2,
  silver: 3,
  bronze: 4,
  standard: 5,
  unassigned: 6,
};

export function LoyaltyDashboard({ dateFrom, dateTo }: LoyaltyDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const today = new Date();
  const currentYear = today.getFullYear();
  const effectiveDateFrom = dateFrom || `${currentYear}-01-01`;
  const effectiveDateTo = dateTo || `${currentYear}-12-31`;

  const { data = [], isLoading, error } = useLoyaltyDashboard({
    dateFrom: effectiveDateFrom,
    dateTo: effectiveDateTo,
  });

  const metrics = useMemo(() => {
    const totalMembers = data.length;
    const totalSales = data.reduce((sum, m) => sum + (m.TotalSales || 0), 0);
    const totalEarned = data.reduce((sum, m) => sum + (m.PointsEarned || 0), 0);
    const totalRedeemed = data.reduce((sum, m) => sum + (m.PointsRedeemed || 0), 0);
    const totalBalance = data.reduce((sum, m) => sum + (m.BalancePoints || 0), 0);
    const totalTransactions = data.reduce((sum, m) => sum + (m.SalesCount || 0), 0);
    const redemptionRate = totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0;
    const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return {
      totalMembers,
      totalSales,
      totalEarned,
      totalRedeemed,
      totalBalance,
      redemptionRate,
      avgTransactionValue,
    };
  }, [data]);

  const topCustomers = useMemo(() => {
    return [...data]
      .sort((a, b) => (b.TotalSales || 0) - (a.TotalSales || 0))
      .slice(0, 10);
  }, [data]);

  const branchSales = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const key = item.Branch?.trim() || 'Unknown';
      map.set(key, (map.get(key) || 0) + (item.TotalSales || 0));
    });
    return [...map.entries()]
      .map(([branch, total]) => ({ branch, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  const tierDistribution = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      const key = item.Tier?.trim() || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
    });

    const total = data.length;
    return [...map.entries()]
      .map(([tier, count]) => ({
        tier,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: TIER_COLOR_MAP[tier.toLowerCase()] || '#0ea5e9',
      }))
      .sort((a, b) => {
        const rankA = TIER_ORDER[a.tier.toLowerCase()] || 999;
        const rankB = TIER_ORDER[b.tier.toLowerCase()] || 999;
        if (rankA !== rankB) return rankA - rankB;
        return b.count - a.count;
      });
  }, [data]);

  const branchChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 56, right: 16, top: 12, bottom: 34 },
    xAxis: {
      type: 'category',
      data: branchSales.map((b) => b.branch),
      axisLabel: { rotate: 25, color: isDark ? '#9ca3af' : '#4b5563' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDark ? '#9ca3af' : '#4b5563' },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: branchSales.map((b) => b.total),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#0ea5e9' },
              { offset: 1, color: '#2563eb' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        barWidth: 28,
      },
    ],
  };

  const tierChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '74%'],
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            color: isDark ? '#f3f4f6' : '#111827',
            formatter: '{b}\n{d}%',
            fontWeight: 'bold',
          },
        },
        data: tierDistribution.map((t) => ({
          name: t.tier,
          value: t.count,
          itemStyle: {
            color: t.color,
          },
        })),
      },
    ],
  };

  const topCustomerColumns: ColumnDef<LoyaltyMember>[] = [
    {
      accessorKey: 'CustomerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-semibold">{row.original.CustomerName || 'Unknown'}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {row.original.CustomerCode || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'Branch',
      header: 'Branch',
      cell: ({ getValue }) => <span className="text-sm">{String(getValue() || 'N/A')}</span>,
    },
    {
      accessorKey: 'PointsEarned',
      header: 'Points Earned',
      cell: ({ getValue }) => (
        <div className="text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
          {formatNumber(Number(getValue() || 0))}
        </div>
      ),
    },
    {
      accessorKey: 'PointsRedeemed',
      header: 'Points Redeemed',
      cell: ({ getValue }) => (
        <div className="text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatNumber(Number(getValue() || 0))}
        </div>
      ),
    },
    {
      accessorKey: 'TotalSales',
      header: 'Total Sales',
      cell: ({ getValue }) => (
        <div className="text-right text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {formatMoney(Number(getValue() || 0))}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading loyalty dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="font-semibold text-red-600">Failed to load loyalty dashboard</p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-blue-200 bg-blue-50'}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Members</span>
            <Users className={`h-4 w-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(metrics.totalMembers)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Total Sales</span>
            <ShoppingBag className={`h-4 w-4 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatMoney(metrics.totalSales)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-amber-200 bg-amber-50'}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Points Issued</span>
            <Gift className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-amber-700'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatNumber(metrics.totalEarned)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-purple-200 bg-purple-50'}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Redemption Rate</span>
            <BadgePercent className={`h-4 w-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
          </div>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{metrics.redemptionRate.toFixed(2)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className={`self-start rounded-lg border p-4 xl:col-span-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h3 className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Branch-wise Loyalty Sales</h3>
          <ReactECharts option={branchChartOption} style={{ height: 630 }} theme={isDark ? 'dark' : undefined} />
        </div>

        <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <h3 className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tier Distribution</h3>
          <ReactECharts option={tierChartOption} style={{ height: 300 }} theme={isDark ? 'dark' : undefined} />
          <div className="mt-2 grid grid-cols-1 gap-1.5">
            {tierDistribution.map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between text-xs">
                <div className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{tier.tier}</span>
                </div>
                <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {formatNumber(tier.count)} ({tier.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="inline-flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top 10 Loyalty Customers
            </span>
          </h3>
          <div className={`inline-flex items-center gap-4 text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <span className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Balance: {formatNumber(metrics.totalBalance)}
            </span>
            <span>Avg Ticket: {formatMoney(metrics.avgTransactionValue)}</span>
          </div>
        </div>
        <DataTable
          data={topCustomers}
          columns={topCustomerColumns}
          isDark={isDark}
          enableFiltering
          enableGlobalFilter
          enableSorting
          enablePagination
          pageSize={10}
          height="520px"
        />
      </div>
    </div>
  );
}

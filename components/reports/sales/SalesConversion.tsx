'use client';

import { Target, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesConversion } from '@/lib/hooks/useSalesConversion';
import { format } from 'date-fns';

interface SalesConversionProps {
  filters: {
    branchCode: string;
    fromDate: string;
    toDate: string;
  };
}

// Helper function to get current quarter dates
const getQuarterDates = (): { fromDate: string; toDate: string } => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const quarter = Math.floor(today.getMonth() / 3);
  const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
  return { 
    fromDate: formatDate(quarterStart), 
    toDate: formatDate(today) 
  };
};

export default function SalesConversion({ filters }: SalesConversionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Use default values if no filters are provided from parent
  const defaultDates = getQuarterDates();
  const effectiveFilters = {
    branchCode: filters.branchCode || '000', // '000' = All Branches
    fromDate: filters.fromDate || defaultDates.fromDate,
    toDate: filters.toDate || defaultDates.toDate,
  };

  // Always fetch data with effective filters (defaults or provided)
  const hasFilters = true; // Always enabled

  // Fetch sales conversion data using effective filters
  const { data, isLoading } = useSalesConversion(
    {
      dtf: effectiveFilters.fromDate,
      dtt: effectiveFilters.toDate,
      brcode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // ✅ Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading conversion data...</p>
        </div>
      </div>
    );
  }

  // ✅ Use API data or show empty state
  const metrics = data || {
    conversionRate: 0,
    conversionRateChange: 0,
    totalLeads: 0,
    totalLeadsChange: 0,
    convertedSales: 0,
    convertedSalesChange: 0,
    avgTimeToConvert: 0,
    avgTimeToConvertChange: 0,
    funnelData: [],
  };

  // TanStack Table column definitions
  const funnelColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ getValue }) => (
        <div className="font-medium min-w-[200px]">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'count',
      header: 'Count',
      cell: ({ getValue }) => (
        <div className="text-right font-semibold">
          {((getValue() as number) ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'conversion',
      header: 'Conversion %',
      cell: ({ getValue }) => (
        <div className="text-right font-semibold">
          {((getValue() as number) ?? 0).toFixed(1)}%
        </div>
      ),
    },
    {
      accessorKey: 'dropoff',
      header: 'Drop-off',
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return (
          <div className="text-right text-red-500">
            {value > 0 ? `-${value}` : '-'}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Conversion Rate
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics.conversionRate.toFixed(1)}%
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/30' : 'bg-blue-200'}`}>
              <Target className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${
              metrics.conversionRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {metrics.conversionRateChange >= 0 ? '+' : ''}{metrics.conversionRateChange.toFixed(1)}%
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Total Leads
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics.totalLeads.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${
              metrics.totalLeadsChange >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {metrics.totalLeadsChange >= 0 ? '+' : ''}{metrics.totalLeadsChange.toFixed(1)}%
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Converted Sales
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics.convertedSales.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`}>
              <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${
              metrics.convertedSalesChange >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {metrics.convertedSalesChange >= 0 ? '+' : ''}{metrics.convertedSalesChange.toFixed(1)}%
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Avg Time to Convert
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics.avgTimeToConvert > 0 
                  ? `${metrics.avgTimeToConvert.toFixed(1)} days`
                  : 'N/A'
                }
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/30' : 'bg-amber-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${
              metrics.avgTimeToConvertChange <= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {metrics.avgTimeToConvertChange <= 0 ? '' : '+'}{metrics.avgTimeToConvertChange.toFixed(1)}d
            </span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {metrics.avgTimeToConvertChange <= 0 ? 'faster than before' : 'slower than before'}
            </span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel - TanStack Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
          <h3 className={`font-sans text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Funnel Analysis
          </h3>
          <p className={`font-sans text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Breakdown of conversion stages
          </p>
        </div>
        {metrics.funnelData.length > 0 ? (
          <div className="p-4">
            <DataTable
              columns={funnelColumns}
              data={metrics.funnelData}
              isDark={isDark}
              height="400px"
              enablePagination={false}
              enableSorting={false}
              pageSize={metrics.funnelData.length}
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No funnel data available for the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
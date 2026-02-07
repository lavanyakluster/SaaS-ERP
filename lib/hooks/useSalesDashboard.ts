import { useQuery } from '@tanstack/react-query';
import { getSalesDashboard, SalesDashboardParams, SalesDashboardResponse } from '@/lib/api/sales-dashboard.api';
import { useAuthStore } from '@/lib/store/auth-store';

// Query key factory for sales dashboard
export const salesDashboardKeys = {
  all: ['sales-dashboard'] as const,
  byParams: (params: SalesDashboardParams) => [...salesDashboardKeys.all, params] as const,
};

/**
 * React Query hook for fetching sales dashboard data
 * 
 * @param params - Date range, branch code (year added automatically)
 * @param enabled - Whether to fetch data (default: true)
 * @returns Query result with sales dashboard data
 * 
 * @example
 * const { data, isLoading, error } = useSalesDashboard({
 *   fromDt: '2025-01-01',
 *   toDt: '2026-01-15',
 *   brCode: '0'  // All branches
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 * 
 * // Access monthly sales data
 * const monthlySales = data?.Table || [];
 * 
 * // Access rep sales data
 * const repSales = data?.Table1 || [];
 * 
 * // Access branch sales data
 * const branchSales = data?.Table2 || [];
 */
export const useSalesDashboard = (
  params: Omit<SalesDashboardParams, 'year'>, // ✅ Omit year, hook will add it
  enabled = true
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery({
    queryKey: salesDashboardKeys.byParams({ ...params, year: selectedYear || '' }),
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales dashboard with year:', selectedYear);
      return getSalesDashboard({ ...params, year: selectedYear });
    },
    enabled: enabled && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes
    retry: 1,
  });
};
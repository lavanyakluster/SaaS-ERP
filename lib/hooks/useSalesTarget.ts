import { useQuery } from '@tanstack/react-query';
import { fetchSalesTargetData, type SalesTargetResponse } from '@/lib/api/sales-target.api';
import { useAuthStore } from '@/lib/store/auth-store';

export interface SalesTargetParams {
  month: string;
  topN?: number;
}

// Query key factory for sales target
export const salesTargetKeys = {
  all: ['sales-target'] as const,
  byParams: (params: SalesTargetParams & { year: number }) => 
    [...salesTargetKeys.all, params] as const,
};

/**
 * React Query hook for fetching sales target analysis data
 * 
 * @param params - Month and topN parameters
 * @param enabled - Whether to fetch data (default: true)
 * @returns Query result with sales target data
 * 
 * @example
 * const { data, isLoading, error } = useSalesTarget({
 *   month: '01',
 *   topN: 10
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 * 
 * // Access branch target data
 * const branches = data?.table1 || [];
 * 
 * // Access monthly trend data
 * const monthlyTrend = data?.table3 || [];
 */
export const useSalesTarget = (
  params: SalesTargetParams,
  enabled = true
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery<SalesTargetResponse, Error>({
    queryKey: salesTargetKeys.byParams({ 
      ...params, 
      year: parseInt(selectedYear?.split('-')[0] || '2024')
    }),
    queryFn: async () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      const yearNum = parseInt(selectedYear.split('-')[0] || '2024');
      console.log('🚀 Fetching sales target data with year:', yearNum);
      return fetchSalesTargetData(yearNum, params.month, params.topN || 10);
    },
    enabled: enabled && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes cache
    gcTime: 1000 * 60 * 10, // 🗑️ Garbage collect after 10 minutes
    retry: 1,
  });
};

import { useQuery } from '@tanstack/react-query';
import { fetchLoyaltyData, type LoyaltyMember } from '@/lib/api/loyalty.api';
import { useAuthStore } from '@/lib/store/auth-store';

export interface LoyaltyDashboardParams {
  dateFrom: string;
  dateTo: string;
}

// Query key factory for loyalty dashboard
export const loyaltyDashboardKeys = {
  all: ['loyalty-dashboard'] as const,
  byParams: (params: LoyaltyDashboardParams & { year: number }) => 
    [...loyaltyDashboardKeys.all, params] as const,
};

/**
 * React Query hook for fetching loyalty dashboard data
 * 
 * @param params - Date range parameters
 * @param enabled - Whether to fetch data (default: true)
 * @returns Query result with loyalty member data
 * 
 * @example
 * const { data, isLoading, error } = useLoyaltyDashboard({
 *   dateFrom: '2025-01-01',
 *   dateTo: '2025-10-01'
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 * 
 * // Access loyalty members data
 * const members = data || [];
 */
export const useLoyaltyDashboard = (
  params: LoyaltyDashboardParams,
  enabled = true
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery<LoyaltyMember[], Error>({
    queryKey: loyaltyDashboardKeys.byParams({ 
      ...params, 
      year: parseInt(selectedYear?.split('-')[0] || '2024')
    }),
    queryFn: async () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      const yearNum = parseInt(selectedYear.split('-')[0] || '2024');
      console.log('🚀 Fetching loyalty dashboard data with year:', yearNum);
      return fetchLoyaltyData(params.dateFrom, params.dateTo, yearNum);
    },
    enabled: enabled && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes cache
    gcTime: 1000 * 60 * 10, // 🗑️ Garbage collect after 10 minutes
    retry: 1,
  });
};

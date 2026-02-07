import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getSalesProfitBranch, SalesProfitBranchParams, SalesProfitBranchResponse } from '@/lib/api/salesProfitBranch.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook for fetching sales profit branch data
 */
export const useSalesProfitBranch = (
  params: Omit<SalesProfitBranchParams, 'year'>, // ✅ Omit year, hook will add it
  enabled: boolean = true
): UseQueryResult<SalesProfitBranchResponse, Error> => {
  const selectedOrganization = useAuthStore(state => state.selectedOrganization);
  const status = useAuthStore(state => state.status);
  const isLoggingOut = useAuthStore(state => state.isLoggingOut);
  const selectedYear = useAuthStore(state => state.selectedYear);

  const shouldFetch = 
    enabled &&
    status === 'authenticated' &&
    !isLoggingOut &&
    !!selectedOrganization &&
    !!selectedYear &&
    !!params.fromDt &&
    !!params.toDt &&
    !!params.brCode;

  return useQuery({
    queryKey: ['salesProfitBranch', params, selectedOrganization?.id, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Fetching Sales Profit Branch:', {
          fromDt: params.fromDt,
          toDt: params.toDt,
          brCode: params.brCode,
          year: selectedYear,
          organization: selectedOrganization?.name,
        });
      }

      console.log('🚀 Fetching sales profit branch with year:', selectedYear);
      return getSalesProfitBranch({ ...params, year: selectedYear });
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes
    retry: 1,
  });
};
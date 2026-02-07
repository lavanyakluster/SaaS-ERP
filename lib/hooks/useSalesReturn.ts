/**
 * Sales Return Hook
 * React Query hooks for Sales Return APIs
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSalesReturn, fetchSalesReturnDetail } from '@/lib/api/sales-return.api';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  SalesReturnParams,
  SalesReturnDetailParams,
} from '@/lib/types/sales-return.types';

/**
 * Hook to fetch sales return master data
 */
export const useSalesReturn = (params: Omit<SalesReturnParams, 'year'>) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery({
    queryKey: ['sales-return', params, selectedYear],
    queryFn: () => {
      // Get token from auth store
      const token = useAuthStore.getState().getAccessToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!selectedYear) {
        throw new Error('No year selected');
      }

      console.log('🚀 Fetching sales return with year:', selectedYear);

      // Pass year from auth store
      return fetchSalesReturn({ ...params, year: selectedYear }, token);
    },
    enabled: !!params.fromDt && !!params.toDt && !!params.brCode && !!selectedYear,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch sales return detail data
 */
export const useSalesReturnDetail = (
  params: Omit<SalesReturnDetailParams, 'year'>,
  enabled: boolean = false
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery({
    queryKey: ['sales-return-detail', params, selectedYear],
    queryFn: () => {
      // Get token from auth store
      const token = useAuthStore.getState().getAccessToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!selectedYear) {
        throw new Error('No year selected');
      }

      console.log('🚀 Fetching sales return detail with year:', selectedYear);

      // Pass year from auth store
      return fetchSalesReturnDetail({ ...params, year: selectedYear }, token);
    },
    enabled: enabled && !!params.shid && !!params.brCode && !!selectedYear,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

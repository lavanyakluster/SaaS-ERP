/**
 * Sales Register Hook
 * React Query hooks for Sales Register APIs
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSalesRegister, fetchSalesRegisterDetail } from '@/lib/api/sales-register.api';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  SalesRegisterParams,
  SalesRegisterDetailParams,
} from '@/lib/types/sales-register.types';

/**
 * Hook to fetch sales register master data
 */
export const useSalesRegister = (params: Omit<SalesRegisterParams, 'year'>) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery({
    queryKey: ['sales-register', params, selectedYear],
    queryFn: () => {
      // Get token from auth store
      const token = useAuthStore.getState().getAccessToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!selectedYear) {
        throw new Error('No year selected');
      }

      console.log('🚀 Fetching sales register with year:', selectedYear);

      // Pass year from auth store
      return fetchSalesRegister({ ...params, year: selectedYear }, token);
    },
    enabled: !!params.fromDt && !!params.toDt && !!params.brCode && !!selectedYear,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch sales register detail data
 */
export const useSalesRegisterDetail = (
  params: Omit<SalesRegisterDetailParams, 'year'>,
  enabled: boolean = false
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery({
    queryKey: ['sales-register-detail', params, selectedYear],
    queryFn: () => {
      // Get token from auth store
      const token = useAuthStore.getState().getAccessToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      if (!selectedYear) {
        throw new Error('No year selected');
      }

      console.log('🚀 Fetching sales register detail with year:', selectedYear);

      // Pass year from auth store
      return fetchSalesRegisterDetail({ ...params, year: selectedYear }, token);
    },
    enabled: enabled && !!params.shid && !!params.brCode && !!selectedYear,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

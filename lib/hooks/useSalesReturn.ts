/**
 * Sales Return Hooks
 * Provides hooks for fetching sales return master and detail data
 */

import { useQuery } from '@tanstack/react-query';
import { 
  getSalesReturn, 
  getSalesReturnDetail 
} from '@/lib/api/sales-return.api';
import type { 
  SalesReturnParams, 
  SalesReturnDetailParams,
  SalesReturnRecord,
  SalesReturnDetailRecord 
} from '@/lib/types/sales-return.types';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch sales return master data
 * 
 * @example
 * const { data, isLoading, error } = useSalesReturn({
 *   fromDt: '2025-01-01',
 *   toDt: '2025-01-31',
 *   brCode: '0'
 * }, true);
 */
export const useSalesReturn = (
  params: Omit<SalesReturnParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<SalesReturnRecord[], Error>({
    queryKey: ['sales-return', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales return with year:', selectedYear);
      return getSalesReturn({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};

/**
 * Hook to fetch sales return detail data for a specific bill
 * 
 * @example
 * const { data, isLoading, error } = useSalesReturnDetail({
 *   shid: 12345,
 *   brCode: 'BR001'
 * }, true);
 */
export const useSalesReturnDetail = (
  params: Omit<SalesReturnDetailParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<SalesReturnDetailRecord[], Error>({
    queryKey: ['sales-return-detail', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales return detail with year:', selectedYear);
      return getSalesReturnDetail({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.shid && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};
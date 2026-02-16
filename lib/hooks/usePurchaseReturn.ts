'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getPurchaseReturn,
  type PurchaseReturnParams,
  type PurchaseReturnItem
} from '@/lib/api/purchase-return.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch purchase return data
 * 
 * @example
 * const { data, isLoading, error } = usePurchaseReturn({
 *   fromDt: '2025-01-01',
 *   toDt: '2025-01-31',
 *   brCode: '0'
 * }, true);
 */
export const usePurchaseReturn = (
  params: Omit<PurchaseReturnParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<PurchaseReturnItem[], Error>({
    queryKey: ['purchase-return', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching purchase return with year:', selectedYear);
      return getPurchaseReturn({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};

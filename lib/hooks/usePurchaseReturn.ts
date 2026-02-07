/**
 * React Query hook for Purchase Return API
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPurchaseReturn,
  PurchaseReturnParams,
  PurchaseReturnItem,
} from '@/lib/api/purchase-return.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch purchase return data
 * Year is automatically injected from auth store
 * 
 * @example
 * const { data, isLoading, error } = usePurchaseReturn({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-30',
 *   brCode: '0'
 * });
 */
export const usePurchaseReturn = (params: Omit<PurchaseReturnParams, 'year'>) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery<PurchaseReturnItem[], Error>({
    queryKey: ['purchase-return', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching purchase return with year:', selectedYear);
      return getPurchaseReturn({ ...params, year: selectedYear });
    },
    enabled: !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};

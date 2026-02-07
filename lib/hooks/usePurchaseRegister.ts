/**
 * React Query hooks for Purchase Register API
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPurchaseRegister,
  getPurchaseRegisterDetail,
  PurchaseRegisterParams,
  PurchaseRegisterDetailParams,
  PurchaseRegisterItem,
  PurchaseRegisterDetailItem,
} from '@/lib/api/purchase-register.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch purchase register data
 * Year is automatically injected from auth store
 * 
 * @example
 * const { data, isLoading, error } = usePurchaseRegister({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-30',
 *   brCode: '0'
 * });
 */
export const usePurchaseRegister = (params: Omit<PurchaseRegisterParams, 'year'>) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery<PurchaseRegisterItem[], Error>({
    queryKey: ['purchase-register', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching purchase register with year:', selectedYear);
      return getPurchaseRegister({ ...params, year: selectedYear });
    },
    enabled: !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};

/**
 * Hook to fetch purchase register detail data
 * Year is automatically injected from auth store
 * 
 * @example
 * const { data, isLoading, error } = usePurchaseRegisterDetail(
 *   { shid: 7127, brCode: '017' },
 *   true // enabled
 * );
 */
export const usePurchaseRegisterDetail = (
  params: Omit<PurchaseRegisterDetailParams, 'year'>,
  enabled: boolean = false
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useQuery<PurchaseRegisterDetailItem[], Error>({
    queryKey: ['purchase-register-detail', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching purchase register detail with year:', selectedYear);
      return getPurchaseRegisterDetail({ ...params, year: selectedYear });
    },
    enabled: enabled && !!selectedYear && !!params.shid && !!params.brCode,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};

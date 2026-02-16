'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getPurchaseRegister, 
  getPurchaseRegisterDetail,
  type PurchaseRegisterParams,
  type PurchaseRegisterDetailParams,
  type PurchaseRegisterItem,
  type PurchaseRegisterDetailItem
} from '@/lib/api/purchase-register.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch purchase register master data
 * 
 * @example
 * const { data, isLoading, error } = usePurchaseRegister({
 *   fromDt: '2025-01-01',
 *   toDt: '2025-01-31',
 *   brCode: '0'
 * }, true);
 */
export const usePurchaseRegister = (
  params: Omit<PurchaseRegisterParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<PurchaseRegisterItem[], Error>({
    queryKey: ['purchase-register', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching purchase register with year:', selectedYear);
      return getPurchaseRegister({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
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
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};

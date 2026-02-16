/**
 * Sales Register Hooks
 * Provides hooks for fetching sales register master and detail data
 */

import { useQuery } from '@tanstack/react-query';
import { 
  getSalesRegister, 
  getSalesRegisterDetail 
} from '@/lib/api/sales-register.api';
import type { 
  SalesRegisterParams, 
  SalesRegisterDetailParams,
  SalesRegisterRecord,
  SalesRegisterDetailRecord 
} from '@/lib/types/sales-register.types';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch sales register master data
 * 
 * @example
 * const { data, isLoading, error } = useSalesRegister({
 *   fromDt: '2025-01-01',
 *   toDt: '2025-01-31',
 *   brCode: '0'
 * }, true);
 */
export const useSalesRegister = (
  params: Omit<SalesRegisterParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<SalesRegisterRecord[], Error>({
    queryKey: ['sales-register', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales register with year:', selectedYear);
      return getSalesRegister({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.fromDt && !!params.toDt && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};

/**
 * Hook to fetch sales register detail data for a specific bill
 * 
 * @example
 * const { data, isLoading, error } = useSalesRegisterDetail({
 *   shid: 12345,
 *   brCode: 'BR001'
 * }, true);
 */
export const useSalesRegisterDetail = (
  params: Omit<SalesRegisterDetailParams, 'year'>,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<SalesRegisterDetailRecord[], Error>({
    queryKey: ['sales-register-detail', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales register detail with year:', selectedYear);
      return getSalesRegisterDetail({ ...params, year: selectedYear });
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.shid && !!params.brCode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};
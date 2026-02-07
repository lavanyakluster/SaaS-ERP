import { useQuery } from '@tanstack/react-query';
import { 
  getSalesSummary, 
  getDashSalesSummary,
  SalesSummaryParams, 
  SalesSummaryResponse,
  DashSalesSummaryItem 
} from '@/lib/api/sales-summary.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch sales summary data
 * 
 * @example
 * const { data, isLoading, error } = useSalesSummary({
 *   dtf: '2025-01-01',
 *   dtt: '2025-01-01',
 *   brcode: '0',
 *   shift: '0'
 * });
 */
export const useSalesSummary = (params: Omit<SalesSummaryParams, 'year'>) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<SalesSummaryResponse, Error>({
    queryKey: ['sales-summary', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales summary with year:', selectedYear);
      return getSalesSummary({ ...params, year: selectedYear });
    },
    enabled: isAuthenticated && !!selectedYear && !!params.dtf && !!params.dtt && !!params.brcode,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};

/**
 * Hook to fetch dashboard sales summary data
 * 
 * @example
 * const { data, isLoading, error } = useDashSalesSummary({
 *   dtf: '2025-01-01',
 *   dtt: '2025-01-01',
 *   brcode: '0'
 * });
 */
export const useDashSalesSummary = (params: Omit<SalesSummaryParams, 'year' | 'shift'>) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<DashSalesSummaryItem[], Error>({
    queryKey: ['dash-sales-summary', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching dashboard sales summary with year:', selectedYear);
      return getDashSalesSummary({ ...params, year: selectedYear });
    },
    enabled: isAuthenticated && !!selectedYear && !!params.dtf && !!params.dtt && !!params.brcode,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
};
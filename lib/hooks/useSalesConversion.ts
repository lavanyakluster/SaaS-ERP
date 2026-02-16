import { useQuery } from '@tanstack/react-query';
import { 
  getQuotesStatus, 
  QuotesStatusParams, 
  QuotesStatusMetrics 
} from '@/lib/api/quotes-status.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Parameters for sales conversion query
 * Uses 'dtf', 'dtt', 'brcode' for consistency with other sales reports
 */
export interface SalesConversionParams {
  dtf: string;  // Date from
  dtt: string;  // Date to
  brcode: string; // Branch code
}

/**
 * Hook to fetch sales conversion data
 * 
 * @example
 * const { data, isLoading, error } = useSalesConversion({
 *   dtf: '2025-01-01',
 *   dtt: '2025-01-31',
 *   brcode: '0'
 * }, true);
 */
export const useSalesConversion = (
  params: SalesConversionParams,
  enabled: boolean = true
) => {
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut;

  return useQuery<QuotesStatusMetrics, Error>({
    queryKey: ['sales-conversion', params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales conversion with year:', selectedYear);
      
      // Map parameter names to API format
      const apiParams: QuotesStatusParams = {
        fromDt: params.dtf,
        toDt: params.dtt,
        brCode: params.brcode,
        year: Number.parseInt(selectedYear, 10),
      };
      
      return getQuotesStatus(apiParams);
    },
    enabled: enabled && isAuthenticated && !!selectedYear && !!params.dtf && !!params.dtt && !!params.brcode,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
  });
};

// Re-export types for convenience
export type { QuotesStatusMetrics as SalesConversionResponse };

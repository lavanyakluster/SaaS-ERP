/**
 * useQuotesStatus Hook
 * Fetch and manage quotes status data for sales conversion analysis
 */

import { useQuery } from '@tanstack/react-query';
import { getQuotesStatus, type QuotesStatusParams, type QuotesStatusMetrics } from '@/lib/api/quotes-status.api';

interface UseQuotesStatusOptions {
  enabled?: boolean;
}

export const useQuotesStatus = (
  params: QuotesStatusParams,
  options?: UseQuotesStatusOptions
) => {
  return useQuery<QuotesStatusMetrics, Error>({
    queryKey: ['quotes-status', params.fromDt, params.toDt, params.brCode, params.year],
    queryFn: () => getQuotesStatus(params),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

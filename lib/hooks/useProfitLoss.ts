/**
 * Profit & Loss Hooks
 * React Query hooks for income/expense/profit data
 */

import { useQuery } from '@tanstack/react-query';
import {
  getProfitLossData,
  calculateTotals,
  formatChartData,
  ProfitLossRequest,
  ProfitLossData,
} from '@/lib/api/profit-loss.api';
import { useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const PROFIT_LOSS_KEYS = {
  all: ['profit-loss'] as const,
  list: (params: ProfitLossRequest) => [...PROFIT_LOSS_KEYS.all, 'list', params] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch profit/loss data for a date range and branch
 * 
 * @param params - fromDt, toDt, brCode
 * @param enabled - Whether to enable the query (default: true)
 * @returns React Query result with profit/loss data
 * 
 * @example
 * const { data, isLoading, error } = useProfitLoss({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-31',
 *   brCode: '005'
 * });
 */
export const useProfitLoss = (
  params: Omit<ProfitLossRequest, 'year'>, // ✅ Omit year, hook will add it
  enabled: boolean = true
) => {
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const selectedOrganization = useAuthStore((state) => state.selectedOrganization);
  const selectedYear = useAuthStore((state) => state.selectedYear);

  // Don't fetch if logging out or org is switching
  const shouldFetch = 
    enabled && 
    !!selectedOrganization && 
    !isLoggingOut && 
    !!selectedYear &&
    !!params.fromDt && 
    !!params.toDt && 
    !!params.brCode;

  // Debug logging
  if (!shouldFetch) {
    console.log('⏸️ Profit/Loss query paused:', {
      enabled,
      hasOrg: !!selectedOrganization,
      isLoggingOut,
      hasYear: !!selectedYear,
      hasFromDt: !!params.fromDt,
      hasToDt: !!params.toDt,
      hasBrCode: !!params.brCode,
    });
  }

  return useQuery({
    queryKey: PROFIT_LOSS_KEYS.list({ ...params, year: selectedYear || '' }),
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching profit/loss with year:', selectedYear);
      return getProfitLossData({ ...params, year: selectedYear });
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // ⚡ 5 minutes
    gcTime: 10 * 60 * 1000, // ⚡ 10 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch profit/loss data with calculated totals
 * 
 * @param params - fromDt, toDt, brCode
 * @param enabled - Whether to enable the query
 * @returns React Query result with data and calculated totals
 * 
 * @example
 * const { data, totals, isLoading } = useProfitLossWithTotals({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-31',
 *   brCode: 'all'
 * });
 * 
 * console.log(totals.totalIncome); // 41414.02
 * console.log(totals.totalProfit); // 19004
 * console.log(totals.profitMargin); // 45.89%
 */
export const useProfitLossWithTotals = (
  params: Omit<ProfitLossRequest, 'year'>,
  enabled = true
) => {
  const query = useProfitLoss(params, enabled);

  const totals = useMemo(() => {
    if (!query.data) return null;
    return calculateTotals(query.data);
  }, [query.data]);

  const chartData = useMemo(() => {
    if (!query.data) return [];
    return formatChartData(query.data);
  }, [query.data]);

  return {
    ...query,
    totals,
    chartData,
  };
};

/**
 * Helper hook to format numbers as currency
 */
export const useFormatCurrency = () => {
  return (value: number, currency = 'AED') => {
    return `${currency} ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
};

/**
 * Helper hook to format percentage
 */
export const useFormatPercentage = () => {
  return (value: number) => {
    return `${value.toFixed(2)}%`;
  };
};

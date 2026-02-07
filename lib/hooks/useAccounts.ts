/**
 * useAccounts Hook
 * Fetches and manages accounts dashboard data using React Query
 * 
 * ✅ Following guidelines:
 * - Uses React Query for data fetching
 * - Organization context from auth store
 * - Proper TypeScript typing
 * - Handles loading and error states
 * - Respects logout state
 */

import { useQuery } from '@tanstack/react-query';
import { getAccounts, parseAccountsData, type AccountsParams, type ParsedAccountsData } from '@/lib/api/accounts.api';
import { useAuthStore } from '@/lib/store/auth-store';

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch accounts data with automatic organization context
 * 
 * @param params - Account query parameters (dates, branch, etc.)
 * @param enabled - Whether the query should run
 * @returns React Query result with accounts data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAccounts({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-15',
 *   brCode: '0',
 *   grpCode: "''''",
 *   checkedValue: 1,
 *   acdtf: '2025-01-01',
 *   cum: 1,
 * });
 * ```
 */
export const useAccounts = (
  params: Omit<AccountsParams, 'year'>, // ✅ Omit year from params, hook will add it
  enabled: boolean = true
) => {
  const isLoggingOut = useAuthStore(state => state.isLoggingOut);
  const selectedOrganization = useAuthStore(state => state.selectedOrganization);
  const selectedYear = useAuthStore(state => state.selectedYear);

  return useQuery({
    queryKey: ['accounts', selectedOrganization?.id, params, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching accounts with year:', selectedYear);
      return getAccounts({ ...params, year: selectedYear });
    },
    enabled: enabled && !!selectedOrganization && !isLoggingOut && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes
    gcTime: 1000 * 60 * 30, // ⚡ 30 minutes
    retry: 1,
  });
};

/**
 * ✅ Hook with parsed data
 * Returns the accounts data parsed into assets/liabilities
 * 
 * @param params - Account query parameters
 * @param enabled - Whether the query should run
 * @returns Parsed accounts data with assets, liabilities, and ratios
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useParsedAccounts({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-15',
 *   brCode: '0',
 *   grpCode: "''''",
 *   checkedValue: 1,
 *   acdtf: '2025-01-01',
 *   cum: 1,
 * });
 * 
 * // data contains:
 * // - assets: AccountItem[]
 * // - liabilities: AccountItem[]
 * // - totalAssets: number
 * // - totalLiabilities: number
 * // - netProfit: number
 * // - ratios: FinancialRatios
 * ```
 */
export function useParsedAccounts(params: AccountsParams, enabled = true) {
  const { data, ...rest } = useAccounts(params, enabled);

  const parsed: ParsedAccountsData | undefined = data ? parseAccountsData(data) : undefined;

  return {
    ...rest,
    data: parsed,
    rawData: data,
  };
}
import { useQuery } from '@tanstack/react-query';
import { fetchLoyaltyData, type LoyaltyMember } from '@/lib/api/loyalty.api';
import { useAuthStore } from '@/lib/store/auth-store';

export interface LoyaltyDashboardParams {
  dateFrom: string;
  dateTo: string;
}

export const loyaltyDashboardKeys = {
  all: ['loyalty-dashboard'] as const,
  byParams: (params: LoyaltyDashboardParams & { year: number }) =>
    [...loyaltyDashboardKeys.all, params] as const,
};

export const useLoyaltyDashboard = (
  params: LoyaltyDashboardParams,
  enabled = true
) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);
  const fallbackYear = new Date().getFullYear();
  const resolvedYear = Number.parseInt(selectedYear?.split('-')[0] || `${fallbackYear}`, 10);

  return useQuery<LoyaltyMember[], Error>({
    queryKey: loyaltyDashboardKeys.byParams({
      ...params,
      year: resolvedYear,
    }),
    queryFn: () => fetchLoyaltyData(params.dateFrom, params.dateTo, resolvedYear),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
};

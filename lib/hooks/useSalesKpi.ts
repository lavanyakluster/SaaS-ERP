import { useQuery } from '@tanstack/react-query';
import { getSalesKpi, SalesKpiData } from '@/lib/api/sales-kpi.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch sales KPI data
 */
export const useSalesKpi = () => {
  const isLoggingOut = useAuthStore(state => state.isLoggingOut);
  const selectedOrganization = useAuthStore(state => state.selectedOrganization);
  const selectedYear = useAuthStore(state => state.selectedYear);

  return useQuery<SalesKpiData[], Error>({
    queryKey: ['salesKpi', selectedOrganization?.id, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Fetching sales KPI with year:', selectedYear);
      return getSalesKpi({ year: selectedYear });
    },
    enabled: !!selectedOrganization && !isLoggingOut && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes
    retry: 1,
  });
};
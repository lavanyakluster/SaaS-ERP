'use client';

import { useQuery } from '@tanstack/react-query';
import { getPharmacyItemDashboard, PharmacyItem, PharmacyExpiryItem, PharmacyItemDashboardParams } from '@/lib/api/pharmacy-item.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch pharmacy item dashboard data
 */
export const usePharmacyItemDashboard = (params: Omit<PharmacyItemDashboardParams, 'year'>) => {
  const selectedYear = useAuthStore((state) => state.selectedYear);

  console.log('🔍 usePharmacyItemDashboard - Params:', params);
  console.log('🔍 usePharmacyItemDashboard - Year:', selectedYear);
  console.log('🔍 usePharmacyItemDashboard - Enabled:', !!params.fromDt && !!params.toDt && !!selectedYear);

  return useQuery<{ items: PharmacyItem[]; expiryItems: PharmacyExpiryItem[] }, Error>({
    queryKey: ['pharmacy-item-dashboard', params.fromDt, params.toDt, params.brCode, selectedYear],
    queryFn: () => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 Calling pharmacy-itemDashboard API with year:', selectedYear);
      return getPharmacyItemDashboard({ ...params, year: selectedYear });
    },
    enabled: !!params.fromDt && !!params.toDt && !!selectedYear,
    staleTime: 1000 * 60 * 5, // ⚡ 5 minutes
    retry: 1,
  });
};
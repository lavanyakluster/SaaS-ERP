/**
 * Years Hook
 * React Query hook for fetching years list
 */

import { useQuery } from '@tanstack/react-query';
import { fetchYearsList } from '@/lib/api/year.api';
import { useAuthStore } from '@/lib/store/auth-store';
import type { YearsList } from '@/lib/types/year.types';

/**
 * Hook to fetch years list
 * Automatically fetches when user is authenticated
 */
export const useYears = () => {
  return useQuery<YearsList>({
    queryKey: ['years'],
    queryFn: () => {
      // Get token from auth store
      const token = useAuthStore.getState().getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      return fetchYearsList(token);
    },
    enabled: typeof window !== 'undefined',
    staleTime: 30 * 60 * 1000, // 30 minutes (years don't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};

/**
 * Get the latest year from years list
 * @param years - Array of year strings
 * @returns Latest year (last item in array)
 */
export const getLatestYear = (years: string[]): string | null => {
  if (!years || years.length === 0) return null;
  return years[years.length - 1]; // Last item is the latest
};

/**
 * Get the default year
 * Uses latest year from the list, or current year as fallback
 */
export const getDefaultYear = (years?: string[]): string => {
  if (years && years.length > 0) {
    return getLatestYear(years) || new Date().getFullYear().toString();
  }
  return new Date().getFullYear().toString();
};

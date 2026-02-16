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
 * Automatically fetches when user is authenticated AND organization is selected
 */
export const useYears = () => {
  // ✅ Get authentication status and organization context
  const status = useAuthStore((state) => state.status);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const isSwitchingOrganization = useAuthStore((state) => state.isSwitchingOrganization);
  const selectedOrganization = useAuthStore((state) => state.selectedOrganization);
  const organizationApiUrl = useAuthStore((state) => state.organizationApiUrl); // ✅ Add this
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const tokens = useAuthStore((state) => state.tokens);
  
  // ✅ CRITICAL: Only consider authenticated if NOT logging out AND NOT switching organizations
  const isAuthenticated = status === 'authenticated' && !isLoggingOut && !isSwitchingOrganization;
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useYears - Auth Check:', {
      status,
      isLoggingOut,
      isSwitchingOrganization,
      isAuthenticated,
      hasToken: !!tokens?.accessToken,
      hasOrganization: !!selectedOrganization?.id,
      organizationId: selectedOrganization?.id,
      organizationName: selectedOrganization?.name,
      hasOrgApiUrl: !!organizationApiUrl, // ✅ Add this
      tokenPreview: tokens?.accessToken?.substring(0, 30) + '...',
      enabled: typeof window !== 'undefined' && 
        isAuthenticated && 
        !!tokens?.accessToken && 
        !!selectedOrganization?.id &&
        !!organizationApiUrl, // ✅ Add this check
    });
  }
  
  return useQuery<YearsList>({
    queryKey: ['years', selectedOrganization?.id],
    queryFn: () => {
      // Get token from auth store
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      if (!selectedOrganization?.id) {
        throw new Error('No organization selected');
      }
      
      return fetchYearsList(token);
    },
    // ✅ CRITICAL: Only enable when:
    // 1. Browser environment
    // 2. User is authenticated (and NOT logging out or switching orgs)
    // 3. Has valid token in state
    // 4. Organization is selected
    // 5. ✅ NEW: Organization switch completed (has API URL)
    enabled: 
      typeof window !== 'undefined' && 
      isAuthenticated && 
      !!tokens?.accessToken && 
      !!selectedOrganization?.id &&
      !!organizationApiUrl, // ✅ CRITICAL FIX: Wait for org switch to complete
    staleTime: 30 * 60 * 1000, // ⚡ 30 minutes (years don't change often)
    gcTime: 60 * 60 * 1000, // ⚡ 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: false, // ⚡ Don't refetch on mount if cached
    refetchOnWindowFocus: false, // ⚡ Don't refetch on window focus
    refetchOnReconnect: false, // ⚡ Don't refetch on reconnect
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
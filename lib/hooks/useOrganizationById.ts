/**
 * useOrganizationById Hook
 * 
 * React Query hook for fetching organization details by ID.
 * Automatically triggers on mount and handles loading/error states.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOrganizationById('ed326080-e8b1-42be-8bd3-32e0d2f6d4ba');
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return <div>{data?.data.organizationName}</div>;
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { getOrganizationById } from '@/lib/api/organization.api';
import type { GetOrganizationByIdResponse } from '@/lib/api/organization.api';

interface UseOrganizationByIdOptions {
  /**
   * Whether to automatically fetch on mount
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Time in milliseconds before data is considered stale
   * @default 5 minutes
   */
  staleTime?: number;
  
  /**
   * Time in milliseconds before cached data is garbage collected
   * @default 10 minutes
   */
  cacheTime?: number;
}

/**
 * Hook to fetch organization details by ID
 * 
 * @param organizationId - Organization ID to fetch (required)
 * @param options - React Query options
 * @returns React Query result with organization data
 */
export function useOrganizationById(
  organizationId: string | undefined | null,
  options?: UseOrganizationByIdOptions
) {
  return useQuery<GetOrganizationByIdResponse>({
    queryKey: ['organization', organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      return getOrganizationById(organizationId);
    },
    enabled: !!organizationId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes (gcTime replaces cacheTime)
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
}
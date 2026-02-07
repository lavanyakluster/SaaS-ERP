/**
 * useOrganizations Hook
 * 
 * Fetches the list of organizations the authenticated user has access to.
 * 
 * ✅ Following guidelines:
 * - Uses React Query for data fetching
 * - Organization context derived from JWT token (not from frontend)
 * - Proper TypeScript typing
 * - Handles loading and error states
 * - Auto-syncs with auth store
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrganizations, type OrganizationListItem } from '@/lib/api/organization.api';
import { useAuthStore, useAuthStatus } from '@/lib/store/auth-store';
import { useEffect } from 'react';

/**
 * Query key factory for organizations
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
};

/**
 * Hook to fetch organizations list
 * 
 * Automatically syncs fetched organizations with the auth store.
 * The API call uses the JWT token from the Authorization header,
 * so the backend automatically filters by the user's access.
 * 
 * @returns React Query result with organizations data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOrganizations();
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * 
 * return (
 *   <div>
 *     {data?.map(org => (
 *       <div key={org.id}>{org.organizationName}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useOrganizations = () => {
  const { setOrganizations, setSelectedOrganization, selectedOrganization, getAccessToken } = useAuthStore();
  const authStatus = useAuthStatus();

  // Only fetch if user is authenticated
  const isAuthenticated = authStatus === 'authenticated';
  const hasToken = !!getAccessToken();

  const query = useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: async () => {
      // Double check token before making request
      const token = getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔍 Fetching organizations from API...');
      const response = await getOrganizations();
      
      console.log('📦 API Response:', {
        status: response.status,
        count: response.count,
        dataLength: response.data?.length,
        fullResponse: response,
      });
      
      if (response.status !== 'success') {
        console.error('❌ API returned non-success status:', response);
        throw new Error(response.message || 'Failed to fetch organizations');
      }
      
      console.log('✅ Organizations fetched successfully:', response.data.length);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - organizations don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: false, // ❌ DISABLED: No automatic retries on failure
    refetchOnWindowFocus: false, // Don't refetch on every focus
    enabled: isAuthenticated && hasToken, // Only run query if authenticated and has token
  });

  // Sync fetched organizations with auth store
  useEffect(() => {
    if (query.data && query.isSuccess) {
      try {
        // Transform API data to auth store format
        const organizations = query.data.map((org) => ({
          id: org.id,
          name: org.organizationName,
          displayName: org.organizationName,
          isActive: true, // Assume all returned orgs are active
        }));

        // Update auth store
        setOrganizations(organizations);

        // ✅ Try to restore selected organization from sessionStorage
        if (!selectedOrganization && organizations.length > 0) {
          // Try to load from session storage
          let restoredOrg: typeof organizations[0] | null = null;
          
          try {
            const savedOrgJson = typeof window !== 'undefined' 
              ? sessionStorage.getItem('sb_selected_organization') 
              : null;
            
            if (savedOrgJson) {
              const savedOrg = JSON.parse(savedOrgJson);
              // Find matching organization in the fetched list
              restoredOrg = organizations.find(org => org.id === savedOrg.id) || null;
              
              if (restoredOrg) {
                console.log('✅ Restored selected organization from session:', restoredOrg.displayName);
              }
            }
          } catch (error) {
            console.warn('⚠️ Failed to restore selected organization from session:', error);
          }
          
          // If no saved org or saved org not found, select first org
          const orgToSelect = restoredOrg || organizations[0];
          setSelectedOrganization(orgToSelect);
          
          if (!restoredOrg) {
            console.log('✅ Auto-selected first organization:', orgToSelect.displayName);
          }
        }
      } catch (error) {
        console.error('❌ Failed to sync organizations with store:', error);
      }
    }
  }, [query.data, query.isSuccess, selectedOrganization, setOrganizations, setSelectedOrganization]);

  return query;
};

/**
 * Hook to prefetch organizations (useful for optimistic loading)
 */
export const usePrefetchOrganizations = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: organizationKeys.lists(),
      queryFn: async () => {
        const response = await getOrganizations();
        return response.data;
      },
    });
  };
};

/**
 * Switch Organization Hook using React Query
 * 
 * Handles switching between organizations with proper token updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  switchOrganization,
  type SwitchOrganizationResponse,
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { organizationKeys } from './useOrganizations';

interface UseSwitchOrganizationOptions {
  onSuccess?: (data: SwitchOrganizationResponse) => void;
  onError?: (error: any) => void;
  silent?: boolean; // ✅ NEW: Suppress toast notification
}

/**
 * Hook for switching to a different organization
 * 
 * IMPORTANT: After switching organizations, new tokens are issued with the
 * new organization context embedded. These tokens are automatically stored.
 * 
 * All subsequent API calls will use the new organization context.
 * 
 * @example
 * ```tsx
 * const { mutate: switchOrg, isPending } = useSwitchOrganization({
 *   onSuccess: (data) => {
 *     // Tokens are already updated with new org context
 *     // User permissions updated for new org
 *     router.push('/dashboard');
 *   },
 * });
 * 
 * switchOrg('074be0f8-ad02-4518-a154-487db67af2b2');
 * ```
 */
export const useSwitchOrganization = (options?: UseSwitchOrganizationOptions) => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const setSelectedOrganization = useAuthStore((state) => state.setSelectedOrganization);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setOrganizationApiUrl = useAuthStore((state) => state.setOrganizationApiUrl); // ✅ NEW
  const setSwitchingOrganization = useAuthStore((state) => state.setSwitchingOrganization); // ✅ NEW

  return useMutation({
    mutationFn: (organizationId: string) => {
      // ✅ CRITICAL: Set switching flag to prevent API calls during org switch
      setSwitchingOrganization(true);
      console.log('🔄 Switching to organization:', organizationId);
      console.log('🚫 Blocking all organization-dependent API calls during switch...');
      console.log('📝 Current access token preview:', sessionStorage.getItem('sb_access_token')?.substring(0, 50) + '...');
      console.log('📝 Current refresh token available:', !!sessionStorage.getItem('sb_refresh_token'));
      return switchOrganization(organizationId);
    },
    onSuccess: (response) => {
      const { organization, user_context, tokens } = response.data;

      console.log('✅ Switch organization API response received');
      console.log('  - Organization:', organization.name);
      console.log('  - Organization ID:', organization.id);
      console.log('  - Currency:', organization.currency);
      console.log('  - Timezone:', organization.timezone);
      console.log('  - Status:', organization.status);
      console.log('  - API URL:', organization.api_url || 'Not provided');
      console.log('  - New access token received:', !!tokens.access_token);
      console.log('  - New refresh token received:', !!tokens.refresh_token);
      console.log('  - Expires in:', tokens.expires_in, 'seconds');

      // Update auth tokens with new organization context
      // ✅ IMPORTANT: Pass all three parameters (access_token, refresh_token, expires_in)
      setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
      console.log('✅ New tokens stored in sessionStorage');

      // Create organization object matching the store interface
      const switchedOrganization = {
        id: organization.id,
        name: organization.name,
        displayName: organization.name,
        isActive: organization.status === 'ACTIVE',
        createdAt: organization.created_at,
      };

      // Set as selected organization
      setSelectedOrganization(switchedOrganization);

      // ✅ CRITICAL: Store organization-specific API URL if provided
      if (organization.api_url) {
        setOrganizationApiUrl(organization.api_url);
        console.log('🌐 Organization API URL stored:', organization.api_url);
      } else {
        setOrganizationApiUrl(null);
        console.log('🌐 No organization API URL provided, using default');
      }

      // Update user with permissions and role for new organization
      updateUser({
        role: user_context.role.name.toLowerCase(),
        permissions: user_context.permissions || [],
      });

      // Invalidate organizations query to refresh the list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      // Also invalidate individual organization queries
      queryClient.invalidateQueries({ queryKey: ['organization'] }); // Individual org queries
      queryClient.invalidateQueries({ queryKey: ['organizations'] }); // Alternative org list key

      // CRITICAL: Invalidate ALL organization-dependent queries
      // This ensures all API calls refetch with the new organization context
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] }); // Dashboard profit/loss
      queryClient.invalidateQueries({ queryKey: ['branches'] }); // Branches
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Users & Access
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // Roles & Permissions
      
      console.log('🔄 All organization-dependent queries invalidated - Dashboard will refetch with new org context');

      if (!options?.silent) {
        toast.success('Organization Switched!', {
          description: `Switched to ${organization.name}`,
        });
      }

      console.log('✅ Switched to organization:', organization.name);
      console.log('👤 New role:', user_context.role.name);
      console.log('🔐 New permissions:', user_context.permissions);

      // ✅ CRITICAL: Clear switching flag to allow API calls again
      setSwitchingOrganization(false);
      console.log('✅ Organization switch complete - API calls re-enabled');

      options?.onSuccess?.(response);
    },
    onError: (error: any) => {
      // ✅ CRITICAL: Clear switching flag on error to allow API calls again
      setSwitchingOrganization(false);
      console.log('❌ Organization switch failed - API calls re-enabled');
      
      const message =
        error.response?.data?.message || error.message || 'Failed to switch organization';

      if (!options?.silent) {
        toast.error('Switch Failed', {
          description: message,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Switch organization error:', error);
      }

      options?.onError?.(error);
    },
  });
};
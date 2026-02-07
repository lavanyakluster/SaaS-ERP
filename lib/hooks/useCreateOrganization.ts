/**
 * Create Organization Hook using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createOrganization,
  type CreateOrganizationRequest,
  type CreateOrganizationResponse,
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { organizationKeys } from './useOrganizations';

interface UseCreateOrganizationOptions {
  onSuccess?: (data: CreateOrganizationResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for creating a new organization
 * 
 * IMPORTANT: After organization creation, new tokens are issued with the
 * organization context embedded. These tokens are automatically stored.
 * 
 * The user becomes the OWNER of the new organization with full permissions.
 * 
 * @example
 * ```tsx
 * const { mutate: createOrg, isPending } = useCreateOrganization({
 *   onSuccess: (data) => {
 *     // Tokens are already updated with org context
 *     // User is now the owner with full permissions
 *     router.push('/dashboard');
 *   },
 * });
 * 
 * createOrg({
 *   CompanyName: 'Acme Corp',
 *   Industry: 'Technology',
 *   Country: 'India',
 *   Currency: 'INR',
 *   FiscalYearStart: 'April',
 *   CompanyPhone: '+91-9876543210',
 *   CompanyEmail: 'info@acme.com',
 *   Timezone: 'Asia/Kolkata',
 * });
 * ```
 */
export const useCreateOrganization = (options?: UseCreateOrganizationOptions) => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const addOrganization = useAuthStore((state) => state.addOrganization);
  const setSelectedOrganization = useAuthStore((state) => state.setSelectedOrganization);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setOrganizationApiUrl = useAuthStore((state) => state.setOrganizationApiUrl); // ✅ NEW

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => createOrganization(data),
    onSuccess: (response) => {
      if (response.success) {
        const { organization, user_context, tokens } = response.data;

        // Update auth tokens with new organization context
        // ✅ CRITICAL: Pass refresh token to prevent token expiry issues
        setTokens(
          tokens.access_token, 
          tokens.refresh_token || '', // Include refresh token
          tokens.expires_in
        );

        // Create organization object matching the store interface
        const newOrganization = {
          id: organization.id,
          name: organization.name,
          displayName: organization.name,
          isActive: organization.status === 'ACTIVE',
          createdAt: organization.created_at,
        };

        // Add organization to the list and select it
        addOrganization(newOrganization);
        setSelectedOrganization(newOrganization);

        // ✅ CRITICAL: Store organization-specific API URL if provided
        if (organization.api_url) {
          setOrganizationApiUrl(organization.api_url);
          console.log('🌐 Organization API URL stored:', organization.api_url);
        } else {
          setOrganizationApiUrl(null);
          console.log('🌐 No organization API URL provided, using default');
        }

        // Update user with permissions and role
        updateUser({
          role: user_context.role.name.toLowerCase(),
          permissions: user_context.permissions,
        });

        // ✅ TRIGGER GET ORGANIZATIONS API - Invalidate and refetch organizations list
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });

        toast.success('Organization Created!', {
          description: `${organization.name} has been created successfully. You are now the owner.`,
        });

        options?.onSuccess?.(response);
      } else {
        toast.error('Creation Failed', {
          description: response.message || 'Failed to create organization',
        });
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to create organization';

      toast.error('Creation Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Create organization error:', error);
      }

      options?.onError?.(error);
    },
  });
};
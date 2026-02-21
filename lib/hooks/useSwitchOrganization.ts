/**
 * Switch Organization Hook using React Query
 *
 * Handles switching between organizations with proper token updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  switchOrganization,
  type SwitchOrganizationResponse,
} from '@/lib/api';
import { getUserById } from '@/lib/api/users.api';
import { MODULE_PERMISSIONS } from '@/lib/constants/permissions';
import { useAuthStore } from '@/lib/store';
import { organizationKeys } from './useOrganizations';

interface UseSwitchOrganizationOptions {
  onSuccess?: (data: SwitchOrganizationResponse) => void;
  onError?: (error: any) => void;
  silent?: boolean;
}

export const useSwitchOrganization = (options?: UseSwitchOrganizationOptions) => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const currentUserId = useAuthStore((state) => state.user?.userId || state.user?.id || null);
  const setSelectedOrganization = useAuthStore((state) => state.setSelectedOrganization);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setOrganizationApiUrl = useAuthStore((state) => state.setOrganizationApiUrl);
  const setSwitchingOrganization = useAuthStore((state) => state.setSwitchingOrganization);

  const mergePermissions = (...permissionSets: Array<string[] | undefined>) =>
    Array.from(new Set(permissionSets.flatMap((permissions) => permissions || [])));
  const getFullModulePermissions = (): string[] => {
    const moduleIds = new Set<string>([
      ...MODULE_PERMISSIONS.map((module) => module.id),
      'settings',
    ]);

    return Array.from(moduleIds).flatMap((moduleId) => [
      `add_${moduleId}`,
      `view_${moduleId}`,
      `edit_${moduleId}`,
      `delete_${moduleId}`,
    ]);
  };

  return useMutation({
    mutationFn: (organizationId: string) => {
      setSwitchingOrganization(true);
      return switchOrganization(organizationId);
    },
    onSuccess: async (response) => {
      const { organization, user_context, tokens } = response.data;

      setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);

      setSelectedOrganization({
        id: organization.id,
        name: organization.name,
        displayName: organization.name,
        isActive: organization.status === 'ACTIVE',
        createdAt: organization.created_at,
      });

      if (organization.api_url) {
        setOrganizationApiUrl(organization.api_url);
      } else {
        setOrganizationApiUrl(null);
      }

      const resolvedRole = (
        user_context.role?.name ||
        (user_context.is_owner ? 'owner' : 'user')
      ).toLowerCase();
      const hasFullAccess = user_context.is_owner || resolvedRole === 'admin' || resolvedRole === 'owner';

      const resolvedUserId = user_context.user_id || currentUserId;
      const additionalPermissions = user_context.additional_permissions || [];
      let effectivePermissions = mergePermissions(
        user_context.permissions || [],
        additionalPermissions
      );
      let userBranches: string[] = user_context.branch_codes || [];
      let userRestrictionSettings: {
        backDaysLimit?: number;
        timeRestrictionEnabled?: boolean;
        timeFrom?: string;
        timeTo?: string;
        offDay?: string;
      } = {};

      if (resolvedUserId) {
        try {
          const userDetails = await getUserById(resolvedUserId);
          const allowPermissions = userDetails.permissions?.allow || [];
          const denyPermissions = new Set(userDetails.permissions?.deny || []);
          const filteredAllowPermissions = allowPermissions.filter(
            (permission) => !denyPermissions.has(permission)
          );

          effectivePermissions = mergePermissions(
            filteredAllowPermissions,
            additionalPermissions
          );
          userBranches = userDetails.branches || userDetails.Branches || [];
          userRestrictionSettings = {
            backDaysLimit: userDetails.backDaysLimit,
            timeRestrictionEnabled: userDetails.timeRestrictionEnabled,
            timeFrom: userDetails.timeFrom,
            timeTo: userDetails.timeTo,
            offDay: userDetails.offDay,
          };
        } catch (detailsError) {
          console.warn('Could not load user-by-id details after org switch:', detailsError);
        }
      } else {
        console.warn('Could not resolve user id for user-by-id sync after org switch.');
      }

      if (hasFullAccess) {
        effectivePermissions = mergePermissions(
          getFullModulePermissions(),
          effectivePermissions,
          additionalPermissions
        );
      }

      updateUser({
        role: resolvedRole,
        permissions: effectivePermissions,
        additionalPermissions,
        branches: userBranches,
        ...userRestrictionSettings,
      });

      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });

      if (!options?.silent) {
        toast.success('Organization Switched!', {
          description: `Switched to ${organization.name}`,
        });
      }

      setSwitchingOrganization(false);
      options?.onSuccess?.(response);
    },
    onError: (error: any) => {
      setSwitchingOrganization(false);

      const message =
        error.response?.data?.message || error.message || 'Failed to switch organization';

      if (!options?.silent) {
        toast.error('Switch Failed', {
          description: message,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Switch organization error:', error);
      }

      options?.onError?.(error);
    },
  });
};

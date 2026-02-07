/**
 * useDeleteOrganization Hook
 * 
 * React Query hook for deleting organizations
 * Handles organization deletion with proper error handling and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrganization, type DeleteOrganizationResponse } from '@/lib/api';
import { toast } from 'sonner';

/**
 * Hook for deleting an organization
 * 
 * Automatically invalidates organization queries on success
 * Shows success/error toasts
 * 
 * @example
 * ```tsx
 * const { mutate: deleteOrg, isPending } = useDeleteOrganization();
 * 
 * const handleDelete = () => {
 *   deleteOrg('org-123');
 * };
 * ```
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrganizationResponse, Error, string>({
    mutationFn: async (organizationId: string) => {
      return await deleteOrganization(organizationId);
    },
    onSuccess: (response) => {
      // Invalidate organization queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      // Show success toast
      toast.success(response.message || 'Organization deleted successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to delete organization:', error);
      toast.error(error.message || 'Failed to delete organization');
    },
  });
}

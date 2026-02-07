/**
 * useUpdateOrganization Hook
 * 
 * React Query hook for updating organization details
 * Handles organization profile updates with proper error handling and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganization, type UpdateOrganizationRequest, type UpdateOrganizationResponse } from '@/lib/api';
import { toast } from 'sonner';

interface UpdateOrganizationVariables {
  organizationId: string;
  data: UpdateOrganizationRequest;
}

/**
 * Hook for updating organization details
 * 
 * Automatically invalidates organization queries on success
 * Shows success/error toasts
 * 
 * @example
 * ```tsx
 * const { mutate: updateOrg, isPending } = useUpdateOrganization();
 * 
 * const handleUpdate = () => {
 *   updateOrg({
 *     organizationId: 'org-123',
 *     data: {
 *       CompanyName: 'SREE333',
 *       Industry: 'SREE12',
 *       Country: 'INDIA',
 *       Currency: 'INR',
 *       FiscalYearStart: 'AAAAAA',
 *       CompanyPhone: '+91-1234567890',
 *       CompanyEmail: 'info@kluster.com',
 *       Timezone: 'Asia/Kolkata',
 *     }
 *   });
 * };
 * ```
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrganizationResponse, Error, UpdateOrganizationVariables>({
    mutationFn: async ({ organizationId, data }) => {
      return await updateOrganization(organizationId, data);
    },
    onSuccess: (response, variables) => {
      // Invalidate organization queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      
      // Show success toast
      toast.success(response.message || 'Organization updated successfully');
    },
    onError: (error) => {
      console.error('❌ Failed to update organization:', error);
      toast.error(error.message || 'Failed to update organization');
    },
  });
}

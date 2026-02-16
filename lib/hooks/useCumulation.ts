/**
 * Cumulation Hook
 * React Query hook for manual cumulation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performManualCumulation, type CumulationParams } from '@/lib/api/accounts.api';
import { toast } from 'sonner';

/**
 * Hook to perform manual cumulation
 * Invalidates accounts query to refresh data after cumulation
 */
export const useManualCumulation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CumulationParams) => performManualCumulation(params),
    onSuccess: (data) => {
      console.log('✅ Manual cumulation successful:', data);
      
      // Show success toast
      toast.success(data.message || 'Cumulation completed successfully');
      
      // Invalidate and refetch accounts data to get updated values
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      
      console.log('🔄 Refreshing account dashboard data...');
    },
    onError: (error: Error) => {
      console.error('❌ Manual cumulation failed:', error);
      
      // Show error toast
      toast.error(error.message || 'Failed to perform cumulation');
    },
  });
};
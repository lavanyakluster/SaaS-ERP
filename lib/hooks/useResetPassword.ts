/**
 * Reset Password Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resetPassword, type ResetPasswordRequest, type ResetPasswordResponse } from '@/lib/api';

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for resetting password using token from forgot-password
 * 
 * @example
 * ```tsx
 * const { mutate: resetUserPassword, isPending } = useResetPassword({
 *   onSuccess: () => {
 *     localStorage.removeItem('resetToken');
 *     router.push('/login');
 *   },
 * });
 * 
 * resetUserPassword({
 *   token: 'reset-token-from-email',
 *   newPassword: 'NewPassword123!',
 * });
 * ```
 */
export const useResetPassword = (options?: UseResetPasswordOptions) => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onSuccess: (data) => {
      const isSuccess = data.status === 'success' || data.success === true;

      if (isSuccess) {
        toast.success('Password Reset Successful!', {
          description: data.message || 'Your password has been reset successfully.',
        });
      } else {
        toast.info('Password Reset', {
          description: data.message,
        });
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Failed to reset password';

      toast.error('Reset Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error);
      }

      options?.onError?.(error);
    },
  });
};

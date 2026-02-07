/**
 * Forgot Password Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { forgotPassword, ForgotPasswordRequest, ForgotPasswordResponse } from '@/lib/api/auth.api';
import { toast } from 'sonner';
import { ApiError, getErrorMessage } from '@/lib/types/error.types';

interface UseForgotPasswordOptions {
  onSuccess?: (data: ForgotPasswordResponse) => void;
  onError?: (error: ApiError) => void;
}

export const useForgotPassword = (options?: UseForgotPasswordOptions) => {
  return useMutation({
    mutationFn: (email: string) =>
      forgotPassword({
        Email: email,
      } as ForgotPasswordRequest),
    onSuccess: (data) => {
      toast.success('Password Reset Link Sent', {
        description: data.message || 'Check your email for the password reset link',
      });

      options?.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      const message = getErrorMessage(error, 'Failed to send password reset link');

      toast.error('Failed to Send Reset Link', {
        description: message,
      });

      options?.onError?.(error);
    },
  });
};
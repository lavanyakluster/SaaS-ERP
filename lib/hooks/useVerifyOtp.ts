/**
 * Verify OTP Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { verifyOtp, type VerifyOtpResponse } from '@/lib/api';

interface UseVerifyOtpOptions {
  onSuccess?: (data: VerifyOtpResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for verifying OTP
 * 
 * @example
 * ```tsx
 * const { mutate: verifyOtpCode, isPending } = useVerifyOtp({
 *   onSuccess: (data) => {
 *     router.push('/dashboard');
 *   },
 * });
 * 
 * verifyOtpCode({
 *   email: 'user@example.com',
 *   otp: '123456',
 * });
 * ```
 */
export const useVerifyOtp = (options?: UseVerifyOtpOptions) => {
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Verification Successful!', {
          description: data.message || 'Your email has been verified successfully.',
        });
      } else {
        toast.warning('Verification Issue', {
          description: data.message,
        });
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      
      toast.error('Verification Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Verify OTP error:', error);
      }

      options?.onError?.(error);
    },
  });
};

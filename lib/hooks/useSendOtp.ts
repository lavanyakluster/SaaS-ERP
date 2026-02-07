/**
 * Send OTP Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sendOtp, type SendOtpResponse } from '@/lib/api';

interface UseSendOtpOptions {
  onSuccess?: (data: SendOtpResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for sending OTP to email
 * 
 * @example
 * ```tsx
 * const { mutate: sendOtpToEmail, isPending } = useSendOtp({
 *   onSuccess: (data) => {
 *     console.log('OTP sent successfully');
 *   },
 * });
 * 
 * sendOtpToEmail({ Email: 'user@example.com' });
 * ```
 */
export const useSendOtp = (options?: UseSendOtpOptions) => {
  return useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('OTP Sent!', {
          description: data.message || 'Please check your email for the OTP code.',
        });
      } else {
        toast.info('OTP Status', {
          description: data.message,
        });
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to send OTP';
      
      toast.error('Failed to Send OTP', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Send OTP error:', error);
      }

      options?.onError?.(error);
    },
  });
};
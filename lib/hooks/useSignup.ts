/**
 * Signup Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { signup, type SignupRequest, type SignupResponse } from '@/lib/api';

interface UseSignupOptions {
  onSuccess?: (data: SignupResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for user signup
 * 
 * @example
 * ```tsx
 * const { mutate: signupUser, isPending } = useSignup({
 *   onSuccess: (data) => {
 *     router.push('/verify-email');
 *   },
 * });
 * 
 * signupUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'password123',
 *   provider: 'local',
 * });
 * ```
 */
export const useSignup = (options?: UseSignupOptions) => {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      // Handle different response messages
      if (data.message === 'invitation_already_sent') {
        toast.info('Invitation Already Sent', {
          description: 'An invitation has already been sent to this email address.',
        });
      } else if (data.requiresVerification) {
        toast.success('Signup Successful!', {
          description: 'Please check your email to verify your account.',
        });
      } else {
        toast.success('Signup Successful!', {
          description: 'Your account has been created.',
        });
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      // Extract error from API response
      const apiError = error.response?.data?.error || error.response?.data?.message;
      
      // Map API error codes to user-friendly messages
      let message = 'Signup failed. Please try again.';
      
      if (apiError === 'email_already_registered') {
        message = 'This email is already registered. Please sign in or use a different email.';
      } else if (apiError === 'invalid_email') {
        message = 'Please enter a valid email address.';
      } else if (apiError === 'weak_password') {
        message = 'Password is too weak. Please choose a stronger password.';
      } else if (apiError === 'user_already_exists') {
        message = 'An account with this email already exists. Please sign in.';
      } else if (typeof apiError === 'string' && apiError.length > 0) {
        // Use the API error message if it's a meaningful string
        message = apiError;
      } else if (error.message && error.message !== 'Request failed') {
        // Fallback to error message if available
        message = error.message;
      }
      
      toast.error('Signup Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Signup error:', error);
        console.error('API error:', apiError);
      }

      options?.onError?.(error);
    },
  });
};
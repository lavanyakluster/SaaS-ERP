/**
 * Social Login Hook using React Query
 * Supports Microsoft OAuth authentication
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loginWithMicrosoft, type MicrosoftAuthRequest, type LoginResponse } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export type SocialLoginRequest = MicrosoftAuthRequest;
export type SocialLoginResponse = LoginResponse;

interface UseSocialLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for Microsoft social authentication
 * 
 * Automatically stores tokens and updates auth state on success
 * 
 * @example
 * ```tsx
 * const { mutate: loginWithMicrosoft, isPending } = useSocialLogin({
 *   onSuccess: (data) => {
 *     if (data.isNewUser) {
 *       router.push('/onboarding');
 *     } else {
 *       router.push('/dashboard');
 *     }
 *   },
 * });
 * 
 * // After getting ID token from Microsoft OAuth
 * loginWithMicrosoft({ Provider: 'Microsoft', IdToken: idToken });
 * ```
 */
export const useSocialLogin = (options?: UseSocialLoginOptions) => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: SocialLoginRequest) => {
      return loginWithMicrosoft(data);
    },
    onSuccess: (data) => {
      // Store tokens and update auth state
      // ✅ CRITICAL: Pass refresh token to prevent token expiry issues
      setTokens(
        data.accessToken, 
        data.refreshToken, 
        data.expiresIn
      );

      // Update user state
      setUser({
        id: data.userId || '',
        userId: data.userId,
        email: data.user?.email || '',
        name: data.user?.name || '',
        role: data.user?.role || '',
        permissions: [],
      });

      // Show success message
      if (data.isNewUser) {
        toast.success('Welcome to SmartBook!', {
          description: 'Your account has been created successfully.',
        });
      } else {
        toast.success('Welcome Back!', {
          description: 'You have successfully logged in.',
        });
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || 'Social login failed';

      toast.error('Login Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Social login error:', error);
      }

      options?.onError?.(error);
    },
  });
};
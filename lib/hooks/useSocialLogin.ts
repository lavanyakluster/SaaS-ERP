/**
 * Social Login Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loginWithGoogle, loginWithMicrosoft, type GoogleAuthRequest, type MicrosoftAuthRequest, type LoginResponse } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

// Union type for social login requests
export type SocialLoginRequest = GoogleAuthRequest | MicrosoftAuthRequest;
export type SocialLoginResponse = LoginResponse;

interface UseSocialLoginOptions {
  provider: 'google' | 'microsoft';
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for social authentication (Google or Microsoft)
 * 
 * Automatically stores tokens and updates auth state on success
 * 
 * @example
 * ```tsx
 * const { mutate: loginWithGoogle, isPending } = useSocialLogin({
 *   provider: 'google',
 *   onSuccess: (data) => {
 *     if (data.isNewUser) {
 *       router.push('/onboarding');
 *     } else {
 *       router.push('/dashboard');
 *     }
 *   },
 * });
 * 
 * // After getting credential from Google SDK
 * loginWithGoogle({ credential: googleCredential });
 * ```
 */
export const useSocialLogin = (options: UseSocialLoginOptions) => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const mutationFn = options.provider === 'google' ? loginWithGoogle : loginWithMicrosoft;

  return useMutation({
    mutationFn: (data: SocialLoginRequest) => {
      if (options.provider === 'google') {
        return mutationFn(data as GoogleAuthRequest);
      } else {
        return mutationFn(data as MicrosoftAuthRequest);
      }
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
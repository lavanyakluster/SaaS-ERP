/**
 * Login Hook using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { login, type LoginResponse, type LoginCredentials } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { setAuthStatusCookie } from '@/lib/utils/auth-helpers';

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for user login with automatic token storage
 * 
 * @example
 * ```tsx
 * const { mutate: loginUser, isPending } = useLogin({
 *   onSuccess: (data) => {
 *     if (data.emailVerified) {
 *       router.push('/dashboard');
 *     } else {
 *       router.push('/verify-email');
 *     }
 *   },
 * });
 * 
 * loginUser({
 *   Email: 'user@example.com',
 *   Password: 'password123',
 * });
 * ```
 */
export const useLogin = (options?: UseLoginOptions) => {
  const { setTokens, setUser, setStatus } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        console.log('🔐 Login attempt:', credentials.Email);
        const response = await login(credentials);
        
        console.log('✅ Login API response (RAW):', response);
        console.log('📊 Raw expiresIn from API:', {
          expiresIn: response.expiresIn,
          type: typeof response.expiresIn,
          asNumber: Number(response.expiresIn),
          asNumberType: typeof Number(response.expiresIn),
        });
        
        return response;
      } catch (error) {
        console.error('❌ Login API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Login success handler:', data);
      console.log('🔍 Token details:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn,
        expiresInType: typeof data.expiresIn,
        accessTokenLength: data.accessToken?.length,
        refreshTokenLength: data.refreshToken?.length,
      });
      console.log('📊 Raw API response expiresIn:', data.expiresIn);
      
      // ✅ Store both access token AND refresh token
      setTokens(data.accessToken, data.refreshToken, data.expiresIn);
      console.log('✅ Tokens stored in auth store (access + refresh)');
      console.log('🔍 Tokens stored with expiresIn:', data.expiresIn);

      // Store user information
      setUser({
        id: data.userId,
        userId: data.userId,
        email: '', // Email will be extracted from JWT token or loaded separately
        name: '', // Name will be loaded from profile API
        role: '', // Role will be loaded from profile API
        permissions: [],
      });
      console.log('✅ User information stored');

      // ✅ CRITICAL FIX: Set status AND cookie IMMEDIATELY based on isNewUser flag
      // This prevents race condition where AuthProvider redirects before status is set
      const newStatus = data.isNewUser ? 'pending' : 'authenticated';
      
      if (data.isNewUser) {
        console.log('✅ Setting status to pending (new user) - IMMEDIATELY');
        setStatus('pending');
        setAuthStatusCookie('pending');
      } else {
        console.log('✅ Setting status to authenticated (existing user) - IMMEDIATELY');
        setStatus('authenticated');
        setAuthStatusCookie('authenticated');
      }
      
      console.log('📊 Current auth state (after status set):', {
        hasTokens: !!useAuthStore.getState().tokens,
        hasUser: !!useAuthStore.getState().user,
        currentStatus: useAuthStore.getState().status,
      });
      
      // ✅ Verify cookie was set
      const cookieStatus = typeof document !== 'undefined' 
        ? document.cookie.split('; ').find(row => row.startsWith('auth-status='))?.split('=')[1]
        : null;
      console.log('🍪 Cookie set in useLogin:', cookieStatus);

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('❌ Login error handler:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';

      toast.error('Login Failed', {
        description: message,
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }

      options?.onError?.(error);
    },
  });
};
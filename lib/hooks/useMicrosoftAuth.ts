import { useState } from 'react';
import { useSocialLogin } from './useSocialLogin';
import { signInWithMicrosoftPopup } from '@/lib/auth/microsoft-auth.service';
import { isMicrosoftAuthConfigured } from '@/lib/auth/microsoft-auth.config';
import { toast } from 'sonner';
import type { LoginResponse } from '@/lib/api';

interface UseMicrosoftAuthOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: any) => void;
}

export const useMicrosoftAuth = (options?: UseMicrosoftAuthOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { mutateAsync: socialLogin } = useSocialLogin({
    provider: 'microsoft',
    onSuccess: (data) => {
      setIsLoading(false);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      setIsLoading(false);
      options?.onError?.(error);
    }
  });

  const loginWithMicrosoft = async () => {
    try {
      if (!isMicrosoftAuthConfigured()) {
        throw new Error('Microsoft authentication is not configured. Set NEXT_PUBLIC_MICROSOFT_CLIENT_ID and NEXT_PUBLIC_MICROSOFT_REDIRECT_URI.');
      }
      setIsLoading(true);
      const result = await signInWithMicrosoftPopup();
      
      if (!result.success || !result.idToken) {
        throw new Error(result.error || 'Microsoft login failed');
      }

      await socialLogin({
        Provider: 'Microsoft',
        IdToken: result.idToken,
      });
      
    } catch (error: any) {
      setIsLoading(false);
      
      // Don't show toast for user cancellation
      if (error.message !== 'Login cancelled by user') {
        console.error('Microsoft login flow error:', error);
        toast.error('Microsoft Login Failed', {
          description: error.message || 'An unexpected error occurred'
        });
      }
      
      options?.onError?.(error);
    }
  };

  return {
    loginWithMicrosoft,
    isLoading
  };
};

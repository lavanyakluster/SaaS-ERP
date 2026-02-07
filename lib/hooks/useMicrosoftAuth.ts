import { useState } from 'react';
import { useSocialLogin } from './useSocialLogin';
import { signInWithMicrosoftPopup } from '@/lib/auth/microsoft-auth.service';
import { toast } from 'sonner';
import { SocialLoginResponse } from '@/lib/api';

interface UseMicrosoftAuthOptions {
  onSuccess?: (data: SocialLoginResponse) => void;
  onError?: (error: any) => void;
}

export const useMicrosoftAuth = (options?: UseMicrosoftAuthOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { mutateAsync: socialLogin } = useSocialLogin({
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
      setIsLoading(true);
      const result = await signInWithMicrosoftPopup();
      
      if (!result.success || !result.idToken) {
        throw new Error(result.error || 'Microsoft login failed');
      }

      await socialLogin({
        Provider: 'Microsoft',
        IdToken: result.idToken
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

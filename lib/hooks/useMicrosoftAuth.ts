/**
 * Microsoft Authentication Hook
 * Handles Microsoft OAuth login flow
 */

import { useState } from 'react';
import { useSocialLogin } from './useSocialLogin';
import { signInWithMicrosoftPopup } from '@/lib/auth/microsoft-oauth.service';
import { toast } from 'sonner';
import { LoginResponse } from '@/lib/api';

interface UseMicrosoftAuthOptions {
  onSuccess?: (data: LoginResponse) => void;
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
      
      console.log('🔵 Starting Microsoft OAuth flow...');
      const result = await signInWithMicrosoftPopup();
      
      if (!result.success || !result.idToken) {
        throw new Error(result.error || 'Microsoft login failed');
      }

      console.log('✅ Microsoft OAuth successful, sending to backend...');
      
      await socialLogin({
        Provider: 'Microsoft',
        IdToken: result.idToken
      });
      
    } catch (error: any) {
      setIsLoading(false);
      
      // Don't show toast for user cancellation
      if (error.message !== 'Login cancelled by user') {
        console.error('❌ Microsoft login flow error:', error);
        toast.error('Microsoft Login Failed', {
          description: error.message || 'An unexpected error occurred'
        });
      } else {
        console.log('ℹ️ Microsoft login cancelled by user');
      }
      
      options?.onError?.(error);
    }
  };

  return {
    loginWithMicrosoft,
    isLoading
  };
};
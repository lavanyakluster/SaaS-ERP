import { useEffect, useState } from 'react';
import { useSocialLogin } from './useSocialLogin';
import { 
  initializeGoogleOneTap, 
  showGoogleOneTapPrompt, 
  cancelGoogleOneTap, 
  type GoogleCredentialResponse 
} from '@/lib/auth/google-one-tap.service';
import { toast } from 'sonner';
import { SocialLoginResponse } from '@/lib/api';

interface UseGoogleOneTapOptions {
  onSuccess?: (data: SocialLoginResponse) => void;
  onError?: (error: any) => void;
  autoPrompt?: boolean;
}

export const useGoogleOneTap = (options?: UseGoogleOneTapOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);
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

  const handleGoogleSuccess = async (response: GoogleCredentialResponse) => {
    try {
      setIsLoading(true);
      
      await socialLogin({
        Provider: 'Google',
        IdToken: response.credential
      });
      
    } catch (error: any) {
      setIsLoading(false);
      console.error('Google login flow error:', error);
      toast.error('Google Login Failed', {
        description: error.message || 'An unexpected error occurred'
      });
      options?.onError?.(error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initializeGoogleOneTap({
        onSuccess: (response) => {
          if (mounted) handleGoogleSuccess(response);
        },
        onError: (error) => {
          if (mounted && options?.onError) options.onError(error);
        }
      });
      
      if (mounted) {
        setIsInitialized(true);
        if (options?.autoPrompt !== false) {
          showGoogleOneTapPrompt();
        }
      }
    };

    init();

    return () => {
      mounted = false;
      cancelGoogleOneTap();
    };
  }, []);

  return {
    isInitialized,
    isLoading,
    showPrompt: showGoogleOneTapPrompt
  };
};

'use client';

import { useLogin, useMicrosoftAuth, useGoogleOneTap } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from 'lucide-react';
import { validateRequired } from '@/lib/utils/validation';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthActions, useAuthStore } from '@/lib/store/auth-store';
import { setAuthStatusCookie } from '@/lib/utils/auth-helpers';
import { 
  ModernLoginLayout, 
  FormInput, 
  PasswordInput, 
  SocialAuthButtons,
  AlertMessage,
  FormDivider,
  SubmitButton,
  SecureBadge
} from '@/components/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // ✅ PERFORMANCE: Use theme store correctly
  const { theme } = useTheme();
  
  // 🐛 DEBUG: Track component renders
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 LoginPage render', { theme, mounted });
  }
  
  // ✅ PERFORMANCE: Use actions selector (never causes re-renders)
  const { setTokens, setStatus, setUser } = useAuthActions();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | null>(null);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);

  // Helper function to handle successful login redirection
  const handleLoginSuccess = useCallback((data: { isNewUser: boolean; emailVerified?: boolean }) => {
    console.log('🔄 handleLoginSuccess called:', data);
    
    // ✅ Status and cookie are ALREADY set in useLogin hook - just handle routing
    if (data.isNewUser) {
      console.log('📍 New user - redirecting to tenant-setup');
      router.push('/tenant-setup');
    } else {
      console.log('📍 Existing user - redirecting to dashboard');
      
      // ✅ Trigger organization switcher after login for existing users
      const { setShouldShowOrgSwitcher } = useAuthStore.getState();
      setShouldShowOrgSwitcher(true);
      console.log('🔄 Organization switcher will be triggered after redirect');
      
      // ✅ Immediate redirect - no setTimeout needed!
      router.push('/dashboard');
    }
  }, [router]); // Removed setStatus since it's now in useLogin

  // Login mutation
  const loginMutation = useLogin({
    onSuccess: (data) => {
      // ✅ Token storage is handled by useLogin hook - no need to duplicate here
      
      // Handle "Remember Me" - only save email, never passwords or tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        
        // Clear pending email verification data
        localStorage.removeItem('pendingUserEmail');
        localStorage.removeItem('pendingUserName');
        
        // Clean up old localStorage tokens (migration)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresIn');
      }
      
      // Handle routing based on isNewUser flag
      handleLoginSuccess(data);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrors({ general: errorMessage });
    },
  });

  // Microsoft Auth hook
  const microsoftAuth = useMicrosoftAuth({
    onSuccess: (data) => {
      setSocialLoading(null);
      handleLoginSuccess(data);
    },
    onError: (error) => {
      setSocialLoading(null);
      // Don't show error for user cancellation
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error as Error)?.message || 'Microsoft login failed. Please try again.';
      
      // Skip error display if user cancelled
      if (!errorMessage.includes('cancelled')) {
        setErrors({ general: errorMessage });
      }
    },
  });

  // Google One Tap hook - TEMPORARILY DISABLED to debug infinite loop
  // const googleOneTap = useGoogleOneTap({
  //   onSuccess: (data) => {
  //     setSocialLoading(null);
  //     handleLoginSuccess(data);
  //   },
  //   onError: (error: any) => {
  //     setSocialLoading(null);
  //     const errorMessage = error?.response?.data?.message || error?.message || 'Google login failed';
  //     setErrors({ general: errorMessage });
  //   },
  // });

  // Check for email verification success message and clean up storage on mount
  useEffect(() => {
    setMounted(true);
    
    // Check if user just verified their email
    const verified = searchParams?.get('verified');
    if (verified === 'true') {
      setShowVerifiedMessage(true);
    }
    
    // Clean up ALL localStorage on mount (SECURITY)
    if (typeof window !== 'undefined') {
      localStorage.clear();
      console.log('✅ localStorage cleared for security');
    }
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newErrors: typeof errors = {};
    
    const usernameValidation = validateRequired(email);
    if (!usernameValidation.isValid) {
      newErrors.email = usernameValidation.error || 'Email is required';
    }
    
    const passwordValidation = validateRequired(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Trigger the login mutation
    loginMutation.mutate({
      email: email,
      password: password,
    });
  }, [email, password, loginMutation]);

  const handleForgotPassword = useCallback(() => {
    router.push('/forgot-password');
  }, []); // ✅ Removed 'router' from dependencies

  if (!mounted) {
    return null;
  }

  return (
    <ModernLoginLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <SecureBadge theme={theme} />
          
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Sign in
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Continue to your SmartBook account
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <AlertMessage 
            type="error" 
            message={errors.general}
            theme={theme}
          />
        )}

        {/* Email Verified Success Message */}
        {showVerifiedMessage && !errors.general && (
          <AlertMessage 
            type="success"
            title="Email verified successfully!"
            message="Please sign in to set up your organization"
            theme={theme}
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <FormInput
            label="Email address"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={loginMutation.isPending}
            error={errors.email}
            icon={<User className="w-5 h-5" />}
            theme={theme}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loginMutation.isPending}
            error={errors.password}
            theme={theme}
          />

          {/* Forgot Password */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <SubmitButton
            isLoading={loginMutation.isPending}
            loadingText="Signing in..."
            disabled={socialLoading !== null}
          >
            Sign in
          </SubmitButton>
        </form>

        {/* Divider */}
        <FormDivider theme={theme} />

        {/* Social Login */}
        <SocialAuthButtons
          theme={theme}
          disabled={loginMutation.isPending}
          isLoading={socialLoading}
          microsoftLoading={microsoftAuth.isLoading}
          onGoogleSuccess={() => {
            setSocialLoading(null);
          }}
          onGoogleError={(error) => {
            setSocialLoading(null);
            setErrors({ general: error?.message || 'Google login failed' });
          }}
          onMicrosoftClick={() => {
            setSocialLoading('microsoft');
            setErrors({});
            microsoftAuth.loginWithMicrosoft();
          }}
        />

        {/* Footer */}
        <div className="text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </ModernLoginLayout>
  );
}
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { validateEmailField, validatePasswordField, validateRequired, validatePasswordConfirmation, getPasswordStrength } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/constants/app';
import { BRAND_FEATURES, TRUST_STATS } from '@/lib/constants/signup';
import { useSignup, useSendOtp } from '@/lib/hooks';
import {
  FormInput,
  PasswordInput,
  SocialAuthButtons,
  AlertMessage,
  FormDivider,
  SubmitButton,
  EnterpriseCarousel,
} from '@/components/auth';

// ============================================================================
// TYPES
// ============================================================================

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

type SocialProvider = 'google' | 'microsoft';

// ============================================================================
// CONSTANTS
// ============================================================================

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

export default function SignUpPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // Form state
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // API Hook
  const { mutate: sendOtp } = useSendOtp();

  const { mutate: signupUser, isPending: isSignupPending } = useSignup({
    onSuccess: (data) => {
      // No need to store user info in localStorage - redirect directly to verification page
      console.log('✅ Signup successful, redirecting to verification...');

      // Handle different response messages
      if (data.message === 'invitation_already_sent') {
        setErrors({
          general: 'An invitation has already been sent to this email address. Please check your email.',
        });
      } else {
        // Send OTP immediately after successful signup
        sendOtp({ Email: email }, {
          onSuccess: () => {
             // Redirect to email verification page with sent flag
             router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(email)}&sent=true`);
          },
          onError: () => {
             // If sending fails, still redirect but let the verify page try again (or show resend button)
             router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(email)}`);
          }
        });
      }
    },
    onError: (error) => {
      console.error('❌ Signup error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract error message from API response
      const apiError = error.response?.data?.error || error.response?.data?.message;
      
      // Map API error codes to user-friendly messages
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (apiError === 'email_already_registered') {
        errorMessage = 'This email is already registered. Please sign in or use a different email.';
      } else if (apiError === 'invalid_email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (apiError === 'weak_password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (apiError === 'user_already_exists') {
        errorMessage = 'An account with this email already exists. Please sign in.';
      } else if (typeof apiError === 'string') {
        // Use the API error message if it's a string
        errorMessage = apiError;
      }
      
      setErrors({
        general: errorMessage,
      });
    },
  });

  // Loading state
  const isLoading = isSignupPending;

  // Password strength calculation (memoized)
  const passwordStrength = useMemo(() => {
    return getPasswordStrength(password);
  }, [password]);

  // Form validation
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate full name
    const nameValidation = validateRequired(fullName.trim());
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error || 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Validate email
    const emailValidation = validateEmailField(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Email is required';
    }

    // Validate password
    const passwordValidation = validatePasswordField(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || 'Password is required';
    }

    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      newErrors.confirmPassword = confirmValidation.error || 'Passwords must match';
    }

    // Validate terms
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms and Privacy Policy';
    }

    return newErrors;
  }, [fullName, email, password, confirmPassword, agreeToTerms]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Form submitted');
    console.log('Form data:', { fullName, email, password: '***', confirmPassword: '***', agreeToTerms });
    
    const newErrors = validateForm();
    console.log('Validation errors:', newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation failed');
      setErrors(newErrors);
      return;
    }

    console.log('✅ Validation passed, calling signup API');
    setErrors({});
    
    // Call signup API
    signupUser({
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      provider: 'local',
    });
  }, [validateForm, fullName, email, password, signupUser]);

  // Handle social login
  const handleSocialLogin = useCallback((provider: SocialProvider) => {
    setSocialLoading(provider);
    setErrors({});

    // Mock social login
    setTimeout(() => {
      setSocialLoading(null);
      console.log(`Mock ${provider} signup`);
      router.push('/dashboard');
    }, 1500);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex ${
      theme.theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Enterprise Carousel Section - Left Side */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative overflow-hidden min-h-screen">
        <EnterpriseCarousel theme={theme.theme} />
      </div>

      {/* Sign Up Form Section - Right Side - ULTRA COMPACT */}
      <div className={`flex-1 flex items-center justify-center p-3 lg:p-6 min-h-screen ${
        theme.theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="w-full max-w-md">
          {/* Compact Card */}
          <div className={`rounded-2xl shadow-xl border p-5 lg:p-6 ${
            theme.theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Header - Ultra Compact */}
            <div className="text-center mb-4">
              <h1 className={`text-xl font-bold mb-1 ${
                theme.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Create your account
              </h1>
              <p className={`text-xs ${
                theme.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Start your 14-day free trial • No credit card required
              </p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-3">
                <AlertMessage 
                  type="error" 
                  message={errors.general}
                  theme={theme}
                />
              </div>
            )}

            {/* Social Sign Up - Compact */}
            <div className="mb-3">
              <SocialAuthButtons
                theme={theme}
                disabled={isLoading}
                isLoading={socialLoading}
                microsoftLoading={socialLoading === 'microsoft'}
                onGoogleSuccess={() => handleSocialLogin('google')}
                onGoogleError={(error) => {
                  setSocialLoading(null);
                  setErrors({ general: 'Google sign up failed. Please try again.' });
                }}
                onMicrosoftClick={() => handleSocialLogin('microsoft')}
              />
            </div>

            <FormDivider theme={theme} />

            {/* Sign Up Form - Ultra Compact */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Full Name */}
              <FormInput
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="John Doe"
                icon={<User className="w-3.5 h-3.5" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                theme={theme}
                required
                disabled={isLoading}
                autoComplete="name"
              />

              {/* Email */}
              <FormInput
                label="Work Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                icon={<Mail className="w-3.5 h-3.5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                theme={theme}
                required
                disabled={isLoading}
                autoComplete="email"
              />

              {/* Password */}
              <PasswordInput
                label="Password"
                name="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                error={errors.password}
                theme={theme}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />

              {/* Password Requirements - Ultra Compact */}
              {(passwordFocused || password.length > 0) && (
                <div className={`p-2 rounded-lg border text-xs ${
                  theme.theme === 'dark' 
                    ? 'bg-gray-900/50 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="grid grid-cols-2 gap-1">
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const isValid = req.test(password);
                      return (
                        <div
                          key={req.id}
                          className={`flex items-center gap-1 ${
                            isValid 
                              ? 'text-green-600 dark:text-green-400' 
                              : theme.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          <CheckCircle2 className={`w-2.5 h-2.5 flex-shrink-0 ${
                            isValid ? 'opacity-100' : 'opacity-40'
                          }`} />
                          <span className="text-[10px] leading-tight">{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                theme={theme}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />

              {/* Terms & Conditions - Ultra Compact */}
              <div>
                <div className="flex items-start gap-1.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className={`mt-0.5 w-3 h-3 rounded border transition-all flex-shrink-0 ${
                      errors.terms 
                        ? 'border-red-300 dark:border-red-700 text-red-600 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500'
                    } focus:ring-1 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="terms"
                    className={`text-[10px] cursor-pointer select-none leading-tight ${
                      theme.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    I agree to the{' '}
                    <Link 
                      href="/terms" 
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    >
                      Terms
                    </Link>
                    {' '}and{' '}
                    <Link 
                      href="/privacy" 
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 ml-4 mt-0.5">
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit Button - Compact */}
              <div className="pt-1">
                <SubmitButton
                  loading={isLoading}
                  disabled={isLoading}
                  theme={theme}
                >
                  Create account
                </SubmitButton>
              </div>
            </form>

            {/* Sign In Link - Ultra Compact */}
            <p className={`text-center text-[10px] mt-4 ${
              theme.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Already have an account?{' '}
              <Link 
                href={ROUTES.login}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust Badge - Ultra Compact */}
          <div className={`text-center mt-3 text-[10px] ${
            theme.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            🔒 Secure • 256-bit encryption • GDPR compliant
          </div>
        </div>
      </div>
    </div>
  );
}
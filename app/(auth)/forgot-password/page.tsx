'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { validateRequired, validateEmailField } from '@/lib/utils/validation';
import { useTheme } from '@/lib/store/theme-store';
import { useForgotPassword } from '@/lib/hooks';
import { 
  FormInput,
  AlertMessage,
  SubmitButton
} from '@/components/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  // React Query mutation
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: (data) => {
      setSuccess(true);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send reset link. Please try again.';
      setErrors({ general: errorMessage });
    },
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newErrors: typeof errors = {};
    
    const emailRequiredValidation = validateRequired(email);
    if (!emailRequiredValidation.isValid) {
      newErrors.email = emailRequiredValidation.error || 'Email is required';
    } else {
      const emailValidation = validateEmailField(email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Invalid email address';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Call API
    forgotPasswordMutation.mutate(email);
  }, [email, forgotPasswordMutation]);

  const handleBackToLogin = useCallback(() => {
    router.push('/login');
  }, []); // ✅ Removed 'router' from dependencies

  // Success state
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
      }`}>
        <div className="w-full max-w-md">
          <div className={`rounded-3xl p-8 text-center ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white shadow-2xl'
          }`}>
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <h2 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Check Your Email
            </h2>
            
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              We've sent a password reset link to{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {email}
              </span>
            </p>

            <div className={`p-4 rounded-2xl mb-6 ${
              theme === 'dark' 
                ? 'bg-emerald-900/20 border border-emerald-800' 
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                Please check your inbox and spam folder. The link will expire in 24 hours.
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 shadow-lg transition-all hover:scale-105"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className={`rounded-3xl p-8 ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white shadow-2xl'
        }`}>
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Forgot Password?
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6">
              <AlertMessage 
                type="error" 
                message={errors.general}
                theme={theme}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              error={errors.email}
              disabled={forgotPasswordMutation.isPending}
              icon={<Mail className="w-5 h-5" />}
              theme={theme}
            />

            <div className={`p-4 rounded-2xl text-sm ${
              theme === 'dark' 
                ? 'bg-blue-900/20 border border-blue-800' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}>
                💡 <span className="font-semibold">Tip:</span> Enter the email associated with your account
              </p>
            </div>

            {/* Submit Button */}
            <SubmitButton
              isLoading={forgotPasswordMutation.isPending}
              loadingText="Sending reset link..."
              showArrow={false}
            >
              Send Reset Link
            </SubmitButton>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
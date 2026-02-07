'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useMutation } from '@tanstack/react-query';
import { createPassword } from '@/lib/api/auth.api';
import { 
  PasswordInput,
  AlertMessage,
  SubmitButton,
  SecureBadge
} from '@/components/auth';
import { validatePasswordField, validatePasswordConfirmation } from '@/lib/utils/validation';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Password strength criteria
 */
const PASSWORD_CRITERIA = [
  { id: 'length', label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One number', test: (pwd: string) => /\d/.test(pwd) },
  { id: 'special', label: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
] as const;

/**
 * Password strength levels
 */
const STRENGTH_LEVELS: Record<number, PasswordStrength> = {
  0: { score: 0, label: 'Too weak', color: 'bg-red-500' },
  1: { score: 1, label: 'Weak', color: 'bg-orange-500' },
  2: { score: 2, label: 'Fair', color: 'bg-yellow-500' },
  3: { score: 3, label: 'Good', color: 'bg-blue-500' },
  4: { score: 4, label: 'Strong', color: 'bg-green-500' },
  5: { score: 5, label: 'Very Strong', color: 'bg-emerald-500' },
};

// ============================================================================
// CREATE PASSWORD CONTENT COMPONENT
// ============================================================================

/**
 * Create Password Page Content
 * Handles password creation for invited users
 */
function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark } = useTheme();

  // Create password mutation
  const createPasswordMutation = useMutation({
    mutationFn: createPassword,
    onSuccess: (data) => {
      toast.success(data.message || 'Password created successfully!');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?created=success');
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create password. Please try again.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    },
  });

  // ============================================
  // STATE
  // ============================================

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [token, setToken] = useState<string | null>(null);

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Extract token from URL on mount
   */
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrors({ general: 'Invalid or missing invitation token. Please check your invitation email.' });
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  /**
   * Calculate password strength
   */
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) return STRENGTH_LEVELS[0];
    
    const metCriteria = PASSWORD_CRITERIA.filter(criterion => criterion.test(password)).length;
    return STRENGTH_LEVELS[metCriteria] || STRENGTH_LEVELS[0];
  }, [password]);

  /**
   * Check if form is valid
   */
  const isFormValid = useMemo(() => {
    return (
      password.length >= 8 &&
      confirmPassword.length >= 8 &&
      password === confirmPassword &&
      passwordStrength.score >= 3 &&
      !!token
    );
  }, [password, confirmPassword, passwordStrength.score, token]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle password change with validation
   */
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Clear password error
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }

    // Validate if user has started typing confirmation
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [confirmPassword, errors.password]);

  /**
   * Handle confirm password change with validation
   */
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    // Validate match
    if (password && newConfirmPassword !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [password]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate token
    if (!token) {
      setErrors({ general: 'Invalid invitation token. Please check your invitation email.' });
      return;
    }

    // Validate password
    const passwordValidation = validatePasswordField(password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.error });
      return;
    }

    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmValidation.isValid) {
      setErrors({ confirmPassword: confirmValidation.error });
      return;
    }

    // Check password strength
    if (passwordStrength.score < 3) {
      setErrors({ password: 'Password is too weak. Please choose a stronger password.' });
      return;
    }

    // Submit password creation
    try {
      await createPasswordMutation.mutateAsync({
        token,
        NewPassword: password,
      });
    } catch (err) {
      // Error is handled by the mutation's onError
      console.error('Create password error:', err);
    }
  }, [token, password, confirmPassword, passwordStrength.score, createPasswordMutation]);

  // ============================================
  // RENDER
  // ============================================

  const isLoading = createPasswordMutation.isPending;
  const success = createPasswordMutation.isSuccess;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            isDark 
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
              : 'bg-gradient-to-br from-emerald-50 to-teal-50'
          }`}>
            <KeyRound className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Your Password
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome to SmartBook! Set up your password to get started
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <AlertMessage
            type="success"
            title="Password Created Successfully!"
            message="Your password has been set. Redirecting to login..."
            icon={CheckCircle2}
          />
        )}

        {/* Error Messages */}
        {errors.general && !success && (
          <AlertMessage
            type="error"
            title="Setup Failed"
            message={errors.general}
            icon={AlertCircle}
          />
        )}

        {/* Create Password Form */}
        {!success && (
          <form onSubmit={handleSubmit} className={`rounded-2xl border p-8 space-y-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Password *
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                required
                disabled={isLoading || !token}
                error={errors.password}
                showStrength={true}
                aria-label="Password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : 'password-strength'}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div id="password-strength" className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Password Strength:
                  </span>
                  <span className={`text-xs font-semibold ${
                    passwordStrength.score >= 3 
                      ? 'text-green-500' 
                      : passwordStrength.score >= 2 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={passwordStrength.score}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label="Password strength"
                  />
                </div>

                {/* Password Criteria Checklist */}
                <div className="mt-3 space-y-1">
                  {PASSWORD_CRITERIA.map(criterion => (
                    <div 
                      key={criterion.id}
                      className={`flex items-center gap-2 text-xs ${
                        criterion.test(password)
                          ? isDark ? 'text-green-400' : 'text-green-600'
                          : isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className={`w-3 h-3 ${criterion.test(password) ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{criterion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="confirmPassword" 
                className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Confirm Password *
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading || !token}
                error={errors.confirmPassword}
                aria-label="Confirm password"
                aria-required="true"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <SubmitButton
              isLoading={isLoading}
              disabled={!isFormValid || isLoading}
              loadingText="Creating password..."
            >
              Create Password
            </SubmitButton>

            {/* Security Badge */}
            <SecureBadge />

            {/* Back to Login Link */}
            <div className="text-center">
              <Link 
                href="/login"
                className={`text-sm font-medium transition-colors ${
                  isDark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Already have a password? Login
              </Link>
            </div>
          </form>
        )}

        {/* Success - Redirecting Message */}
        {success && (
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Redirecting to login page...</span>
            </div>
            <Link
              href="/login"
              className={`inline-block text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Go to Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT WITH SUSPENSE
// ============================================================================

/**
 * Create Password Page
 * Allows invited users to set up their initial password
 */
export default function CreatePasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <CreatePasswordContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { ModernLoginLayout } from '@/components/auth';
import { useSendOtp, useVerifyOtp } from '@/lib/hooks';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const hasInitialOtpSent = useRef(false);

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP mutation
  const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp({
    onSuccess: (data) => {
      console.log('✅ OTP sent:', data.message);
      setResendCooldown(60);
      setError('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to send OTP';
      setError(message);
    },
  });

  // Verify OTP mutation
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp({
    onSuccess: (data) => {
      setSuccess(true);
      console.log('✅ Email verified:', data.message);
      
      // Wait a moment to show success state
      setTimeout(() => {
        // Redirect to login page
        router.push('/login?verified=true');
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to verify OTP';
      setError(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  // Mount and redirect check
  useEffect(() => {
    setMounted(true);
    
    if (!email) {
      router.push('/signup');
      return;
    }

    // Auto-send OTP only if not already sent by signup page
    const wasSentBySignup = searchParams.get('sent') === 'true';
    if (!hasInitialOtpSent.current && !wasSentBySignup) {
      hasInitialOtpSent.current = true;
      sendOtp({ Email: email });
    }
  }, [email, sendOtp, searchParams]); // ✅ Removed 'router' from dependencies

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  }, []);

  const handleVerify = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    verifyOtp({ Email: email, OTP: otpCode });
  }, [email, otp, verifyOtp]);

  const handleResend = useCallback(() => {
    if (resendCooldown > 0) return;

    setError('');
    // Clear current OTP
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    // Send OTP
    sendOtp({ Email: email });
  }, [email, resendCooldown, sendOtp]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '') && !isVerifying && !success) {
      handleVerify();
    }
  }, [otp, isVerifying, success, handleVerify]);

  if (!mounted) {
    return null;
  }

  return (
    <ModernLoginLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className={`text-xs font-semibold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              EMAIL VERIFICATION
            </span>
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Verify Your Email
          </h1>
          
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            We&apos;ve sent a 6-digit verification code to
          </p>
          <p className={`font-semibold ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {email}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className={`font-semibold ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                Email verified successfully!
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-emerald-300/70' : 'text-emerald-600/70'
              }`}>
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              {error}
            </p>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="flex items-center justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying || success}
                className={`
                  w-14 h-16 text-center text-2xl font-bold rounded-xl
                  border-2 transition-all duration-200
                  ${theme === 'dark'
                    ? 'bg-gray-800 text-white border-gray-700 focus:border-emerald-500'
                    : 'bg-white text-gray-900 border-gray-300 focus:border-emerald-500'
                  }
                  ${digit ? 'border-emerald-500' : ''}
                  ${error ? 'border-red-500' : ''}
                  ${success ? 'border-emerald-500 bg-emerald-500/10' : ''}
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={otp.some(digit => digit === '') || isVerifying || success}
            className={`
              w-full py-3.5 px-6 rounded-xl font-semibold
              transition-all duration-200
              flex items-center justify-center gap-2
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-600/25'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-[1.02] active:scale-[0.98]
            `}
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Verifying...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center space-y-3">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Didn&apos;t receive the code?
          </p>
          
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isSendingOtp || success}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              font-semibold text-sm transition-all duration-200
              ${theme === 'dark'
                ? 'text-emerald-400 hover:bg-emerald-500/10'
                : 'text-emerald-600 hover:bg-emerald-500/10'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isSendingOtp || resendCooldown > 0 ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? (
              <span>Resend in {resendCooldown}s</span>
            ) : isSendingOtp ? (
              <span>Sending...</span>
            ) : (
              <span>Resend Code</span>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className={`text-center text-sm ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <p>Check your spam folder if you don&apos;t see the email.</p>
          <p className="mt-1">The code will expire in 10 minutes.</p>
        </div>
      </div>
    </ModernLoginLayout>
  );
}

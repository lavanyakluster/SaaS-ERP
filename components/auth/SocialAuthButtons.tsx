'use client';

/**
 * SocialAuthButtons Component
 * Google One Tap and Microsoft OAuth login buttons
 */

import { GoogleOneTapButton } from './GoogleOneTapButton';

interface SocialAuthButtonsProps {
  theme?: 'light' | 'dark';
  disabled?: boolean;
  isLoading?: 'google' | 'microsoft' | null;
  onMicrosoftClick: () => void;
  microsoftLoading?: boolean;
  onGoogleSuccess?: (data: any) => void;
  onGoogleError?: (error: any) => void;
}

export function SocialAuthButtons({
  theme = 'light',
  disabled = false,
  isLoading = null,
  onMicrosoftClick,
  microsoftLoading = false,
  onGoogleSuccess,
  onGoogleError,
}: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Google One Tap Button */}
      <div className="flex items-center justify-center">
        <GoogleOneTapButton
          text="continue_with"
          theme={theme === 'dark' ? 'filled_black' : 'outline'}
          size="large"
          shape="rectangular"
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
        />
      </div>

      {/* Microsoft Button - Matching Google's style */}
      <button
        type="button"
        onClick={onMicrosoftClick}
        disabled={disabled || isLoading !== null || microsoftLoading}
        className={`py-2.5 px-4 rounded-lg font-medium border transition-all flex items-center justify-center gap-2.5 min-h-[40px] ${
          theme === 'dark'
            ? 'bg-[#1a1a1a] border-[#8e8e8e] text-white hover:bg-[#292929]'
            : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#d2e3fc]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {(isLoading === 'microsoft' || microsoftLoading) ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21">
              <path fill="#f25022" d="M0 0h10v10H0z"/>
              <path fill="#00a4ef" d="M11 0h10v10H11z"/>
              <path fill="#7fba00" d="M0 11h10v10H0z"/>
              <path fill="#ffb900" d="M11 11h10v10H11z"/>
            </svg>
            <span className="text-sm font-medium">Continue with Microsoft</span>
          </>
        )}
      </button>
    </div>
  );
}
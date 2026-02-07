/**
 * SubmitButton Component
 * Primary submit button with loading state
 */

import { ArrowRight } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  showArrow?: boolean;
}

export function SubmitButton({ 
  isLoading = false, 
  loadingText = 'Loading...',
  children,
  showArrow = true,
  disabled,
  ...buttonProps 
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2 group"
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showArrow && (
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
        </>
      )}
    </button>
  );
}

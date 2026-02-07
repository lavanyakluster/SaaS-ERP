/**
 * Action Button Component
 * Reusable button with variants and states
 */

'use client';

import { memo, ButtonHTMLAttributes, ReactNode } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  children: ReactNode;
  loading?: boolean;
}

export const ActionButton = memo(function ActionButton({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  loading = false,
  disabled,
  className = '',
  ...buttonProps
}: ActionButtonProps) {
  const { isDark } = useThemeStore();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl',
    secondary: isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    ghost: isDark
      ? 'bg-transparent hover:bg-gray-700 text-gray-300'
      : 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  return (
    <button
      {...buttonProps}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
});
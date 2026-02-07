/**
 * Settings Card Component
 * Container card for settings sections
 */

'use client';

import { memo, ReactNode } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const SettingsCard = memo(function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  noPadding = false,
}: SettingsCardProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={`rounded-xl border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } ${className}`}>
      {(title || description) && (
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
});
/**
 * Settings Header Component
 * Header for settings sections
 */

'use client';

import { memo, ReactNode } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';

interface SettingsHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export const SettingsHeader = memo(function SettingsHeader({
  title,
  description,
  actions,
}: SettingsHeaderProps) {
  const { isDark } = useThemeStore();

  return (
    <div className={`border-b px-8 py-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});
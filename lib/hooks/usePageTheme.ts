/**
 * usePageTheme Hook
 * 
 * Centralized hook for accessing theme and gradient information
 * Used across all main application pages for consistent theming
 * 
 * @returns {Object} Theme configuration object
 * @property {string} theme - Current theme ('light' | 'dark')
 * @property {boolean} isDark - Whether dark theme is active
 * @property {Gradient} activeGradient - Current active gradient configuration
 */

import { useMemo } from 'react';
import { useTheme } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';

export function usePageTheme() {
  const theme = useTheme();
  const { activeGradient } = useGradientStore();

  const isDark = useMemo(() => theme === 'dark', [theme]);

  return useMemo(
    () => ({
      theme,
      isDark,
      activeGradient,
    }),
    [theme, isDark, activeGradient]
  );
}

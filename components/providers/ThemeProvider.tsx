'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/lib/store/theme-store';

// 🐛 DEBUG: Track ThemeProvider lifecycle
let themeProviderMountCount = 0;

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme(); // ✅ CORRECT: Destructure from the hook

  // 🐛 DEBUG: Track mount/unmount
  useEffect(() => {
    themeProviderMountCount++;
    console.log(`🟢 ThemeProvider MOUNTED (#${themeProviderMountCount})`);
    
    return () => {
      console.log(`🔴 ThemeProvider UNMOUNTED (#${themeProviderMountCount})`);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // ✅ SAFETY: Validate theme is a string
    const validTheme = typeof theme === 'string' ? theme : 'light';
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class (only if valid)
    if (validTheme === 'light' || validTheme === 'dark') {
      root.classList.add(validTheme);
      console.log(`🎨 ThemeProvider: Applied theme "${validTheme}"`);
    } else {
      console.warn(`⚠️ Invalid theme value:`, theme);
      root.classList.add('light'); // Fallback to light
    }
  }, [theme, mounted]);

  // Prevent flash of unstyled content (FOUC)
  // Show loading state until hydrated
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
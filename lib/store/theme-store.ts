/**
 * Simplified Theme Store for Figma Make
 * Uses basic React patterns instead of Zustand
 */

'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// ============================================================================
// SIMPLE HOOK-BASED STORE
// ============================================================================

// Global state (simple singleton pattern)
let globalTheme: Theme = 'light';
let globalIsDark = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useThemeStore() {
  const [theme, setThemeState] = useState<Theme>(globalTheme);
  const [isDark, setIsDarkState] = useState(globalIsDark);

  useEffect(() => {
    const listener = () => {
      setThemeState(globalTheme);
      setIsDarkState(globalIsDark);
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    globalTheme = newTheme;
    globalIsDark = newTheme === 'dark';
    notifyListeners();
  };

  const toggleTheme = () => {
    const newTheme = globalIsDark ? 'light' : 'dark';
    globalTheme = newTheme;
    globalIsDark = !globalIsDark;
    notifyListeners();
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}

// ============================================================================
// LEGACY EXPORT FOR COMPATIBILITY
// ============================================================================

export function useTheme() {
  return useThemeStore();
}
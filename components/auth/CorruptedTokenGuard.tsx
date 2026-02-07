'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { AlertTriangle } from 'lucide-react';

/**
 * Component to detect and handle corrupted authentication tokens
 * ✅ Only checks sessionStorage (NO localStorage)
 */
export function CorruptedTokenGuard() {
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for corrupted tokens on mount and periodically
    const checkTokens = () => {
      try {
        const accessToken = sessionStorage.getItem('sb_access_token');
        const refreshToken = sessionStorage.getItem('sb_refresh_token');

        // Check if tokens are corrupted (string "[object Object]")
        if (
          (accessToken && accessToken.includes('[object Object]')) ||
          (refreshToken && refreshToken.includes('[object Object]'))
        ) {
          console.error('🚨 CORRUPTED TOKENS DETECTED in sessionStorage!');
          setIsCorrupted(true);
        }
      } catch (error) {
        console.error('Error checking tokens:', error);
      }
    };

    checkTokens();
    
    // Check periodically (every 10 seconds)
    const interval = setInterval(checkTokens, 10000);

    return () => clearInterval(interval);
  }, [mounted]);

  const handleClearAndReload = () => {
    // Clear all auth data (sessionStorage only)
    useAuthStore.getState().reset();
    sessionStorage.clear();

    // Reload to login
    window.location.href = '/login';
  };

  if (!mounted || !isCorrupted) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Authentication Error Detected</p>
            <p className="text-sm text-red-100">
              Your session data is corrupted. Please clear your data and log in again.
            </p>
          </div>
        </div>
        <button
          onClick={handleClearAndReload}
          className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
}
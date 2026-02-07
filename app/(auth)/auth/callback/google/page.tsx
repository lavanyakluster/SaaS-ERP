'use client';

/**
 * Google OAuth Callback Page (Mock)
 * Handles the redirect back from Google OAuth
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { setUser, setStatus } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Handle callback on mount
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Mock Google OAuth callback processing
        console.log('Processing Google OAuth callback');
        
        // Simulate API call
        setTimeout(() => {
          const mockUser = {
            id: 'user123',
            email: 'user@example.com',
            name: 'Demo User',
            role: 'User' as const,
          };

          setUser(mockUser);
          setStatus('authenticated');
          router.push('/dashboard');
        }, 1500);

      } catch (err: any) {
        console.error('Callback processing error:', err);
        setError(err?.message || 'An unexpected error occurred');
      }
    };

    processCallback();
  }, [setUser, setStatus]); // ✅ Removed 'router' from dependencies

  // Handle error - redirect to login
  useEffect(() => {
    if (error) {
      console.error('Google OAuth error:', error);
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        router.push(`/login?error=${encodeURIComponent(error)}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]); // ✅ Removed 'router' from dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {error ? (
            // Error State
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl mb-2 text-gray-900 dark:text-white">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            // Loading State
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-xl mb-2 text-gray-900 dark:text-white">
                Completing Google Sign-In
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your credentials...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * Microsoft OAuth Callback Page
 * Handles the redirect from Microsoft OAuth
 * This page is opened in a popup and immediately closes after capturing the code
 */

'use client';

import { useEffect } from 'react';

export default function MicrosoftCallbackPage() {
  useEffect(() => {
    // This page is opened in a popup
    // The parent window will monitor this URL and extract the code
    // We just need to show a loading state while the parent handles it
    
    // Optional: Close the popup after a short delay if not already closed
    const timer = setTimeout(() => {
      window.close();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Completing Microsoft sign in...</p>
        <p className="text-sm text-gray-500 mt-2">You can close this window</p>
      </div>
    </div>
  );
}

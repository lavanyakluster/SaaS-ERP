/**
 * Logout Handler Utility
 * 
 * Handles logout with proper Next.js routing
 * Prevents stuck loading states during logout
 */

'use client';

import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Perform logout and redirect to login page
 * 
 * This function should be called from client components only
 * It handles all cleanup and redirects using Next.js router
 */
export const performLogout = (reason?: string) => {
  console.log('🚪 Performing logout...', reason ? `Reason: ${reason}` : '');

  // 1. Clear all sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('sb_access_token');
    sessionStorage.removeItem('sb_refresh_token');
    sessionStorage.removeItem('sb_token_expires_in');
    sessionStorage.removeItem('sb_token_expires_at');
    sessionStorage.removeItem('sb_selected_organization');
  }

  // 2. Update auth store
  useAuthStore.getState().logout();

  // 3. Clear auth cookie
  if (typeof window !== 'undefined') {
    document.cookie = 'auth-status=unauthenticated; path=/; max-age=0';
  }

  // 4. Redirect to login using full page reload (most reliable in Next.js)
  if (typeof window !== 'undefined') {
    console.log('🔄 Redirecting to login page...');
    // Use replace instead of href to prevent back button issues
    window.location.replace('/login');
  }
};

/**
 * Logout utility for use in React components
 * Returns a function that can be called to logout
 */
export const useLogout = () => {
  return (reason?: string) => performLogout(reason);
};
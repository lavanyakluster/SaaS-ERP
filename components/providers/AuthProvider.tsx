'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStatus, useAuthStore } from '@/lib/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';

// 🐛 DEBUG: Track AuthProvider lifecycle
let authProviderMountCount = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStatus();
  const tokens = useAuthStore(state => state.tokens); // ✅ CRITICAL: Check tokens too
  const isLoggingOut = useAuthStore(state => state.isLoggingOut); // ✅ CRITICAL: Track logout flag
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const hasRedirected = useRef(false);
  const lastRedirect = useRef<string>('');
  const lastCookieStatus = useRef<string>('');
  const isLoggingOutRef = useRef(false);

  // 🐛 DEBUG: Track mount/unmount
  useEffect(() => {
    authProviderMountCount++;
    console.log(`🟢 AuthProvider MOUNTED (#${authProviderMountCount})`);
    
    return () => {
      console.log(`🔴 AuthProvider UNMOUNTED (#${authProviderMountCount})`);
    };
  }, []);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Main auth logic effect
  useEffect(() => {
    if (!isHydrated) return;

    // ✅ CRITICAL: Reset isLoggingOut flag if we're on login page and status is unauthenticated
    // This ensures the flag doesn't stay stuck after logout completes
    if (pathname === '/login' && status === 'unauthenticated' && isLoggingOut) {
      console.log('✅ AuthProvider: User on login page - resetting isLoggingOut flag');
      useAuthStore.setState({ isLoggingOut: false });
      isLoggingOutRef.current = false;
      return;
    }

    // ✅ CRITICAL: If store isLoggingOut flag is set, don't do ANYTHING
    if (isLoggingOut) {
      console.log('🚫 AuthProvider: isLoggingOut flag is true, blocking all redirects');
      return;
    }

    // If we just logged out, don't do anything until the redirect completes
    if (isLoggingOutRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 AuthProvider: isLoggingOutRef is true, blocking redirects');
      }
      return;
    }

    // ⚡ PERFORMANCE: Only log in development when needed (once per state change)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 AuthProvider effect running:', {
        status,
        pathname,
        hasTokens: !!tokens?.accessToken,
        isLoggingOut,
        isLoggingOutRef: isLoggingOutRef.current,
        lastCookieStatus: lastCookieStatus.current,
        hasRedirected: hasRedirected.current,
        lastRedirect: lastRedirect.current,
      });
    }

    // Sync auth status with cookies for middleware (only once per status change)
    // ✅ CRITICAL: Don't sync cookie during logout or right after logout
    if (
      typeof document !== 'undefined' && 
      status !== lastCookieStatus.current &&
      !isLoggingOut && // Don't sync during logout
      !isLoggingOutRef.current // Don't sync if we just logged out
    ) {
      document.cookie = `auth-status=${status}; path=/; max-age=86400; SameSite=Lax`;
      lastCookieStatus.current = status;
      console.log('🍪 AuthProvider: Synced cookie to', status);
    }

    // Prevent redirect loops - if we just redirected to this path, don't redirect again
    if (lastRedirect.current === pathname) {
      hasRedirected.current = false;
      return;
    }

    // Prevent multiple redirects in quick succession
    if (hasRedirected.current) return;

    // Route definitions
    const authRoutes = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isRootRoute = pathname === '/';
    const isTenantSetup = pathname.startsWith('/tenant-setup');

    // Determine if redirect is needed
    let shouldRedirect = false;
    let redirectPath = '';

    // Always allow authenticated users to access tenant-setup (for adding new organizations)
    if (isTenantSetup) {
      return; // Don't redirect if already on tenant-setup
    }

    // Redirect authenticated users from auth routes to dashboard (but not if already redirecting)
    if (status === 'authenticated' && (isAuthRoute || isRootRoute) && pathname !== '/dashboard') {
      shouldRedirect = true;
      redirectPath = '/dashboard';
    } else if (status === 'pending' && !isTenantSetup && !isAuthRoute && !isRootRoute) {
      shouldRedirect = true;
      redirectPath = '/tenant-setup';
    } else if (status === 'unauthenticated' && !tokens?.accessToken && !isAuthRoute && !isRootRoute && pathname !== '/login') {
      // ✅ CRITICAL FIX: Only redirect to login if BOTH status is unauthenticated AND no tokens exist
      // This prevents race condition where status hasn't updated yet but tokens are already set
      shouldRedirect = true;
      redirectPath = '/login';
    }

    if (shouldRedirect && redirectPath) {
      hasRedirected.current = true;
      lastRedirect.current = redirectPath;
      
      console.log(`🔄 AuthProvider: Redirecting from ${pathname} to ${redirectPath} (status: ${status})`);
      
      router.push(redirectPath);
      
      // Reset after a longer delay to prevent rapid redirects
      setTimeout(() => {
        hasRedirected.current = false;
      }, 500);
    }
  }, [status, tokens, pathname, isHydrated, isLoggingOut, router]); // ✅ Added tokens dependency

  return <>{children}</>;
}
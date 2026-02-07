'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireTenant?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Handles authentication and authorization checks for protected pages
 * 
 * @param requireAuth - If true, user must be authenticated to access
 * @param requireTenant - If true, user must have completed tenant setup
 * @param redirectTo - Custom redirect path (defaults based on auth state)
 * 
 * @example
 * // Protect tenant-setup (requires auth, but NOT tenant)
 * <ProtectedRoute requireAuth={true} requireTenant={false}>
 *   <TenantSetupPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Protect dashboard (requires auth AND tenant)
 * <ProtectedRoute requireAuth={true} requireTenant={true}>
 *   <DashboardPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requireTenant = false,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { tokens, status, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      const hasToken = !!tokens?.accessToken;
      const isAuth = isAuthenticated();

      // If authentication is required but user is not authenticated
      if (requireAuth && !hasToken && !isAuth) {
        console.log('🔒 Protected Route: Not authenticated, redirecting to login');
        router.push(redirectTo || '/login');
        return;
      }

      // If tenant is required but user hasn't set up tenant yet
      if (requireTenant && status !== 'authenticated') {
        console.log('🔒 Protected Route: Organization setup required');
        
        // If status is 'pending', redirect to tenant setup
        if (status === 'pending') {
          router.push('/tenant-setup');
          return;
        }
        
        // Otherwise, redirect to tenant setup
        router.push(redirectTo || '/tenant-setup');
        return;
      }

      // All checks passed
      setIsChecking(false);
    };

    checkAuth();
  }, [tokens, status, requireAuth, requireTenant, redirectTo, isAuthenticated]); // ✅ CRITICAL: Removed 'router' from dependencies to prevent infinite loops

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
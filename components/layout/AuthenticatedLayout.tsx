'use client';

/**
 * Authenticated Layout Component
 * Shared layout for all authenticated routes (main app and settings)
 * Handles authentication, theme, sidebar, and top navigation
 * Performance optimized with React hooks and memoization
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTheme } from '@/lib/store/theme-store';
import TopNavBar from '@/components/layout/TopNavBar';
import Sidebar from '@/components/layout/Sidebar';
import { ROUTES } from '@/lib/constants/app';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { status } = useAuthStore();
  const theme = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if authenticated based on status
  const isAuthenticated = status === 'authenticated';

  // Memoize toggle handler
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth redirect effect
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      console.log('🔍 Not authenticated, redirecting...', { status });
      
      switch (status) {
        case 'unauthenticated':
          // ✅ Use window.location.replace for immediate redirect
          // This prevents stuck loading states and clears pending requests
          console.log('🚪 Redirecting to login (unauthenticated)');
          window.location.replace(ROUTES.login);
          break;
        case 'pending':
          console.log('🚪 Redirecting to tenant setup (pending)');
          window.location.replace(ROUTES.tenantSetup);
          break;
      }
    }
  }, [isAuthenticated, status, mounted]); // ✅ CRITICAL: Removed 'router' from dependencies to prevent infinite loops

  // Memoize layout classes
  const layoutClasses = useMemo(
    () =>
      `h-screen flex flex-col ${
        theme === 'dark'
          ? 'dark bg-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'
      }`,
    [theme]
  );

  const mainClasses = useMemo(
    () =>
      `flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      } overflow-y-auto overflow-x-hidden`,
    [sidebarCollapsed]
  );

  // Show loading while checking auth
  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" 
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className={layoutClasses}>
      <TopNavBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <main className={mainClasses}>
          {children}
        </main>
      </div>
    </div>
  );
}
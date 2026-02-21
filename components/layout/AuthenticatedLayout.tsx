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
  const { status, user } = useAuthStore();
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const isWithinAllowedAccessWindow = useMemo(() => {
    if (!user?.timeRestrictionEnabled) {
      return true;
    }

    const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const offDay = (user.offDay || '').toLowerCase();
    if (offDay && offDay !== 'none' && offDay === dayName) {
      return false;
    }

    const from = user.timeFrom;
    const to = user.timeTo;
    if (!from || !to) {
      return true;
    }

    const [fromHour, fromMinute] = from.split(':').map(Number);
    const [toHour, toMinute] = to.split(':').map(Number);
    if (
      Number.isNaN(fromHour) || Number.isNaN(fromMinute) ||
      Number.isNaN(toHour) || Number.isNaN(toMinute)
    ) {
      return true;
    }

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const fromMinutes = fromHour * 60 + fromMinute;
    const toMinutes = toHour * 60 + toMinute;

    if (fromMinutes <= toMinutes) {
      return nowMinutes >= fromMinutes && nowMinutes <= toMinutes;
    }

    // Overnight window (e.g. 22:00 -> 06:00)
    return nowMinutes >= fromMinutes || nowMinutes <= toMinutes;
  }, [user?.timeRestrictionEnabled, user?.offDay, user?.timeFrom, user?.timeTo, currentTime]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      return;
    }

    if (!isWithinAllowedAccessWindow) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, isWithinAllowedAccessWindow, router]);

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

  if (!isWithinAllowedAccessWindow) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access Restricted</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You cannot access the system at this time.
          </p>
        </div>
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

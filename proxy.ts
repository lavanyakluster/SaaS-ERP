/**
 * Enterprise Middleware
 * 
 * Features:
 * - Route protection
 * - Authentication verification
 * - Automatic redirects
 * - Performance optimized
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/tenant-setup',
  '/forgot-password',
  '/reset-password',
];

/**
 * Auth routes that redirect to dashboard if already authenticated
 * tenant-setup is NOT here because users can add organizations anytime
 */
const authRoutes = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/masters',
  '/transactions',
  '/reports',
  '/admin',
  '/billing',
  '/settings',
];

// ============================================================================
// MIDDLEWARE
// ============================================================================

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth status from cookies (for SSR)
  const authStatus = request.cookies.get('auth-status')?.value;
  const isAuthenticated = authStatus === 'authenticated';
  const isPending = authStatus === 'pending'; // User logged in but no organization

  // ========================================================================
  // PUBLIC ROUTES
  // ========================================================================

  // Allow public routes
  if (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) {
    // If authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If pending (no organization) and trying to access auth pages (except tenant-setup), redirect to tenant-setup
    if (isPending && pathname !== '/tenant-setup' && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/tenant-setup', request.url));
    }

    return NextResponse.next();
  }

  // ========================================================================
  // PROTECTED ROUTES
  // ========================================================================

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Not authenticated at all - redirect to login
    if (!authStatus || authStatus === 'unauthenticated') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Pending state (no organization) - redirect to tenant-setup
    if (isPending) {
      return NextResponse.redirect(new URL('/tenant-setup', request.url));
    }

    // Fully authenticated - allow access
    if (isAuthenticated) {
      return NextResponse.next();
    }

    // Unknown state - redirect to login for safety
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========================================================================
  // DEFAULT
  // ========================================================================

  return NextResponse.next();
}

// ============================================================================
// MIDDLEWARE CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
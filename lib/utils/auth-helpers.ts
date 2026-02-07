/**
 * Enterprise Auth Helper Functions
 * Utility functions for common authentication operations
 */

import { useAuthStore, type User, type Tokens } from '@/lib/store/auth-store';

// ============================================================================
// AUTH STORE HELPERS
// ============================================================================

/**
 * Update auth store after login
 * Sets user and status to 'pending' (needs organization)
 */
export function updateAuthAfterLogin(user: User) {
  const { setUser, setStatus } = useAuthStore.getState();
  
  setUser(user);
  setStatus('pending');
}

/**
 * Update auth store after organization selection/creation
 * Sets status to 'authenticated'
 */
export function updateAuthAfterOrganizationSetup(
  tokens: Tokens,
  organizationId: string
) {
  const { setTokens, setStatus } = useAuthStore.getState();
  
  setTokens(
    tokens.accessToken,
    tokens.refreshToken,
    tokens.expiresIn
  );
  setStatus('authenticated');
}

/**
 * Update auth store with new tokens
 */
export function updateTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number
) {
  const { setTokens } = useAuthStore.getState();
  setTokens(accessToken, refreshToken, expiresIn);
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

/**
 * Set auth status in cookies (for middleware)
 */
export function setAuthStatusCookie(status: 'authenticated' | 'pending' | 'unauthenticated') {
  if (typeof document !== 'undefined') {
    const maxAge = status === 'unauthenticated' ? 0 : 60 * 60 * 24 * 7; // 7 days
    document.cookie = `auth-status=${status}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

/**
 * Get auth status from cookies
 */
export function getAuthStatusFromCookies(): string | null {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/auth-status=([^;]+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Clear auth status cookie
 */
export function clearAuthStatusCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth-status=; path=/; max-age=0; SameSite=Lax';
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

// ============================================================================
// SESSION HELPERS
// ============================================================================

/**
 * Check if user session is active
 */
export function isSessionActive(): boolean {
  const { isAuthenticated } = useAuthStore.getState();
  return isAuthenticated();
}

/**
 * Get current auth step
 */
export function getCurrentAuthStep(): 'login' | 'pending' | 'authenticated' {
  const status = getAuthStatusFromCookies();
  
  switch (status) {
    case 'pending':
      return 'pending';
    case 'authenticated':
      return 'authenticated';
    default:
      return 'login';
  }
}

/**
 * Clear all auth data
 */
export function clearAllAuthData() {
  const { logout } = useAuthStore.getState();
  logout();
  clearAuthStatusCookie();
}

// ============================================================================
// REDIRECT HELPERS
// ============================================================================

/**
 * Get redirect URL after login based on auth status
 */
export function getPostLoginRedirect(isNewUser: boolean): string {
  if (isNewUser) {
    return '/tenant-setup';
  }
  return '/dashboard';
}

/**
 * Get protected route redirect
 */
export function getProtectedRouteRedirect(status: string | null): string | null {
  if (!status || status === 'unauthenticated') {
    return '/login';
  }

  if (status === 'pending') {
    return '/tenant-setup';
  }

  return null; // No redirect needed
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  updateAuthAfterLogin,
  updateAuthAfterOrganizationSetup,
  updateTokens,
  setAuthStatusCookie,
  getAuthStatusFromCookies,
  clearAuthStatusCookie,
  isValidEmail,
  validatePasswordStrength,
  isSessionActive,
  getCurrentAuthStep,
  clearAllAuthData,
  getPostLoginRedirect,
  getProtectedRouteRedirect,
};

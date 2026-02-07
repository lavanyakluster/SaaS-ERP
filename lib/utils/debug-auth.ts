/**
 * Debug utilities for authentication troubleshooting
 */

import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Debug current auth state
 * Use in browser console: window.debugAuth()
 */
export const debugAuth = () => {
  console.group('🔍 AUTH DEBUG INFO');
  
  // 1. Check Zustand store
  const state = useAuthStore.getState();
  console.log('1️⃣ Zustand Store:', {
    status: state.status,
    hasUser: !!state.user,
    hasTokensObject: !!state.tokens,
    tokens: state.tokens,
  });
  
  // 2. Check getAccessToken result
  const accessToken = state.getAccessToken();
  console.log('2️⃣ getAccessToken() result:', {
    hasToken: !!accessToken,
    tokenType: typeof accessToken,
    tokenValue: accessToken ? accessToken.substring(0, 50) + '...' : null,
  });
  
  // 3. Check sessionStorage
  const sessionAccess = sessionStorage.getItem('sb_access_token');
  const sessionRefresh = sessionStorage.getItem('sb_refresh_token');
  console.log('3️⃣ sessionStorage:', {
    hasAccessToken: !!sessionAccess,
    accessTokenType: typeof sessionAccess,
    accessTokenPreview: sessionAccess ? sessionAccess.substring(0, 50) + '...' : null,
    hasRefreshToken: !!sessionRefresh,
  });
  
  // 4. Check localStorage
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('4️⃣ localStorage (auth-storage):', {
        hasState: !!parsed.state,
        tokens: parsed.state?.tokens,
      });
    } catch (e) {
      console.error('4️⃣ Failed to parse localStorage auth-storage:', e);
    }
  } else {
    console.log('4️⃣ localStorage: No auth-storage found');
  }
  
  // 5. Check if token is valid JWT format
  if (accessToken && typeof accessToken === 'string') {
    const parts = accessToken.split('.');
    console.log('5️⃣ Token format:', {
      isValidFormat: parts.length === 3,
      parts: parts.length,
    });
    
    // Try to decode payload
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('6️⃣ Token payload:', {
          sub: payload.sub,
          exp: payload.exp,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          isExpired: Date.now() > payload.exp * 1000,
        });
      } catch (e) {
        console.error('6️⃣ Failed to decode token:', e);
      }
    }
  }
  
  console.groupEnd();
};

/**
 * Clear all auth data and reload
 */
export const clearAuthAndReload = () => {
  console.log('🧹 Clearing all auth data...');
  
  // Clear Zustand
  useAuthStore.getState().reset();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear localStorage auth keys
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('tenantId');
  localStorage.removeItem('organizationName');
  localStorage.removeItem('isNewUser');
  localStorage.removeItem('needsTenantSetup');
  localStorage.removeItem('emailVerified');
  localStorage.removeItem('pendingUserEmail');
  localStorage.removeItem('pendingUserName');
  
  console.log('✅ All auth data cleared. Reloading...');
  window.location.href = '/login';
};

/**
 * Test token setting/getting
 */
export const testTokens = () => {
  console.group('🧪 TOKEN TEST');
  
  const testAccessToken = 'test_access_token_string';
  const testRefreshToken = 'test_refresh_token_string';
  
  console.log('1️⃣ Setting test tokens...');
  useAuthStore.getState().setTokens(testAccessToken, testRefreshToken, 3600);
  
  console.log('2️⃣ Getting tokens back...');
  const retrieved = useAuthStore.getState().getAccessToken();
  
  console.log('3️⃣ Comparison:', {
    original: testAccessToken,
    retrieved: retrieved,
    typesMatch: typeof testAccessToken === typeof retrieved,
    valuesMatch: testAccessToken === retrieved,
  });
  
  console.log('4️⃣ Cleaning up...');
  useAuthStore.getState().clearTokens();
  
  console.groupEnd();
};

// Make available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuthAndReload = clearAuthAndReload;
  (window as any).testTokens = testTokens;
}

/**
 * Token Debug Utility
 * Helper to diagnose token refresh issues
 */

export const debugTokens = () => {
  if (typeof window === 'undefined') {
    console.log('⚠️ Running on server side');
    return;
  }

  console.log('🔍 === TOKEN DEBUG INFORMATION ===');
  
  // Check sessionStorage
  const accessToken = sessionStorage.getItem('sb_access_token');
  const refreshToken = sessionStorage.getItem('sb_refresh_token');
  const expiresAt = sessionStorage.getItem('sb_token_expires_at');
  const expiresIn = sessionStorage.getItem('sb_token_expires_in');
  
  console.log('📦 SessionStorage Tokens:');
  console.log('  - Access Token:', accessToken ? `${accessToken.substring(0, 50)}... (${accessToken.length} chars)` : 'NOT FOUND');
  console.log('  - Refresh Token:', refreshToken ? `${refreshToken.substring(0, 50)}... (${refreshToken.length} chars)` : 'NOT FOUND');
  console.log('  - Expires In:', expiresIn || 'NOT FOUND');
  console.log('  - Expires At:', expiresAt ? new Date(Number(expiresAt)).toISOString() : 'NOT FOUND');
  
  // Check if token is expired
  if (expiresAt) {
    const expiresAtTime = Number(expiresAt);
    const now = Date.now();
    const isExpired = now > expiresAtTime;
    const timeLeft = expiresAtTime - now;
    
    console.log('⏰ Token Expiry:');
    console.log('  - Is Expired:', isExpired);
    console.log('  - Time Left:', isExpired ? 'EXPIRED' : `${Math.floor(timeLeft / 1000)} seconds`);
    console.log('  - Expires At:', new Date(expiresAtTime).toISOString());
    console.log('  - Current Time:', new Date(now).toISOString());
  }
  
  // Check localStorage
  const authStorage = localStorage.getItem('smartbook-auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log('💾 LocalStorage Auth State:');
      console.log('  - Status:', parsed.state?.status);
      console.log('  - isLoggingOut:', parsed.state?.isLoggingOut);
      console.log('  - User:', parsed.state?.user?.email || 'No user');
      console.log('  - Has Tokens:', parsed.state?.tokens ? 'YES' : 'NO');
    } catch (e) {
      console.log('⚠️ Failed to parse auth storage');
    }
  }
  
  // Decode JWT to check expiry
  if (accessToken) {
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔓 JWT Payload:');
        console.log('  - User ID:', payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 'N/A');
        console.log('  - Organization ID:', payload.organizationId || 'N/A');
        console.log('  - Expires (exp):', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A');
        console.log('  - Issued At (iat):', payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A');
        
        if (payload.exp) {
          const jwtExpired = Date.now() > payload.exp * 1000;
          console.log('  - JWT Expired:', jwtExpired);
        }
      }
    } catch (e) {
      console.log('⚠️ Failed to decode JWT');
    }
  }
  
  console.log('🔍 === END TOKEN DEBUG ===');
};

// Auto-run on import in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make it available globally for easy debugging
  (window as any).debugTokens = debugTokens;
  console.log('💡 Token debug utility loaded. Run `debugTokens()` in console to see token info.');
}

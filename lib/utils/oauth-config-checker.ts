/**
 * OAuth Configuration Checker Utility
 * Verifies that OAuth environment variables are properly configured
 */

// ============================================================================
// TYPES
// ============================================================================

interface OAuthProviderConfig {
  name: string;
  clientId: string | undefined;
  redirectUri: string | undefined;
  configured: boolean;
  warnings: string[];
}

interface OAuthConfigStatus {
  google: OAuthProviderConfig;
  microsoft: OAuthProviderConfig;
  allConfigured: boolean;
  hasWarnings: boolean;
}

// ============================================================================
// CONFIGURATION CHECKER
// ============================================================================

/**
 * Check OAuth configuration status
 */
export const checkOAuthConfig = (): OAuthConfigStatus => {
  // Google configuration
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  const googleWarnings: string[] = [];

  if (!googleClientId) {
    googleWarnings.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
  }
  if (!googleRedirectUri) {
    googleWarnings.push('NEXT_PUBLIC_GOOGLE_REDIRECT_URI is not set (will use fallback)');
  }

  // Microsoft configuration
  const microsoftClientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const microsoftRedirectUri = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI;
  const microsoftTenantId = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID;
  const microsoftWarnings: string[] = [];

  if (!microsoftClientId) {
    microsoftWarnings.push('NEXT_PUBLIC_MICROSOFT_CLIENT_ID is not set');
  }
  if (!microsoftRedirectUri) {
    microsoftWarnings.push('NEXT_PUBLIC_MICROSOFT_REDIRECT_URI is not set (will use fallback)');
  }
  if (!microsoftTenantId) {
    microsoftWarnings.push('NEXT_PUBLIC_MICROSOFT_TENANT_ID is not set (will use "common")');
  }

  const google: OAuthProviderConfig = {
    name: 'Google',
    clientId: googleClientId,
    redirectUri: googleRedirectUri,
    configured: !!googleClientId && !!googleRedirectUri,
    warnings: googleWarnings,
  };

  const microsoft: OAuthProviderConfig = {
    name: 'Microsoft',
    clientId: microsoftClientId,
    redirectUri: microsoftRedirectUri,
    configured: !!microsoftClientId && !!microsoftRedirectUri,
    warnings: microsoftWarnings,
  };

  return {
    google,
    microsoft,
    allConfigured: google.configured && microsoft.configured,
    hasWarnings: googleWarnings.length > 0 || microsoftWarnings.length > 0,
  };
};

// ============================================================================
// CONSOLE LOGGER
// ============================================================================

/**
 * Log OAuth configuration to console
 * Only runs in development mode
 */
export const logOAuthConfig = (): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const config = checkOAuthConfig();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 OAuth Configuration Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Google
  console.log(`📱 Google OAuth: ${config.google.configured ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`   Client ID: ${config.google.clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Redirect URI: ${config.google.redirectUri || '⚠️  Using fallback'}`);
  
  if (config.google.warnings.length > 0) {
    console.log('   Warnings:');
    config.google.warnings.forEach(warning => {
      console.log(`   ⚠️  ${warning}`);
    });
  }

  console.log('');

  // Microsoft
  console.log(`🔷 Microsoft OAuth: ${config.microsoft.configured ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`   Client ID: ${config.microsoft.clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Tenant ID: ${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common (default)'}`);
  console.log(`   Redirect URI: ${config.microsoft.redirectUri || '⚠️  Using fallback'}`);

  if (config.microsoft.warnings.length > 0) {
    console.log('   Warnings:');
    config.microsoft.warnings.forEach(warning => {
      console.log(`   ⚠️  ${warning}`);
    });
  }

  console.log('');

  // Summary
  if (config.allConfigured) {
    console.log('✅ All OAuth providers are properly configured!');
  } else {
    console.log('⚠️  Some OAuth providers need configuration.');
    console.log('   Add the missing environment variables to .env.local');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// ============================================================================
// INDIVIDUAL PROVIDER CHECKS
// ============================================================================

/**
 * Check if Google OAuth is configured
 */
export const isGoogleConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );
};

/**
 * Check if Microsoft OAuth is configured
 */
export const isMicrosoftConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID &&
    process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI
  );
};

/**
 * Get current redirect URIs
 */
export const getRedirectUris = () => {
  return {
    google: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 
      (typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback/google` 
        : 'http://localhost:3000/auth/callback/google'),
    microsoft: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || 
      (typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback/microsoft` 
        : 'http://localhost:3000/auth/callback/microsoft'),
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkOAuthConfig,
  logOAuthConfig,
  isGoogleConfigured,
  isMicrosoftConfigured,
  getRedirectUris,
};

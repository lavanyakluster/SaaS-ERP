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

  const microsoft: OAuthProviderConfig = {
    name: 'Microsoft',
    clientId: microsoftClientId,
    redirectUri: microsoftRedirectUri,
    configured: !!microsoftClientId && !!microsoftRedirectUri,
    warnings: microsoftWarnings,
  };

  return {
    microsoft,
    allConfigured: microsoft.configured,
    hasWarnings: microsoftWarnings.length > 0,
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
    console.log('✅ OAuth provider is properly configured!');
  } else {
    console.log('⚠️  OAuth provider needs configuration.');
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
// Google removed

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
  isMicrosoftConfigured,
  getRedirectUris,
};

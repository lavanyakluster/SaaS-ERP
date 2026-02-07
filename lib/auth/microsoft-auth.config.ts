/**
 * Microsoft Azure Entra External ID Configuration
 * MSAL.js configuration for Microsoft OAuth authentication
 * 
 * NOTE: This file requires @azure/msal-browser package
 * To install: npm install @azure/msal-browser
 */

// ============================================================================
// TYPE DEFINITIONS (for when package is not installed)
// ============================================================================

type Configuration = any;
type PopupRequest = any;
type RedirectRequest = any;

// ============================================================================
// ENVIRONMENT VARIABLES (Configure in .env.local)
// ============================================================================

// Add these to your .env.local file:
// NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-client-id-here
// NEXT_PUBLIC_MICROSOFT_TENANT_ID=your-tenant-id-here  (or 'common' for multi-tenant)
// NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/callback/microsoft

const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_TENANT_ID = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common';
const MICROSOFT_REDIRECT_URI = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || 
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback/microsoft` : '');

// ============================================================================
// MSAL CONFIGURATION
// ============================================================================

/**
 * MSAL Configuration for Azure Entra External ID
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
    redirectUri: MICROSOFT_REDIRECT_URI,
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for security
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge
  },
  system: {
    loggerOptions: {
      logLevel: process.env.NODE_ENV === 'development' ? 3 : 0, // Verbose in dev, Error in prod
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        
        // Ignore user cancellation errors (when user closes popup)
        if (message.includes('user_cancelled') || message.includes('window closed')) {
          return;
        }
        
        switch (level) {
          case 0: // Error
            console.error(message);
            return;
          case 1: // Warning
            console.warn(message);
            return;
          case 2: // Info
            console.info(message);
            return;
          case 3: // Verbose
            console.debug(message);
            return;
        }
      },
      piiLoggingEnabled: false,
    },
  },
};

// ============================================================================
// LOGIN REQUEST SCOPES
// ============================================================================

/**
 * Scopes for login request
 * These scopes will be used to request an access token
 */
export const loginRequest: PopupRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    'User.Read', // Microsoft Graph API - read user profile
  ],
  prompt: 'select_account', // Always show account picker
};

/**
 * Scopes for silent token acquisition
 */
export const silentRequest: RedirectRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
  ],
};

// ============================================================================
// GRAPH API CONFIGURATION
// ============================================================================

/**
 * Microsoft Graph API endpoint for user profile
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphProfilePhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates if Microsoft Auth is properly configured
 */
export const isMicrosoftAuthConfigured = (): boolean => {
  if (!MICROSOFT_CLIENT_ID) {
    console.error('Microsoft Client ID is not configured. Please set NEXT_PUBLIC_MICROSOFT_CLIENT_ID in .env.local');
    return false;
  }
  return true;
};

/**
 * Get configuration status message
 */
export const getMicrosoftConfigStatus = (): { configured: boolean; message: string } => {
  if (!MICROSOFT_CLIENT_ID) {
    return {
      configured: false,
      message: 'Microsoft authentication is not configured. Please add NEXT_PUBLIC_MICROSOFT_CLIENT_ID to your .env.local file.',
    };
  }
  
  return {
    configured: true,
    message: 'Microsoft authentication is configured and ready.',
  };
};
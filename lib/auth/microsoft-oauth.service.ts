/**
 * Microsoft OAuth 2.0 Service
 * Implements Microsoft authentication using OAuth 2.0 with popup flow
 * No external packages required - uses native browser APIs
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_TENANT_ID = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common';

// Microsoft OAuth endpoints
const MICROSOFT_AUTH_ENDPOINT = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`;
const MICROSOFT_TOKEN_ENDPOINT = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

// Scopes for Microsoft login
const SCOPES = [
  'openid',
  'profile',
  'email',
  'User.Read',
].join(' ');

// ============================================================================
// TYPES
// ============================================================================

export interface MicrosoftAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  error?: string;
}

export interface MicrosoftTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random string for state parameter
 */
const generateRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate code verifier for PKCE
 */
const generateCodeVerifier = (): string => {
  return generateRandomString(64);
};

/**
 * Generate code challenge from verifier for PKCE
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Build authorization URL
 */
const buildAuthUrl = async (): Promise<{ url: string; state: string; codeVerifier: string }> => {
  const state = generateRandomString();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback/microsoft`
    : '';

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    response_mode: 'query',
    prompt: 'select_account',
  });

  return {
    url: `${MICROSOFT_AUTH_ENDPOINT}?${params.toString()}`,
    state,
    codeVerifier,
  };
};

/**
 * Open OAuth popup window
 */
const openOAuthPopup = (url: string): Window | null => {
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  return window.open(
    url,
    'Microsoft Login',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
  );
};

/**
 * Monitor popup for redirect
 */
const monitorPopup = (popup: Window, expectedState: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      try {
        // Check if popup is closed
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error('Login cancelled by user'));
          return;
        }

        // Try to read popup URL (will throw if cross-origin)
        const popupUrl = popup.location.href;

        // Check if we're back on our domain
        if (popupUrl.includes(window.location.origin)) {
          const url = new URL(popupUrl);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');

          if (error) {
            clearInterval(interval);
            popup.close();
            reject(new Error(errorDescription || error));
            return;
          }

          if (code && state) {
            // Verify state matches
            if (state !== expectedState) {
              clearInterval(interval);
              popup.close();
              reject(new Error('State mismatch - possible CSRF attack'));
              return;
            }

            clearInterval(interval);
            popup.close();
            resolve(code);
          }
        }
      } catch (e) {
        // Cross-origin errors are expected, ignore them
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Login timeout'));
    }, 5 * 60 * 1000);
  });
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string
): Promise<MicrosoftTokenResponse> => {
  const redirectUri = `${window.location.origin}/auth/callback/microsoft`;

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(MICROSOFT_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Token exchange failed' }));
    throw new Error(error.error_description || error.error || 'Failed to exchange code for tokens');
  }

  return await response.json();
};

// ============================================================================
// MAIN AUTHENTICATION FUNCTION
// ============================================================================

/**
 * Sign in with Microsoft using OAuth 2.0 popup flow
 */
export const signInWithMicrosoftPopup = async (): Promise<MicrosoftAuthResult> => {
  try {
    // Validate configuration
    if (!MICROSOFT_CLIENT_ID) {
      console.error('Microsoft Client ID is not configured');
      return {
        success: false,
        error: 'Microsoft authentication is not configured. Please contact support.',
      };
    }

    // Build authorization URL with PKCE
    const { url, state, codeVerifier } = await buildAuthUrl();

    // Open popup
    const popup = openOAuthPopup(url);
    if (!popup) {
      return {
        success: false,
        error: 'Failed to open login popup. Please allow popups and try again.',
      };
    }

    // Monitor popup and wait for authorization code
    const code = await monitorPopup(popup, state);

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    return {
      success: true,
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
    };
  } catch (error: any) {
    console.error('Microsoft OAuth error:', error);

    // Handle user cancellation
    if (error.message === 'Login cancelled by user') {
      return {
        success: false,
        error: 'Login cancelled by user',
      };
    }

    return {
      success: false,
      error: error.message || 'Microsoft login failed',
    };
  }
};

/**
 * Check if Microsoft auth is configured
 */
export const isMicrosoftAuthConfigured = (): boolean => {
  return !!MICROSOFT_CLIENT_ID;
};

/**
 * Get configuration status
 */
export const getMicrosoftConfigStatus = (): { configured: boolean; message: string } => {
  if (!MICROSOFT_CLIENT_ID) {
    return {
      configured: false,
      message: 'Microsoft authentication is not configured. Please add NEXT_PUBLIC_MICROSOFT_CLIENT_ID to your environment variables.',
    };
  }

  return {
    configured: true,
    message: 'Microsoft authentication is configured and ready.',
  };
};

/**
 * Google One Tap Service
 * Handles Google One Tap sign-in integration
 */

import { googleOneTapConfig, isGoogleOneTapConfigured } from './google-one-tap.config';

// ============================================================================
// TYPES
// ============================================================================

export interface GoogleCredentialResponse {
  credential: string; // JWT ID token
  select_by?: string;
  clientId?: string;
}

export interface GoogleOneTapCallbacks {
  onSuccess: (response: GoogleCredentialResponse) => void;
  onError?: (error: any) => void;
}

export interface GoogleUserInfo {
  sub: string; // Google user ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}

// ============================================================================
// GOOGLE ONE TAP INITIALIZATION
// ============================================================================

/**
 * Load Google One Tap script
 */
export const loadGoogleOneTapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google One Tap script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google One Tap script'));
    document.head.appendChild(script);
  });
};

/**
 * Initialize Google One Tap
 */
export const initializeGoogleOneTap = async (callbacks: GoogleOneTapCallbacks): Promise<void> => {
  if (!isGoogleOneTapConfigured()) {
    // Silently skip initialization if not configured
    return;
  }

  try {
    // Load the Google One Tap script
    await loadGoogleOneTapScript();

    // Initialize Google One Tap
    window.google.accounts.id.initialize({
      ...googleOneTapConfig,
      callback: (response: GoogleCredentialResponse) => {
        try {
          callbacks.onSuccess(response);
        } catch (error) {
          console.error('Error in Google One Tap callback:', error);
          callbacks.onError?.(error);
        }
      },
    });

    console.log('✅ Google One Tap initialized');
  } catch (error) {
    console.error('Failed to initialize Google One Tap:', error);
    callbacks.onError?.(error);
  }
};

/**
 * Show Google One Tap prompt
 */
export const showGoogleOneTapPrompt = (): void => {
  if (!window.google?.accounts?.id) {
    console.error('Google One Tap is not initialized');
    return;
  }

  try {
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Google One Tap prompt not displayed:', notification.getNotDisplayedReason());
      }
    });
  } catch (error) {
    console.error('Failed to show Google One Tap prompt:', error);
  }
};

/**
 * Cancel Google One Tap prompt
 */
export const cancelGoogleOneTap = (): void => {
  if (!window.google?.accounts?.id) {
    return;
  }

  try {
    // Silently cancel - this prevents the AbortError in console
    window.google.accounts.id.cancel();
  } catch (error) {
    // Ignore cancel errors as they're expected during cleanup
    // Don't log to avoid cluttering console
  }
};

/**
 * Render Google Sign-In button
 */
export const renderGoogleButton = (
  element: HTMLElement,
  callbacks: GoogleOneTapCallbacks,
  customConfig?: any
): void => {
  if (!window.google?.accounts?.id) {
    console.error('Google One Tap is not initialized');
    return;
  }

  try {
    window.google.accounts.id.renderButton(
      element,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: element.offsetWidth || 250,
        ...customConfig,
      }
    );
  } catch (error) {
    console.error('Failed to render Google button:', error);
    callbacks.onError?.(error);
  }
};

// ============================================================================
// TOKEN DECODING
// ============================================================================

/**
 * Decode Google ID token (JWT)
 * Returns the user information from the token
 */
export const decodeGoogleCredential = (credential: string): GoogleUserInfo | null => {
  try {
    // JWT format: header.payload.signature
    const payload = credential.split('.')[1];
    
    // Decode base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const userInfo: GoogleUserInfo = JSON.parse(jsonPayload);
    return userInfo;
  } catch (error) {
    console.error('Failed to decode Google credential:', error);
    return null;
  }
};

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Sign out from Google
 */
export const signOutGoogleOneTap = (): void => {
  if (!window.google?.accounts?.id) {
    return;
  }

  try {
    window.google.accounts.id.disableAutoSelect();
  } catch (error) {
    console.error('Failed to sign out from Google One Tap:', error);
  }
};

/**
 * Disable auto-select for future sessions
 */
export const disableAutoSelect = (): void => {
  if (!window.google?.accounts?.id) {
    return;
  }

  try {
    window.google.accounts.id.disableAutoSelect();
  } catch (error) {
    console.error('Failed to disable auto-select:', error);
  }
};

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
          revoke: (hint: string, callback: (response: any) => void) => void;
        };
      };
    };
  }
}
/**
 * Google One Tap Configuration
 * Configuration for Google One Tap sign-in integration
 */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// ============================================================================
// GOOGLE ONE TAP CONFIGURATION
// ============================================================================

export interface GoogleOneTapConfig {
  client_id: string;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
}

/**
 * Default Google One Tap Configuration
 */
export const googleOneTapConfig: GoogleOneTapConfig = {
  client_id: GOOGLE_CLIENT_ID,
  auto_select: false, // Don't auto-select on every page load
  cancel_on_tap_outside: true, // Close prompt when tapping outside
  context: 'signin', // Can be 'signin', 'signup', or 'use'
  itp_support: true, // Enable ITP (Intelligent Tracking Prevention) support
  ux_mode: 'popup', // Use popup mode instead of redirect
};

/**
 * Google One Tap Button Configuration
 */
export interface GoogleButtonConfig {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export const googleButtonConfig: GoogleButtonConfig = {
  type: 'standard',
  theme: 'outline',
  size: 'large',
  text: 'signin_with',
  shape: 'rectangular',
  logo_alignment: 'left',
  width: 250,
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if Google One Tap is configured
 */
export const isGoogleOneTapConfigured = (): boolean => {
  if (!GOOGLE_CLIENT_ID) {
    // Silently return false - don't log error to avoid console noise
    return false;
  }
  
  // Basic validation - check if it looks like a valid client ID
  if (!GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    console.warn('⚠️ Google Client ID format appears invalid. Expected format: xxx.apps.googleusercontent.com');
    return false;
  }
  
  return true;
};

/**
 * Get Google Client ID
 */
export const getGoogleClientId = (): string => {
  return GOOGLE_CLIENT_ID;
};

/**
 * Get configuration status
 */
export const getGoogleOneTapStatus = (): { configured: boolean; message: string } => {
  if (!GOOGLE_CLIENT_ID) {
    return {
      configured: false,
      message: 'Google One Tap is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.',
    };
  }
  
  return {
    configured: true,
    message: 'Google One Tap is configured and ready.',
  };
};
/**
 * Microsoft Azure Entra External ID Service
 * Handles Microsoft OAuth authentication flow
 * 
 * NOTE: This file requires @azure/msal-browser package
 * To install: npm install @azure/msal-browser
 */

// ============================================================================
// TYPE DEFINITIONS (for when package is not installed)
// ============================================================================

type PublicClientApplication = any;
type AccountInfo = any;
type AuthenticationResult = any;

import { msalConfig, loginRequest, isMicrosoftAuthConfigured } from './microsoft-auth.config';

// ============================================================================
// TYPES
// ============================================================================

export interface MicrosoftAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  account?: AccountInfo;
  error?: string;
}

export interface MicrosoftUserProfile {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
}

// ============================================================================
// MSAL INSTANCE (Singleton)
// ============================================================================

let msalInstance: PublicClientApplication | null = null;

/**
 * Get or create MSAL instance
 */
const getMsalInstance = async (): Promise<PublicClientApplication> => {
  if (!isMicrosoftAuthConfigured()) {
    throw new Error('Microsoft authentication is not configured');
  }

  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }

  return msalInstance;
};

// ============================================================================
// AUTHENTICATION METHODS
// ============================================================================

/**
 * Sign in with Microsoft using popup
 * Returns the ID token to be sent to your backend
 */
export const signInWithMicrosoftPopup = async (): Promise<MicrosoftAuthResult> => {
  try {
    const msal = await getMsalInstance();
    
    // Use popup for authentication
    const response: AuthenticationResult = await msal.loginPopup(loginRequest);
    
    if (!response || !response.idToken) {
      return {
        success: false,
        error: 'Failed to obtain ID token from Microsoft',
      };
    }

    return {
      success: true,
      idToken: response.idToken,
      accessToken: response.accessToken,
      account: response.account,
    };
  } catch (error: any) {
    console.error('Microsoft popup login error:', error);
    
    // Handle user cancellation
    if (error?.errorCode === 'user_cancelled' || error?.message?.includes('user_cancelled')) {
      return {
        success: false,
        error: 'Login cancelled by user',
      };
    }
    
    return {
      success: false,
      error: error?.message || 'Microsoft login failed',
    };
  }
};

/**
 * Sign in with Microsoft using redirect
 * Call this to initiate the redirect flow
 */
export const signInWithMicrosoftRedirect = async (): Promise<void> => {
  try {
    const msal = await getMsalInstance();
    await msal.loginRedirect(loginRequest);
  } catch (error: any) {
    console.error('Microsoft redirect login error:', error);
    throw new Error(error?.message || 'Microsoft login redirect failed');
  }
};

/**
 * Handle redirect response after user is redirected back
 * Call this on the redirect callback page
 */
export const handleMicrosoftRedirectResponse = async (): Promise<MicrosoftAuthResult> => {
  try {
    const msal = await getMsalInstance();
    const response = await msal.handleRedirectPromise();
    
    if (!response) {
      return {
        success: false,
        error: 'No redirect response received',
      };
    }

    if (!response.idToken) {
      return {
        success: false,
        error: 'Failed to obtain ID token from Microsoft',
      };
    }

    return {
      success: true,
      idToken: response.idToken,
      accessToken: response.accessToken,
      account: response.account,
    };
  } catch (error: any) {
    console.error('Microsoft redirect handler error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to handle Microsoft redirect',
    };
  }
};

/**
 * Get currently signed in account
 */
export const getCurrentMicrosoftAccount = async (): Promise<AccountInfo | null> => {
  try {
    const msal = await getMsalInstance();
    const accounts = msal.getAllAccounts();
    
    if (accounts.length === 0) {
      return null;
    }
    
    // Return the first account (or implement logic to select correct account)
    return accounts[0];
  } catch (error) {
    console.error('Error getting current Microsoft account:', error);
    return null;
  }
};

/**
 * Sign out from Microsoft
 */
export const signOutMicrosoft = async (): Promise<void> => {
  try {
    const msal = await getMsalInstance();
    const account = await getCurrentMicrosoftAccount();
    
    if (account) {
      await msal.logoutPopup({
        account,
        postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
      });
    }
  } catch (error) {
    console.error('Microsoft sign out error:', error);
    throw error;
  }
};

/**
 * Acquire token silently (for refreshing tokens)
 */
export const acquireMicrosoftTokenSilently = async (): Promise<string | null> => {
  try {
    const msal = await getMsalInstance();
    const account = await getCurrentMicrosoftAccount();
    
    if (!account) {
      return null;
    }

    const response = await msal.acquireTokenSilent({
      ...loginRequest,
      account,
    });

    return response.idToken;
  } catch (error) {
    console.error('Silent token acquisition failed:', error);
    return null;
  }
};

// ============================================================================
// HELPER METHODS
// ============================================================================

/**
 * Extract user profile from Microsoft account
 */
export const extractMicrosoftUserProfile = (account: AccountInfo): MicrosoftUserProfile => {
  return {
    id: account.localAccountId,
    email: account.username, // This is typically the email
    name: account.name || account.username,
    givenName: account.idTokenClaims?.given_name as string | undefined,
    surname: account.idTokenClaims?.family_name as string | undefined,
    userPrincipalName: account.username,
  };
};

/**
 * Check if user is currently signed in with Microsoft
 */
export const isMicrosoftSignedIn = async (): Promise<boolean> => {
  const account = await getCurrentMicrosoftAccount();
  return account !== null;
};
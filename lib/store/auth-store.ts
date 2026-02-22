/**
 * Enterprise Authentication Store
 * 
 * Features:
 * - Selective state subscriptions for performance
 * - Token management with auto-refresh
 * - Multi-organization support
 * - Type-safe selectors
 * - Optimistic updates
 * - SECURITY: NO localStorage - uses sessionStorage for tokens only
 */

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type AuthStatus =
  | 'unauthenticated'
  | 'pending' // New user who logged in but hasn't completed tenant setup
  | 'authenticated';

export interface User {
  id: string;
  userId?: string; // User ID from backend (GUID or numeric string)
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  additionalPermissions?: string[];
  branches?: string[];
  backDaysLimit?: number;
  timeRestrictionEnabled?: boolean;
  timeFrom?: string;
  timeTo?: string;
  offDay?: string;
}

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string; // ✅ ADDED: Refresh token for token renewal
  expiresIn?: number;
  expiresAt?: number; // Calculated expiry timestamp
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface AuthState {
  // Core State
  status: AuthStatus;
  user: User | null;
  tokens: Tokens | null; // NOT persisted - only in memory + sessionStorage
  organizations: Organization[];
  selectedOrganization: Organization | null;
  selectedYear: string | null;
  selectedBranch: string | null;
  organizationApiUrl: string | null; // ✅ Organization-specific API URL from switch-org

  // Metadata
  lastActivity: number;
  isRefreshing: boolean;
  isLoggingOut: boolean; // ✅ CRITICAL: Flag to prevent API calls during logout
  isSwitchingOrganization: boolean; // ✅ CRITICAL: Flag to prevent API calls during org switch
  shouldShowOrgSwitcher: boolean; // ✅ Flag to show org switcher after login
}

interface AuthActions {
  // Status Actions
  setStatus: (status: AuthStatus) => void;

  // User Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  // Token Actions
  setTokens: (accessToken: string, refreshToken: string, expiresIn?: number) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
  setRefreshing: (isRefreshing: boolean) => void;
  setSwitchingOrganization: (isSwitching: boolean) => void; // ✅ Set organization switching flag

  // Organization Actions
  setOrganizations: (organizations: Organization[]) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
  setSelectedYear: (year: string | null) => void;
  setSelectedBranch: (branch: string | null) => void;
  addOrganization: (organization: Organization) => void;
  removeOrganization: (id: string) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  setShouldShowOrgSwitcher: (shouldShow: boolean) => void; // ✅ Toggle org switcher modal
  setOrganizationApiUrl: (apiUrl: string | null) => void; // ✅ Set organization-specific API URL

  // Session Actions
  updateActivity: () => void;
  logout: () => void;
  reset: () => void;

  // Helpers
  isAuthenticated: () => boolean;
  getUserId: () => string | null;
  hasPermission: (permission: string) => boolean;
}

type AuthStore = AuthState & AuthActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  status: 'unauthenticated',
  user: null,
  tokens: null,
  organizations: [],
  selectedOrganization: null,
  selectedYear: null, // Will be set from organization data or user preference
  selectedBranch: null, // Will be set from branches API or user preference
  organizationApiUrl: null, // ✅ Organization-specific API URL from switch-org
  lastActivity: Date.now(),
  isRefreshing: false,
  isLoggingOut: false, // ✅ CRITICAL: Flag to prevent API calls during logout
  isSwitchingOrganization: false, // ✅ CRITICAL: Flag to prevent API calls during org switch
  shouldShowOrgSwitcher: false, // ✅ Flag to show org switcher after login
};

// ============================================================================
// TOKEN STORAGE (sessionStorage)
// ============================================================================

const TOKEN_KEYS = {
  ACCESS: 'sb_access_token',
  REFRESH: 'sb_refresh_token',
  EXPIRES_IN: 'sb_token_expires_in',
  EXPIRES_AT: 'sb_token_expires_at',
  USER: 'sb_user',
  SELECTED_ORG: 'sb_selected_organization', // ✅ Persist selected org
  ORG_API_URL: 'sb_organization_api_url', // ✅ NEW: Persist org-specific API URL
} as const;

/**
 * Save tokens to sessionStorage
 */
const saveTokensToSession = (tokens: Tokens) => {
  if (typeof window === 'undefined') return;

  try {
    console.log('💾 Saving tokens to sessionStorage...', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      expiresAt: tokens.expiresAt,
    });
    
    sessionStorage.setItem(TOKEN_KEYS.ACCESS, tokens.accessToken);
    sessionStorage.setItem(TOKEN_KEYS.REFRESH, tokens.refreshToken);
    if (tokens.expiresIn) {
      sessionStorage.setItem(TOKEN_KEYS.EXPIRES_IN, tokens.expiresIn.toString());
    }
    if (tokens.expiresAt) {
      sessionStorage.setItem(TOKEN_KEYS.EXPIRES_AT, tokens.expiresAt.toString());
    }
    
    console.log('✅ Tokens saved to sessionStorage successfully');
  } catch (error) {
    console.error('❌ Failed to save tokens to sessionStorage:', error);
  }
};

/**
 * Load tokens from sessionStorage
 */
const loadTokensFromSession = (): Tokens | null => {
  if (typeof window === 'undefined') return null;

  try {
    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS);
    const refreshToken = sessionStorage.getItem(TOKEN_KEYS.REFRESH);
    const expiresIn = sessionStorage.getItem(TOKEN_KEYS.EXPIRES_IN);
    const expiresAt = sessionStorage.getItem(TOKEN_KEYS.EXPIRES_AT);

    if (accessToken && refreshToken) {
      return {
        accessToken,
        refreshToken,
        expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
        expiresAt: expiresAt ? parseInt(expiresAt, 10) : undefined,
      };
    }
  } catch (error) {
    console.error('Failed to load tokens from sessionStorage:', error);
  }

  return null;
};

/**
 * Clear tokens from sessionStorage
 */
const clearTokensFromSession = () => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(TOKEN_KEYS.ACCESS);
    sessionStorage.removeItem(TOKEN_KEYS.REFRESH);
    sessionStorage.removeItem(TOKEN_KEYS.EXPIRES_IN);
    sessionStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
    sessionStorage.removeItem(TOKEN_KEYS.USER);
    sessionStorage.removeItem(TOKEN_KEYS.SELECTED_ORG); // ✅ NEW: Clear selected org
    sessionStorage.removeItem(TOKEN_KEYS.ORG_API_URL); // ✅ NEW: Clear org-specific API URL
  } catch (error) {
    console.error('Failed to clear tokens from sessionStorage:', error);
  }
};

/**
 * Save selected organization to sessionStorage
 */
const saveSelectedOrgToSession = (organization: Organization | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (organization) {
      sessionStorage.setItem(TOKEN_KEYS.SELECTED_ORG, JSON.stringify(organization));
      console.log('💾 Saved selected organization to session:', organization.displayName);
    } else {
      sessionStorage.removeItem(TOKEN_KEYS.SELECTED_ORG);
    }
  } catch (error) {
    console.error('Failed to save selected organization to sessionStorage:', error);
  }
};

/**
 * Load selected organization from sessionStorage
 */
const loadSelectedOrgFromSession = (): Organization | null => {
  if (typeof window === 'undefined') return null;

  try {
    const orgJson = sessionStorage.getItem(TOKEN_KEYS.SELECTED_ORG);
    if (orgJson) {
      const organization = JSON.parse(orgJson) as Organization;
      console.log('📂 Loaded selected organization from session:', organization.displayName);
      return organization;
    }
  } catch (error) {
    console.error('Failed to load selected organization from sessionStorage:', error);
  }

  return null;
};

/**
 * Save organization-specific API URL to sessionStorage
 */
const saveOrgApiUrlToSession = (apiUrl: string | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (apiUrl) {
      sessionStorage.setItem(TOKEN_KEYS.ORG_API_URL, apiUrl);
      console.log('💾 Saved organization-specific API URL to session:', apiUrl);
    } else {
      sessionStorage.removeItem(TOKEN_KEYS.ORG_API_URL);
    }
  } catch (error) {
    console.error('Failed to save organization-specific API URL to sessionStorage:', error);
  }
};

/**
 * Load organization-specific API URL from sessionStorage
 */
const loadOrgApiUrlFromSession = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const apiUrl = sessionStorage.getItem(TOKEN_KEYS.ORG_API_URL);
    if (apiUrl) {
      console.log('📂 Loaded organization-specific API URL from session:', apiUrl);
      return apiUrl;
    }
  } catch (error) {
    console.error('Failed to load organization-specific API URL from sessionStorage:', error);
  }

  return null;
};

/**
 * Save user profile (including permissions) to sessionStorage
 */
const saveUserToSession = (user: User | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      sessionStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(TOKEN_KEYS.USER);
    }
  } catch (error) {
    console.error('Failed to save user to sessionStorage:', error);
  }
};

/**
 * Load user profile (including permissions) from sessionStorage
 */
const loadUserFromSession = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(TOKEN_KEYS.USER);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<User>;
    if (!parsed || typeof parsed !== 'object') return null;
    const resolvedId =
      typeof parsed.id === 'string' && parsed.id.trim()
        ? parsed.id.trim()
        : typeof parsed.userId === 'string' && parsed.userId.trim()
          ? parsed.userId.trim()
          : null;
    if (!resolvedId) return null;

    return {
      id: resolvedId,
      userId: typeof parsed.userId === 'string' && parsed.userId.trim() ? parsed.userId : resolvedId,
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
      role: typeof parsed.role === 'string' ? parsed.role : 'user',
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      additionalPermissions: Array.isArray(parsed.additionalPermissions) ? parsed.additionalPermissions : [],
      branches: Array.isArray(parsed.branches) ? parsed.branches : [],
      backDaysLimit: typeof parsed.backDaysLimit === 'number' ? parsed.backDaysLimit : undefined,
      timeRestrictionEnabled: typeof parsed.timeRestrictionEnabled === 'boolean' ? parsed.timeRestrictionEnabled : undefined,
      timeFrom: typeof parsed.timeFrom === 'string' ? parsed.timeFrom : undefined,
      timeTo: typeof parsed.timeTo === 'string' ? parsed.timeTo : undefined,
      offDay: typeof parsed.offDay === 'string' ? parsed.offDay : undefined,
    };
  } catch (error) {
    console.error('Failed to load user from sessionStorage:', error);
    return null;
  }
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

// ============================================================================
// STORE
// ============================================================================

export const useAuthStore = createWithEqualityFn<AuthStore>()(
  (set, get) => ({
    // State
    ...initialState,

    // Status Actions
    setStatus: (status) => {
      set({ status });
      get().updateActivity();
      
      // ✅ Update cookie for SSR
      if (typeof window !== 'undefined') {
        document.cookie = `auth-status=${status}; path=/; max-age=86400; SameSite=Strict`;
      }
    },

    // User Actions
    setUser: (user) => {
      set({ user });
      saveUserToSession(user);
      get().updateActivity();
    },

    updateUser: (updates) => {
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        set({ user: updatedUser });
        saveUserToSession(updatedUser);
        get().updateActivity();
      }
    },

    // Token Actions
    setTokens: (accessToken, refreshToken, expiresIn) => {
      console.log('🔑 setTokens called with:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        expiresIn,
        expiresInType: typeof expiresIn,
        callStack: new Error().stack?.split('\n').slice(1, 4).join('\n'),
      });

      // CRITICAL: Ensure tokens are strings, not objects
      const accessTokenStr = typeof accessToken === 'string' ? accessToken : String(accessToken);
      const refreshTokenStr = typeof refreshToken === 'string' ? refreshToken : String(refreshToken);
      
      // Validate that we're not getting "[object Object]"
      if (accessTokenStr === '[object Object]') {
        console.error('❌ CRITICAL ERROR: Received object instead of token string!', {
          accessToken,
          accessTokenType: typeof accessToken,
        });
        throw new Error('Invalid token format: received object instead of string');
      }
      
      // Validate JWT format for access token (should have 3 parts separated by dots)
      const accessParts = accessTokenStr.split('.');
      
      if (accessParts.length !== 3) {
        console.error('❌ Invalid access token format:', {
          token: accessTokenStr.substring(0, 50) + '...',
          parts: accessParts.length,
        });
        throw new Error('Invalid access token format: not a valid JWT');
      }
      
      const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;
      const tokens: Tokens = {
        accessToken: accessTokenStr,
        refreshToken: refreshTokenStr,
        expiresIn,
        expiresAt,
      };

      console.log('✅ Tokens object created:', {
        expiresIn: tokens.expiresIn,
        expiresInMinutes: tokens.expiresIn ? Math.floor(tokens.expiresIn / 60) : null,
        expiresAt: tokens.expiresAt,
        expiresAtISO: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
        timeUntilExpiry: tokens.expiresAt ? `${Math.floor((tokens.expiresAt - Date.now()) / 1000)}s` : null,
      });

      // ✅ CRITICAL: Reset isLoggingOut flag when setting new tokens (during login)
      set({ tokens, isLoggingOut: false });
      saveTokensToSession(tokens);
      get().updateActivity();

      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Tokens updated:', {
          accessTokenPreview: accessTokenStr.substring(0, 50) + '...',
          refreshTokenPreview: refreshTokenStr.substring(0, 50) + '...',
          expiresIn,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          isLoggingOut: false, // ✅ Reset
        });
      }
    },

    clearTokens: () => {
      set({ tokens: null });
      clearTokensFromSession();
    },

    getAccessToken: () => {
      // Try memory first
      const memoryToken = get().tokens?.accessToken;
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 getAccessToken() called');
        console.log('🔍 tokens object:', get().tokens);
        console.log('🔍 memoryToken type:', typeof memoryToken);
        console.log('🔍 memoryToken value:', memoryToken);
      }
      
      if (memoryToken) {
        // Ensure it's a string
        if (typeof memoryToken !== 'string') {
          console.error('❌ ERROR: accessToken is not a string!', {
            type: typeof memoryToken,
            value: memoryToken,
          });
          return null;
        }
        return memoryToken;
      }

      // Fallback to sessionStorage
      const sessionTokens = loadTokensFromSession();
      if (sessionTokens) {
        set({ tokens: sessionTokens }); // Restore to memory
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Loaded from session:', {
            tokenType: typeof sessionTokens.accessToken,
            tokenPreview: sessionTokens.accessToken?.substring(0, 50) + '...',
          });
        }
        
        // Ensure it's a string
        if (typeof sessionTokens.accessToken !== 'string') {
          console.error('❌ ERROR: sessionStorage accessToken is not a string!', {
            type: typeof sessionTokens.accessToken,
            value: sessionTokens.accessToken,
          });
          return null;
        }
        
        return sessionTokens.accessToken;
      }

      return null;
    },

    isTokenExpired: () => {
      const tokens = get().tokens;
      if (!tokens?.expiresAt) return true;
      
      // Add 30 second buffer
      return Date.now() >= tokens.expiresAt - 30000;
    },

    setRefreshing: (isRefreshing) => {
      set({ isRefreshing });
    },

    setSwitchingOrganization: (isSwitching) => {
      set({ isSwitchingOrganization: isSwitching });
    },

    // Organization Actions
    setOrganizations: (organizations) => {
      set({ organizations });
    },

    setSelectedOrganization: (organization) => {
      set({ selectedOrganization: organization });
      get().updateActivity();
      saveSelectedOrgToSession(organization); // ✅ Persist to sessionStorage
    },

    setSelectedYear: (year) => {
      set({ selectedYear: year });
      get().updateActivity();
    },

    setSelectedBranch: (branch) => {
      set({ selectedBranch: branch });
      get().updateActivity();
    },

    addOrganization: (organization) => {
      set((state) => ({
        organizations: [...state.organizations, organization],
      }));
    },

    removeOrganization: (id) => {
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        selectedOrganization:
          state.selectedOrganization?.id === id ? null : state.selectedOrganization,
      }));
    },

    updateOrganization: (id, updates) => {
      set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? { ...org, ...updates } : org
        ),
        selectedOrganization:
          state.selectedOrganization?.id === id
            ? { ...state.selectedOrganization, ...updates }
            : state.selectedOrganization,
      }));
    },

    setShouldShowOrgSwitcher: (shouldShow) => {
      set({ shouldShowOrgSwitcher: shouldShow });
    },

    setOrganizationApiUrl: (apiUrl) => {
      set({ organizationApiUrl: apiUrl });
      saveOrgApiUrlToSession(apiUrl); // ✅ Persist to sessionStorage
    },

    // Session Actions
    updateActivity: () => {
      set({ lastActivity: Date.now() });
    },

    logout: () => {
      // ✅ Clear state immediately
      set({
        ...initialState,
        isLoggingOut: true, // ✅ CRITICAL: Set flag to prevent API calls during logout
      });
      
      // ✅ Clear sessionStorage tokens
      clearTokensFromSession();
      
      // ✅ Clear auth-status cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'auth-status=; path=/; max-age=0';
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('👋 User logged out');
      }
    },

    reset: () => {
      set(initialState);
      clearTokensFromSession();
      
      // ✅ Clear auth-status cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'auth-status=; path=/; max-age=0';
      }
    },

    // Helpers
    isAuthenticated: () => {
      const state = get();
      return !!(
        state.tokens?.accessToken &&
        state.status === 'authenticated' &&
        !state.isTokenExpired()
      );
    },

    getUserId: () => {
      return get().user?.userId || get().user?.id || null;
    },

    hasPermission: (permission) => {
      const user = get().user;
      return user?.permissions?.includes(permission) || false;
    },
  })
);

// ============================================================================
// INITIALIZATION (Restore state from sessionStorage)
// ============================================================================

if (typeof window !== 'undefined') {
  // Check auth-status cookie first (set by login page)
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };
  
  const cookieStatus = getCookie('auth-status');
  console.log('🍪 Cookie status on page load:', cookieStatus);
  
  // Check if we have tokens in sessionStorage
  const tokens = loadTokensFromSession();
  const persistedUser = loadUserFromSession();
  
  if (tokens?.accessToken) {
    console.log('🔄 Restoring auth state from sessionStorage...');
    
    // Validate that tokens are not expired
    const now = Date.now();
    const isExpired = tokens.expiresAt ? now >= tokens.expiresAt : false;
    
    if (!isExpired) {
      // Try to decode the access token to get user info
      try {
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
        
        // ✅ Use cookie status if available, otherwise use 'authenticated' as default
        const authStatus = (cookieStatus === 'authenticated' || cookieStatus === 'pending') 
          ? cookieStatus 
          : 'authenticated';

        const tokenId = isNonEmptyString(payload.sub)
          ? payload.sub.trim()
          : isNonEmptyString(payload.userId)
            ? payload.userId.trim()
            : null;
        const tokenUserId = isNonEmptyString(payload.userId)
          ? payload.userId.trim()
          : isNonEmptyString(payload.sub)
            ? payload.sub.trim()
            : null;
        const tokenEmail = isNonEmptyString(payload.email) ? payload.email.trim() : '';
        const tokenName = isNonEmptyString(payload.name) ? payload.name.trim() : '';
        const tokenRole = isNonEmptyString(payload.role) ? payload.role.trim() : 'user';
        const tokenPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];

        const tokenHasIdentity = !!tokenId || !!tokenUserId || !!tokenEmail;
        const tokenLooksIncomplete =
          !tokenHasIdentity && tokenName.length === 0 && tokenPermissions.length === 0;

        const sameUserAsPersisted =
          !!persistedUser && (
            (tokenUserId && persistedUser.userId === tokenUserId) ||
            (tokenId && persistedUser.id === tokenId) ||
            (tokenEmail && persistedUser.email.toLowerCase() === tokenEmail.toLowerCase())
          );

        const shouldPreferPersisted = !!persistedUser && (tokenLooksIncomplete || sameUserAsPersisted);

        const restoredUser: User = shouldPreferPersisted
          ? {
              ...persistedUser,
              id: tokenId || persistedUser.id,
              userId: tokenUserId || persistedUser.userId || persistedUser.id,
              email: tokenEmail || persistedUser.email,
              name: tokenName || persistedUser.name,
              role: tokenRole || persistedUser.role,
              permissions: tokenPermissions.length > 0 ? tokenPermissions : (persistedUser.permissions || []),
            }
          : {
              id: tokenId || tokenUserId || '',
              userId: tokenUserId || tokenId || undefined,
              email: tokenEmail,
              name: tokenName,
              role: tokenRole,
              permissions: tokenPermissions,
            };

        // Restore state from token/session
        useAuthStore.setState({
          status: authStatus as 'authenticated' | 'pending',
          tokens,
          user: restoredUser,
          // ✅ Restore organization context from sessionStorage
          selectedOrganization: loadSelectedOrgFromSession(),
          organizationApiUrl: loadOrgApiUrlFromSession(),
        });

        if (isNonEmptyString(restoredUser.id)) {
          saveUserToSession(restoredUser);
        }
        
        console.log('✅ Auth state restored from sessionStorage with status:', authStatus);
        
        // Log organization API URL if present
        const apiUrl = loadOrgApiUrlFromSession();
        if (apiUrl) {
          console.log('🌐 Organization-specific API URL restored:', apiUrl);
        }
      } catch (error) {
        console.warn('⚠️ Failed to decode token on init, clearing invalid tokens:', error);
        clearTokensFromSession();
      }
    } else {
      console.log('⏰ Tokens expired on page load, clearing...');
      clearTokensFromSession();
    }
  } else {
    console.log('📭 No tokens found in sessionStorage on page load');
    
    // ✅ If cookie says authenticated but no tokens, clear the cookie
    if (cookieStatus === 'authenticated' || cookieStatus === 'pending') {
      console.log('⚠️ Cookie says authenticated but no tokens found - clearing cookie');
      document.cookie = 'auth-status=unauthenticated; path=/; max-age=0';
    }
  }
}

// ============================================================================
// SELECTORS (for performance optimization)
// ============================================================================

/**
 * Convenience selectors for common auth state
 * These are NOT hooks - they're regular selectors to be used with useAuthStore
 */
export const authSelectors = {
  // Status selectors
  status: (state: AuthStore) => state.status,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated(),
  isRefreshing: (state: AuthStore) => state.isRefreshing,

  // User selectors
  user: (state: AuthStore) => state.user,
  userId: (state: AuthStore) => state.getUserId(),
  userEmail: (state: AuthStore) => state.user?.email,
  userName: (state: AuthStore) => state.user?.name,
  userRole: (state: AuthStore) => state.user?.role,
  userPermissions: (state: AuthStore) => state.user?.permissions || [],

  // Organization selectors
  organizations: (state: AuthStore) => state.organizations,
  selectedOrganization: (state: AuthStore) => state.selectedOrganization,
  selectedYear: (state: AuthStore) => state.selectedYear,
  selectedBranch: (state: AuthStore) => state.selectedBranch,
  organizationId: (state: AuthStore) => state.selectedOrganization?.id,
  organizationName: (state: AuthStore) => state.selectedOrganization?.name,

  // Token selectors
  hasToken: (state: AuthStore) => !!state.getAccessToken(),
  isTokenExpired: (state: AuthStore) => state.isTokenExpired(),
};

/**
 * Select auth actions (never causes re-renders)
 */
export const useAuthActions = () =>
  useAuthStore(
    (state) => ({
      setStatus: state.setStatus,
      setUser: state.setUser,
      updateUser: state.updateUser,
      setTokens: state.setTokens,
      clearTokens: state.clearTokens,
      getAccessToken: state.getAccessToken,
      setRefreshing: state.setRefreshing,
      setSwitchingOrganization: state.setSwitchingOrganization,
      setOrganizations: state.setOrganizations,
      setSelectedOrganization: state.setSelectedOrganization,
      setSelectedYear: state.setSelectedYear,
      setSelectedBranch: state.setSelectedBranch,
      addOrganization: state.addOrganization,
      removeOrganization: state.removeOrganization,
      updateOrganization: state.updateOrganization,
      setShouldShowOrgSwitcher: state.setShouldShowOrgSwitcher,
      setOrganizationApiUrl: state.setOrganizationApiUrl,
      updateActivity: state.updateActivity,
      logout: state.logout,
      reset: state.reset,
      isAuthenticated: state.isAuthenticated,
      getUserId: state.getUserId,
      hasPermission: state.hasPermission,
    }),
    shallow
  );

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to get current auth status
 * @returns Current authentication status
 */
export const useAuthStatus = () => useAuthStore((state) => state.status);

/**
 * Hook to check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated());

/**
 * Hook to get current user
 * @returns Current user or null
 */
export const useCurrentUser = () => useAuthStore((state) => state.user);

/**
 * Hook to get selected organization
 * @returns Selected organization or null
 */
export const useSelectedOrganization = () => useAuthStore((state) => state.selectedOrganization);

/**
 * Hook to get/set selected firm year (fiscal year)
 * @returns Object with selectedYear and setSelectedYear
 */
export const useSelectedFirmYear = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');
  return { selectedYear, setSelectedYear };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useAuthStore;

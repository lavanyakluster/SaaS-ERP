/**
 * Enterprise Authentication Type Definitions
 * Centralized auth-related types for type safety across the application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'User' | 'Accountant';
  permissions?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  expiresAt?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  selectedOrganization: string | null;
}

/**
 * Authentication status
 * - unauthenticated: Not logged in
 * - pending: Logged in but no organization selected
 * - authenticated: Fully authenticated with organization
 */
export type AuthStatus = 
  | 'unauthenticated'
  | 'pending'
  | 'authenticated';

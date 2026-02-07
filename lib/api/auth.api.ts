/**
 * Authentication API
 * 
 * Handles all authentication-related API calls including:
 * - Login (Email/Password, Microsoft, Google)
 * - Logout
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface LoginCredentials {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  isNewUser?: boolean;
  emailVerified?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export interface MicrosoftAuthRequest {
  IdToken: string;
  Provider?: 'Microsoft' | 'microsoft';
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  provider: 'local' | 'google' | 'microsoft';
}

export interface SignupResponse {
  success: boolean;
  message: string;
  requiresVerification?: boolean;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SendOtpRequest {
  Email: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpRequest {
  Email: string;
  Otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  userId?: string;
}

export interface ForgotPasswordRequest {
  Email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  NewPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface CreatePasswordRequest {
  token: string;
  NewPassword: string;
}

export interface CreatePasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/login', {
    Email: credentials.Email,
    Password: credentials.Password,
  });
  return response.data;
};

/**
 * Login with Microsoft OAuth
 */
export const loginWithMicrosoft = async (data: MicrosoftAuthRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/microsoft', data);
  return response.data;
};

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async (data: GoogleAuthRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/google', data);
  return response.data;
};

/**
 * Logout (client-side only, clears tokens)
 * Note: Backend doesn't have a logout endpoint, so we just clear client state
 */
export const logout = async (): Promise<void> => {
  // No backend call needed - just clear tokens from sessionStorage
  // This is handled by the auth store
  return Promise.resolve();
};

/**
 * Signup with email and password
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>('/signup', data);
  return response.data;
};

/**
 * Send OTP for email verification
 */
export const sendOtp = async (data: SendOtpRequest): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>('/send-otp', data);
  return response.data;
};

/**
 * Verify OTP for email verification
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>('/verify-otp', data);
  return response.data;
};

/**
 * Forgot password
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>('/forgot-password', data);
  return response.data;
};

/**
 * Reset password
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>('/reset-password', data);
  return response.data;
};

/**
 * Refresh access token
 */
/**
 * Create password for invited users
 */
export const createPassword = async (data: CreatePasswordRequest): Promise<CreatePasswordResponse> => {
  const response = await apiClient.post<CreatePasswordResponse>('/create-password', data);
  return response.data;
};

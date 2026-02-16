/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

// ✅ CRITICAL: Import refresh token API (avoid circular dependency by importing directly)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://130.94.45.215/V1/api';
const API_TIMEOUT = 60000; // 60 seconds for large data queries

// ✅ CRITICAL: List of endpoints that should ALWAYS use the static base URL
// These endpoints don't require organization-specific API URL
const STATIC_BASE_URL_ENDPOINTS = [
  '/login',
  '/signup',
  '/send-otp',
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
  '/refresh-token', // ✅ NEW: Refresh token uses static URL
  '/social-login', // ✅ Social login (Google, Microsoft)
  '/organizations', // List, create, update, delete organizations
  '/switch-org', // Switch organization API
  '/get-years-list', // ✅ CRITICAL: Year list uses static URL
  '/users', // ✅ User management endpoints
  '/user', // ✅ User CRUD operations (singular)
  '/roles', // ✅ Role management endpoints
  '/ChangeEmail', // ✅ Change user email endpoint
];

/**
 * Check if the endpoint should use static base URL
 * @param url - The request URL
 * @returns True if should use static base URL, false otherwise
 */
const shouldUseStaticBaseUrl = (url: string | undefined): boolean => {
  if (!url) return true;
  
  return STATIC_BASE_URL_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and set dynamic base URL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ CRITICAL: Set dynamic base URL based on organization context
    if (typeof window !== 'undefined') {
      const organizationApiUrl = useAuthStore.getState().organizationApiUrl;
      
      // Use organization-specific API URL for organization-context APIs
      // Exception: get-years-list always uses static base URL
      if (organizationApiUrl && !shouldUseStaticBaseUrl(config.url)) {
        config.baseURL = organizationApiUrl;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Using organization API URL:', organizationApiUrl, 'for', config.url);
        }
      } else {
        config.baseURL = API_BASE_URL;
        
        if (process.env.NODE_ENV === 'development' && !shouldUseStaticBaseUrl(config.url)) {
          console.log('⚠️ Using static API URL (no org URL available):', API_BASE_URL, 'for', config.url);
        }
      }
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      // ✅ Use auth store's getAccessToken() method for better token management
      const token = useAuthStore.getState().getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No token available for request');
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', config.method?.toUpperCase(), config.url, 'Base:', config.baseURL);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized - Attempting token refresh...', {
        url: originalRequest.url,
        hasToken: !!originalRequest.headers?.Authorization,
      });
      
      // Prevent infinite loops
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        if (typeof window !== 'undefined') {
          // ✅ CRITICAL: Don't try to refresh if already on login page or if error is from login/refresh API
          const isLoginPage = window.location.pathname === '/login';
          const isLoginRequest = originalRequest.url?.includes('/login');
          const isRefreshRequest = originalRequest.url?.includes('/refresh-token');
          
          // If login or refresh failed, just show error and redirect
          if (isLoginRequest || isRefreshRequest) {
            console.log('🔐 Login/Refresh request failed - redirecting to login');
            
            // Clear all storage
            sessionStorage.removeItem('sb_access_token');
            sessionStorage.removeItem('sb_refresh_token');
            sessionStorage.removeItem('sb_token_expires_in');
            sessionStorage.removeItem('sb_token_expires_at');
            sessionStorage.removeItem('sb_selected_organization');
            sessionStorage.removeItem('sb_organization_api_url');
            
            // Update auth store
            useAuthStore.getState().logout();
            
            // Update cookie
            document.cookie = 'auth-status=unauthenticated; path=/; max-age=0';
            
            if (!isLoginPage) {
              toast.error('Your session has expired. Please login again.');
              setTimeout(() => {
                window.location.replace('/login');
              }, 1000);
            }
            
            return Promise.reject(error);
          }
          
          // If already on login page, don't redirect (prevents refresh loop)
          if (isLoginPage) {
            console.log('📍 Already on login page - not redirecting');
            return Promise.reject(error);
          }
          
          // ✅ NEW: Try to refresh the token
          try {
            console.log('🔄 Attempting to refresh access token...');
            
            // Get refresh token from sessionStorage
            const refreshToken = sessionStorage.getItem('sb_refresh_token');
            
            if (!refreshToken) {
              console.error('❌ No refresh token available');
              throw new Error('No refresh token');
            }
            
            // Call refresh token API
            const refreshResponse = await apiClient.post('/refresh-token', {
              refreshToken: refreshToken,
            });
            
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = refreshResponse.data;
            
            console.log('✅ Token refreshed successfully!', {
              expiresIn,
              hasNewRefreshToken: !!newRefreshToken,
            });
            
            // Update tokens in auth store
            useAuthStore.getState().setTokens(accessToken, newRefreshToken, expiresIn);
            
            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            
            // Retry the original request with new token
            return apiClient(originalRequest);
            
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            
            // Show user-friendly message for session expiry
            toast.error('Your session has expired. Please login again.');
            
            // Clear all storage
            sessionStorage.removeItem('sb_access_token');
            sessionStorage.removeItem('sb_refresh_token');
            sessionStorage.removeItem('sb_token_expires_in');
            sessionStorage.removeItem('sb_token_expires_at');
            sessionStorage.removeItem('sb_selected_organization');
            sessionStorage.removeItem('sb_organization_api_url');
            
            // Update auth store
            useAuthStore.getState().logout();
            
            // Update cookie
            document.cookie = 'auth-status=unauthenticated; path=/; max-age=0';
            
            console.log('🚪 Redirecting to login page...');
            
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.replace('/login');
            }, 1000);
            
            return Promise.reject(refreshError);
          }
        }
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ 403 Forbidden - Insufficient permissions');
      toast.error('You do not have permission to perform this action');
      return Promise.reject(error);
    }
    
    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      console.warn('⚠️ 404 Not Found');
      // Don't show toast for 404 - let components handle it
      return Promise.reject(error);
    }
    
    // Handle 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.error('❌ 500 Internal Server Error');
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('❌ Network Error');
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request Timeout');
      toast.error('Request timeout. Please try again.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Default export for convenience
export default apiClient;
/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

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
  '/organizations', // List, create, update, delete organizations
  '/switch-org', // Switch organization API
  '/get-years-list', // ✅ CRITICAL: Year list uses static URL
  '/user', // Get/update user profile
  '/roles'
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
      const token = sessionStorage.getItem('sb_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', error.response?.status, error.config?.url);
    }

    // Handle 401 - Unauthorized (logout user)
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - Logging out user');
      
      if (typeof window !== 'undefined') {
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
        
        // Redirect to login
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

// Default export for convenience
export default apiClient;

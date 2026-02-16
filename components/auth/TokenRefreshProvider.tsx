'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api/client';
import axios from 'axios';

/**
 * TokenRefreshProvider
 * 
 * Automatically refreshes the access token before it expires.
 * Checks token expiration every minute and refreshes when there's 
 * less than 5 minutes remaining.
 * 
 * IMPORTANT: Handles both main API tokens and organization-specific tokens
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const tokens = useAuthStore((state) => state.tokens);
  const setTokens = useAuthStore((state) => state.setTokens);
  const status = useAuthStore((state) => state.status);
  const organizationApiUrl = useAuthStore((state) => state.organizationApiUrl);
  const selectedOrganization = useAuthStore((state) => state.selectedOrganization); // ✅ NEW: Get current org
  const isRefreshing = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if user is authenticated
    if (status !== 'authenticated' || !tokens?.accessToken || !tokens?.refreshToken) {
      return;
    }

    const checkAndRefreshToken = async () => {
      // Skip if already refreshing
      if (isRefreshing.current) {
        console.log('⏭️ Token refresh already in progress, skipping...');
        return;
      }

      const now = Date.now();
      const expiresAt = tokens.expiresAt;

      if (!expiresAt) {
        console.warn('⚠️ No expiration time set for token');
        return;
      }

      // Calculate time remaining (in seconds)
      const timeRemaining = Math.floor((expiresAt - now) / 1000);

      console.log('🔍 Token expiry check:', {
        expiresAt: new Date(expiresAt).toISOString(),
        timeRemaining: `${timeRemaining}s (${Math.floor(timeRemaining / 60)}m ${timeRemaining % 60}s)`,
        expiresIn: tokens.expiresIn,
        shouldRefresh: timeRemaining < 300, // Less than 5 minutes
        hasOrgApiUrl: !!organizationApiUrl,
      });

      // Refresh if less than 5 minutes remaining (300 seconds)
      if (timeRemaining < 300 && timeRemaining > 0) {
        console.log('🔄 Token expiring soon, refreshing...');
        
        try {
          isRefreshing.current = true;

          // ✅ Use correct field name: lowercase 'refreshToken'
          const refreshPayload = {
            refreshToken: tokens.refreshToken,
          };

          console.log('🌐 Refreshing token via main API...');
          const response = await apiClient.post('/refresh-token', refreshPayload);

          const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

          console.log('✅ Token refreshed successfully:', {
            expiresIn,
            expiresInMinutes: Math.floor(expiresIn / 60),
            hasNewRefreshToken: !!newRefreshToken,
          });

          // Update tokens in store
          setTokens(accessToken, newRefreshToken, expiresIn);

        } catch (error: any) {
          console.error('❌ Failed to refresh token:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
          });
          
          // If refresh token is invalid/expired, logout user
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('🚪 Refresh token expired, logging out...');
            // The 401 interceptor will handle the logout
          }
        } finally {
          isRefreshing.current = false;
        }
      } else if (timeRemaining <= 0) {
        console.warn('⚠️ Token already expired!');
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Check every minute (60 seconds)
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [tokens, status, setTokens, organizationApiUrl, selectedOrganization]); // ✅ Added organizationApiUrl and selectedOrganization dependencies

  return <>{children}</>;
}
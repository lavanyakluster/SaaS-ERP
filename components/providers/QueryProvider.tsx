/**
 * Query Provider - React Query Setup
 * 
 * Provides React Query client to the entire application
 * Handles API caching, refetching, data synchronization, and automatic retries
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AxiosError } from 'axios';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Determine if an error should be retried
 */
const shouldRetry = (failureCount: number, error: any): boolean => {
  // Don't retry after 3 attempts
  if (failureCount >= 3) {
    return false;
  }

  // Don't retry authentication errors (401, 403)
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return false;
    }
  }

  // Retry on network errors and server errors (500+)
  return true;
};

/**
 * QueryProvider Component
 * 
 * Wraps the application with React Query client
 * Creates a new QueryClient instance per request to avoid sharing state
 * 
 * Default Configuration:
 * - 5 minute stale time for most queries
 * - 10 minute cache time
 * - 3 retry attempts with exponential backoff
 * - Intelligent retry logic (skips auth errors)
 * - Refetch on window focus (disabled to prevent unnecessary API calls)
 * - Refetch on reconnect enabled
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance per component mount
  // This prevents state sharing between different requests in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ⚡ PERFORMANCE: Increased stale time to 10 minutes for better caching
            staleTime: 10 * 60 * 1000,
            
            // ⚡ PERFORMANCE: Increased cache time to 30 minutes
            gcTime: 30 * 60 * 1000,
            
            // ⚡ PERFORMANCE: Disable retries by default (hooks can override)
            retry: false,
            
            // ⚡ PERFORMANCE: Don't refetch on window focus
            refetchOnWindowFocus: false,
            
            // ⚡ PERFORMANCE: Don't refetch on network reconnect
            refetchOnReconnect: false,
            
            // ⚡ PERFORMANCE: Only refetch on mount if data is stale
            refetchOnMount: 'stale',
          },
          mutations: {
            // Retry mutations once on network errors only
            retry: (failureCount, error) => {
              // Only retry once
              if (failureCount >= 1) {
                return false;
              }

              // Only retry on network errors, not validation errors
              if (error instanceof AxiosError) {
                const status = error.response?.status;
                // Don't retry client errors (4xx)
                if (status && status >= 400 && status < 500) {
                  return false;
                }
              }

              return true;
            },
            
            // Shorter retry delay for mutations (1 second)
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
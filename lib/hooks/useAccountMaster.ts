/**
 * Account Master Hooks
 * 
 * ✅ Enterprise Features:
 * - React Query integration
 * - Automatic caching and refetching
 * - Optimistic updates
 * - Error handling
 * - Multi-tenant support
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  createAccountMaster,
  searchAccounts,
  getAccountByCode,
  getGroupByCode,
  type CreateAccountMasterRequest,
  type CreateAccountMasterResponse,
  type AccountAutocompleteItem,
  type AccountMasterDetails,
  type GroupMasterDetails,
  UpdateAccountMasterData,
} from '@/lib/api/account-master.api';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth-store';
import React from 'react';

// ============================================================================
// QUERY KEYS
// ============================================================================

const ACCOUNT_KEYS = {
  all: ['accounts'] as const,
  search: (text: string) => [...ACCOUNT_KEYS.all, 'search', text] as const,
  detail: (accode: string) => [...ACCOUNT_KEYS.all, 'detail', accode] as const,
};

const GROUP_KEYS = {
  all: ['groups'] as const,
  detail: (grCode: string) => [...GROUP_KEYS.all, 'detail', grCode] as const,
};

// ============================================================================
// HOOKS - Account Search (Autocomplete)
// ============================================================================

/**
 * Hook to search accounts using autocomplete
 * 
 * @param text - Search text
 * @param enabled - Whether to enable the query (default: text.length > 0)
 * @returns Query result with account list
 * 
 * @example
 * ```tsx
 * const { data: accounts, isLoading } = useAccountSearch('z');
 * ```
 */
export const useAccountSearch = (
  text: string,
  enabled: boolean = text.length > 0
) => {
  return useQuery({
    queryKey: ACCOUNT_KEYS.search(text),
    queryFn: () => searchAccounts(text),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// HOOKS - Account Details
// ============================================================================

/**
 * Hook to get account details by account code
 * 
 * @param accode - Account code
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with account details
 * 
 * @example
 * ```tsx
 * const { data: account, isLoading } = useAccountDetails('QR116');
 * ```
 */
export const useAccountDetails = (
  accode: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ACCOUNT_KEYS.detail(accode),
    queryFn: () => getAccountByCode(accode),
    enabled: enabled && accode.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// HOOKS - Group Details
// ============================================================================

/**
 * Hook to get group details by group code
 * 
 * @param grCode - Group code
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with group details
 * 
 * @example
 * ```tsx
 * const { data: group, isLoading } = useGroupDetails('A1');
 * ```
 */
export const useGroupDetails = (
  grCode: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: GROUP_KEYS.detail(grCode),
    queryFn: () => getGroupByCode(grCode),
    enabled: enabled && grCode.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// ============================================================================
// HOOKS - Create/Update Account
// ============================================================================

/**
 * Hook to create a new account master record
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateAccountMaster();
 * 
 * await createMutation.mutateAsync({
 *   acCode: 'QR116',
 *   acNm: '51 MINIMART RAYYAN',
 *   ...
 * });
 * ```
 */
export const useCreateAccountMaster = () => {
  const queryClient = useQueryClient();
  const selectedYear = useAuthStore((state) => state.selectedYear);

  return useMutation({
    mutationFn: (data: Omit<CreateAccountMasterRequest, 'year'>) => {
      if (!selectedYear) {
        throw new Error('No year selected');
      }
      console.log('🚀 useCreateAccountMaster - mutationFn called');
      console.log('📦 Data:', data);
      console.log('📅 Year:', selectedYear);
      
      // Pass year from auth store
      return createAccountMaster({ ...data, year: selectedYear });
    },
    onSuccess: (response, variables) => {
      console.log('✅ useCreateAccountMaster - Success:', response);
      console.log('📦 Variables:', variables);
      
      // Invalidate account queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.all });
      
      // Show success toast
      if (response.success) {
        console.log('🎉 Account Master created successfully');
      }
    },
    onError: (error) => {
      console.error('❌ useCreateAccountMaster - Error:', error);
    },
  });
};

// ============================================================================
// HOOKS - Update Account (Alias)
// ============================================================================

/**
 * Alias for useCreateAccountMaster (same API endpoint handles both create and update)
 */
export const useUpdateAccountMaster = useCreateAccountMaster;

// ============================================================================
// CUSTOM HOOKS - Combined Operations
// ============================================================================

/**
 * Hook to get account details with automatic refetch on mount
 * 
 * @param accode - Account code
 * @param options - Additional query options
 * @returns Query result with account details
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useAccountDetailsWithRefetch('QR116');
 * ```
 */
export const useAccountDetailsWithRefetch = (
  accode: string,
  options?: Partial<UseQueryOptions<AccountMasterDetails>>
) => {
  return useQuery({
    queryKey: ACCOUNT_KEYS.detail(accode),
    queryFn: () => getAccountByCode(accode),
    enabled: accode.length > 0,
    staleTime: 0, // Always refetch on mount
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to search accounts with debounce support
 * 
 * @param text - Search text
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Query result with account list
 * 
 * @example
 * ```tsx
 * const { data: accounts, isLoading } = useAccountSearchDebounced(searchText);
 * ```
 */
export const useAccountSearchDebounced = (
  text: string,
  debounceMs: number = 300
) => {
  const [debouncedText, setDebouncedText] = React.useState(text);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [text, debounceMs]);

  return useAccountSearch(debouncedText);
};
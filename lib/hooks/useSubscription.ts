/**
 * Subscription Hooks
 * React Query hooks for subscription management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSubscription,
  getCurrentSubscription,
  getSubscriptionPlans,
  getPlanPrices,
  getPaymentMethods,
  getBillingHistory,
  cancelSubscription,
  upgradeSubscription,
  downloadInvoice,
  CreateSubscriptionRequest,
} from '@/lib/api/subscription.api';
import { toast } from 'sonner';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const SUBSCRIPTION_KEYS = {
  all: ['subscription'] as const,
  current: () => [...SUBSCRIPTION_KEYS.all, 'current'] as const,
  plans: () => [...SUBSCRIPTION_KEYS.all, 'plans'] as const,
  planPrices: (planId: string) => [...SUBSCRIPTION_KEYS.all, 'prices', planId] as const,
  paymentMethods: () => [...SUBSCRIPTION_KEYS.all, 'payment-methods'] as const,
  billingHistory: () => [...SUBSCRIPTION_KEYS.all, 'billing-history'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch current subscription
 */
export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.current(),
    queryFn: getCurrentSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
};

/**
 * Hook to fetch all subscription plans
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.plans(),
    queryFn: getSubscriptionPlans,
    staleTime: 30 * 60 * 1000, // 30 minutes (plans don't change often)
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
};

/**
 * Hook to fetch plan prices for a specific plan
 */
export const usePlanPrices = (planId: string | null) => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.planPrices(planId || ''),
    queryFn: () => getPlanPrices(planId!),
    enabled: !!planId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
};

/**
 * Hook to fetch payment methods
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.paymentMethods(),
    queryFn: getPaymentMethods,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
};

/**
 * Hook to fetch billing history
 */
export const useBillingHistory = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.billingHistory(),
    queryFn: getBillingHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // ❌ DISABLED: No automatic retries on failure
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a new subscription
 */
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => createSubscription(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Subscription created successfully!');
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.current() });
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.billingHistory() });
      } else {
        toast.error(response.message || 'Failed to create subscription');
      }
    },
    onError: (error: any) => {
      console.error('Create subscription error:', error);
      toast.error(error?.response?.data?.message || 'Failed to create subscription');
    },
  });
};

/**
 * Hook to upgrade subscription
 */
export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      subscriptionId, 
      data 
    }: { 
      subscriptionId: string; 
      data: CreateSubscriptionRequest 
    }) => upgradeSubscription(subscriptionId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Subscription upgraded successfully!');
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.current() });
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.billingHistory() });
      } else {
        toast.error(response.message || 'Failed to upgrade subscription');
      }
    },
    onError: (error: any) => {
      console.error('Upgrade subscription error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upgrade subscription');
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => cancelSubscription(subscriptionId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.current() });
      } else {
        toast.error(response.message || 'Failed to cancel subscription');
      }
    },
    onError: (error: any) => {
      console.error('Cancel subscription error:', error);
      toast.error(error?.response?.data?.message || 'Failed to cancel subscription');
    },
  });
};

/**
 * Hook to download invoice
 */
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (invoiceId: string) => downloadInvoice(invoiceId),
    onSuccess: (blob, invoiceId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    },
    onError: (error: any) => {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice');
    },
  });
};
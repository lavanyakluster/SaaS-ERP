/**
 * Subscription API
 * Enterprise-grade subscription management
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface SubscriptionPlan {
  planId: string;
  planName: string;
  planDescription: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface PlanPrice {
  planPriceId: string;
  planId: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface PaymentMethod {
  paymentMethodId: string;
  name: string;
  type: 'card' | 'gpay' | 'applepay' | 'bank';
  isDefault: boolean;
}

export interface CreateSubscriptionRequest {
  PlanId: string;
  PlanPriceId: string;
  PaymentMethodId: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    planId: string;
    planName: string;
    status: 'active' | 'pending' | 'cancelled' | 'expired';
    startDate: string;
    endDate: string;
    nextBillingDate: string;
    amount: number;
    currency: string;
  };
  message?: string;
  error?: string;
}

export interface CurrentSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  planDescription: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  features: string[];
}

export interface BillingHistory {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new subscription
 */
export const createSubscription = async (
  data: CreateSubscriptionRequest
): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>('/subscription', data);
  return response.data;
};

/**
 * Get current subscription details
 */
export const getCurrentSubscription = async (): Promise<CurrentSubscription> => {
  const response = await apiClient.get<CurrentSubscription>('/subscription/current');
  return response.data;
};

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<SubscriptionPlan[]>('/subscription/plans');
  return response.data;
};

/**
 * Get plan prices for a specific plan
 */
export const getPlanPrices = async (planId: string): Promise<PlanPrice[]> => {
  const response = await apiClient.get<PlanPrice[]>(`/subscription/plans/${planId}/prices`);
  return response.data;
};

/**
 * Get available payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await apiClient.get<PaymentMethod[]>('/subscription/payment-methods');
  return response.data;
};

/**
 * Get billing history
 */
export const getBillingHistory = async (): Promise<BillingHistory[]> => {
  const response = await apiClient.get<BillingHistory[]>('/subscription/billing-history');
  return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>(
    `/subscription/${subscriptionId}/cancel`
  );
  return response.data;
};

/**
 * Upgrade subscription
 */
export const upgradeSubscription = async (
  subscriptionId: string,
  data: CreateSubscriptionRequest
): Promise<SubscriptionResponse> => {
  const response = await apiClient.post<SubscriptionResponse>(
    `/subscription/${subscriptionId}/upgrade`,
    data
  );
  return response.data;
};

/**
 * Download invoice
 */
export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
  const response = await apiClient.get<Blob>(`/subscription/invoices/${invoiceId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

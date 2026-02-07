'use client';

import { useState } from 'react';
import { Package, Zap, Shield, DollarSign, Calendar, TrendingUp, CreditCard, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import type { BillingHistory } from '@/lib/api/subscription.api';
import { GRADIENTS, ICON_GRADIENTS } from '@/lib/constants/colors';
import {
  BillingStats,
  CurrentPlanCard,
  AvailablePlansGrid,
  PaymentMethodsSection,
  BillingHistoryTable,
  SubscriptionModal,
} from '@/components/billing';
import {
  useCurrentSubscription,
  useBillingHistory,
  useDownloadInvoice,
} from '@/lib/hooks/useSubscription';

export default function BillingPage() {
  const { theme, isDark } = useTheme();
  const themeMode = theme === 'system' ? (isDark ? 'dark' : 'light') : theme;
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // ============================================================================
  // API QUERIES
  // ============================================================================

  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    isError: isSubscriptionError,
  } = useCurrentSubscription();

  const {
    data: billingHistoryData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
  } = useBillingHistory();

  const downloadInvoiceMutation = useDownloadInvoice();

  // ============================================================================
  // MOCK DATA (Fallback when API is not available)
  // ============================================================================

  // Pricing plans - In production, fetch from API
  const plans = [
    {
      planId: '79610E40-44FA-4FB6-88A2-12C581E24F60',
      name: 'Basic',
      price: 299,
      description: 'Perfect for small businesses',
      icon: Package,
      gradient: ICON_GRADIENTS.secondary,
      features: [
        '5 Users included',
        '10 GB Storage',
        'Email Support',
        'Basic Reports',
        'Single Branch',
        'Mobile Access',
      ],
    },
    {
      planId: '89610E40-44FA-4FB6-88A2-12C581E24F61',
      name: 'Professional',
      price: 599,
      description: 'Most popular for growing teams',
      icon: Zap,
      gradient: ICON_GRADIENTS.primary,
      popular: true,
      features: [
        '20 Users included',
        '100 GB Storage',
        'Priority Support',
        'Advanced Reports',
        'Multi-Branch Support',
        'Mobile Access',
        'API Access',
        'Custom Workflows',
      ],
    },
    {
      planId: '99610E40-44FA-4FB6-88A2-12C581E24F62',
      name: 'Enterprise',
      price: 1299,
      description: 'For large organizations',
      icon: Shield,
      gradient: ICON_GRADIENTS.tertiary,
      features: [
        'Unlimited Users',
        'Unlimited Storage',
        '24/7 Phone Support',
        'Custom Reports',
        'Unlimited Branches',
        'Mobile Access',
        'Full API Access',
        'Custom Integration',
        'Dedicated Account Manager',
        'SLA Guarantee',
      ],
    },
  ];

  // Mock payment methods - In production, fetch from API
  const paymentMethods = [
    {
      id: '1',
      type: 'card' as const,
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card' as const,
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ];

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Use API data if available, otherwise use mock data
  const fallbackBillingHistory: BillingHistory[] = [
    {
      invoiceId: '1',
      invoiceNumber: 'INV-0001',
      date: '2024-01-01',
      description: 'Professional Plan - Monthly',
      amount: 599,
      currency: 'AED',
      status: 'paid',
      invoiceUrl: '#',
    },
    {
      invoiceId: '2',
      invoiceNumber: 'INV-0002',
      date: '2023-12-01',
      description: 'Professional Plan - Monthly',
      amount: 599,
      currency: 'AED',
      status: 'paid',
      invoiceUrl: '#',
    },
    {
      invoiceId: '3',
      invoiceNumber: 'INV-0003',
      date: '2023-11-01',
      description: 'Professional Plan - Monthly',
      amount: 599,
      currency: 'AED',
      status: 'paid',
      invoiceUrl: '#',
    },
  ];

  const billingHistory = billingHistoryData ?? fallbackBillingHistory;

  const invoices: {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending';
    invoiceUrl: string;
  }[] = billingHistory.map((invoice) => ({
    id: invoice.invoiceNumber || invoice.invoiceId,
    date: invoice.date,
    description: invoice.description,
    amount: invoice.amount,
    status: invoice.status === 'paid' ? 'paid' : 'pending',
    invoiceUrl: invoice.invoiceUrl ?? '#',
  }));

  // Stats with unified colors
  const stats = [
    {
      title: 'Current Balance',
      value: 'AED 0',
      icon: DollarSign,
      gradient: ICON_GRADIENTS.primary,
    },
    {
      title: 'Next Billing Date',
      value: currentSubscription?.nextBillingDate
        ? new Date(currentSubscription.nextBillingDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Feb 1, 2024',
      icon: Calendar,
      gradient: ICON_GRADIENTS.secondary,
    },
    {
      title: 'Total Spent',
      value: 'AED 7,188',
      icon: TrendingUp,
      gradient: ICON_GRADIENTS.tertiary,
    },
  ];

  // Find current plan based on subscription or default to Professional
  const currentPlan =
    plans.find((p) => p.planId === currentSubscription?.planId) || plans[1];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find((p) => p.planId === planId);
    if (plan) {
      setSelectedPlan(plan);
      setIsSubscriptionModalOpen(true);
    }
  };

  const handleAddPaymentMethod = () => {
    console.log('Add payment method');
    // TODO: Implement add payment method modal
  };

  const handleEditPaymentMethod = (methodId: string) => {
    console.log('Edit payment method:', methodId);
    // TODO: Implement edit payment method modal
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingSubscription || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            isDark ? 'text-emerald-500' : 'text-emerald-600'
          }`} />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading billing information...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (isSubscriptionError && isHistoryError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isDark ? 'bg-red-500/10' : 'bg-red-50'
          }`}>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Unable to Load Billing Information
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We're having trouble loading your billing information. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Sparkle Effect */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl relative z-10">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <Sparkles className="w-5 h-5 text-emerald-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h1
            className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Billing & Subscription
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <BillingStats stats={stats} theme={themeMode} />

      {/* Current Plan */}
      {currentPlan && <CurrentPlanCard plan={currentPlan} theme={themeMode} />}

      {/* Available Plans */}
      <AvailablePlansGrid
        plans={plans}
        selectedPlan={currentPlan.name}
        onSelectPlan={handleSelectPlan}
        theme={themeMode}
      />

      {/* Payment Methods */}
      <PaymentMethodsSection
        paymentMethods={paymentMethods}
        onAddMethod={handleAddPaymentMethod}
        onEditMethod={handleEditPaymentMethod}
        theme={themeMode}
      />

      {/* Billing History */}
      <BillingHistoryTable
        invoices={invoices}
        onDownload={handleDownloadInvoice}
        theme={themeMode}
      />

      {/* Subscription Modal */}
      {selectedPlan && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => {
            setIsSubscriptionModalOpen(false);
            setSelectedPlan(null);
          }}
          isDark={isDark}
          plan={selectedPlan}
          currentSubscriptionId={currentSubscription?.subscriptionId}
          isUpgrade={!!currentSubscription}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Check, Loader2, AlertCircle } from 'lucide-react';
import { useCreateSubscription, useUpgradeSubscription } from '@/lib/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  plan: {
    planId: string;
    name: string;
    price: number;
    description: string;
    features: string[];
  };
  currentSubscriptionId?: string | null;
  isUpgrade?: boolean;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  isDark,
  plan,
  currentSubscriptionId,
  isUpgrade = false,
}: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('GPAY');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const createMutation = useCreateSubscription();
  const upgradeMutation = useUpgradeSubscription();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBillingCycle('monthly');
      setPaymentMethod('GPAY');
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  const calculatePrice = () => {
    return billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price;
  };

  const handleSubscribe = async () => {
    if (!agreedToTerms) {
      return;
    }

    // For demo purposes, using mock IDs - in production, these should come from API
    const planPriceId = billingCycle === 'monthly' 
      ? '1FFEAFFD-406D-4A31-997F-030F3FB29C2B' 
      : '2FFEAFFD-406D-4A31-997F-030F3FB29C2C';

    const subscriptionData = {
      PlanId: plan.planId,
      PlanPriceId: planPriceId,
      PaymentMethodId: paymentMethod,
    };

    try {
      if (isUpgrade && currentSubscriptionId) {
        await upgradeMutation.mutateAsync({
          subscriptionId: currentSubscriptionId,
          data: subscriptionData,
        });
      } else {
        await createMutation.mutateAsync(subscriptionData);
      }
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const isLoading = createMutation.isPending || upgradeMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isUpgrade ? 'Upgrade' : 'Subscribe to'} {plan.name} Plan
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {plan.description}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Billing Cycle Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Billing Cycle
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBillingCycle('monthly')}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all ${
                  billingCycle === 'monthly'
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-emerald-500 bg-emerald-50'
                    : isDark
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Monthly
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      AED {plan.price}/mo
                    </div>
                  </div>
                  {billingCycle === 'monthly' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setBillingCycle('yearly')}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all relative ${
                  billingCycle === 'yearly'
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-emerald-500 bg-emerald-50'
                    : isDark
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="absolute -top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 20%
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Yearly
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      AED {Math.round(plan.price * 0.8)}/mo
                    </div>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <div className="space-y-2">
              {['GPAY', 'CARD', 'APPLEPAY'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    paymentMethod === method
                      ? isDark
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-emerald-500 bg-emerald-50'
                      : isDark
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {method === 'GPAY' ? 'Google Pay' : method === 'APPLEPAY' ? 'Apple Pay' : 'Credit Card'}
                    </span>
                  </div>
                  {paymentMethod === method && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Features */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What's included:
            </h3>
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              I agree to the{' '}
              <a href="#" className="text-emerald-500 hover:text-emerald-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-emerald-500 hover:text-emerald-600">
                Privacy Policy
              </a>
            </span>
          </label>

          {/* Error Message */}
          {(createMutation.isError || upgradeMutation.isError) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-500">
                Failed to {isUpgrade ? 'upgrade' : 'create'} subscription. Please try again.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Total
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AED {calculatePrice().toLocaleString()}
              <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                /{billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={!agreedToTerms || isLoading}
              className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>{isUpgrade ? 'Upgrade Now' : 'Subscribe Now'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

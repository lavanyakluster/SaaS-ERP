'use client';

import { useState } from 'react';
import { Package, Zap, Shield, Loader2, AlertCircle, Crown, Check, ArrowRight } from 'lucide-react';
import { ICON_GRADIENTS } from '@/lib/constants/colors';
import { SubscriptionModal } from '@/components/billing/SubscriptionModal';
import { useCurrentSubscription } from '@/lib/hooks/useSubscription';

interface BillingSubscriptionSectionProps {
  isDark: boolean;
}

export function BillingSubscriptionSection({ isDark }: BillingSubscriptionSectionProps) {
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

  // ============================================================================
  // MOCK DATA
  // ============================================================================

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

  // Find current plan
  const currentPlan = plans.find((p) => p.planId === currentSubscription?.planId) || plans[1];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsSubscriptionModalOpen(true);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-emerald-500' : 'text-emerald-600'
            }`}
          />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading subscription...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (isSubscriptionError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div
            className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isDark ? 'bg-red-500/10' : 'bg-red-50'
            }`}
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Unable to Load Subscription
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            We're having trouble loading your subscription. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${currentPlan.gradient}`}
            >
              <currentPlan.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPlan.name} Plan
                </h2>
                {currentPlan.popular && (
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                    CURRENT
                  </span>
                )}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentPlan.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AED {currentPlan.price}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>per month</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Next Billing Date */}
        {currentSubscription?.nextBillingDate && (
          <div
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Next billing date
              </span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(currentSubscription.nextBillingDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <div className="mb-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Available Plans
          </h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose the plan that best fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.planId === currentPlan.planId;

            return (
              <div
                key={plan.planId}
                className={`rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? isDark
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                      : 'border-emerald-500/50 bg-emerald-50/50 shadow-lg shadow-emerald-500/10'
                    : isDark
                    ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="flex items-center justify-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${plan.gradient} mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h4>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    AED {plan.price}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    per month
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{plan.features.length - 6} more features
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? isDark
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                      : isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <Crown className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {currentPlan && plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

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

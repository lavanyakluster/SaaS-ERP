'use client';

import { useState } from 'react';

interface Plan {
  name: string;
  price: number;
  description: string;
  iconName: string;
  gradient: string;
  popular?: boolean;
  features: string[];
}

interface PricingSectionProps {
  plans: Plan[];
  theme?: 'light' | 'dark';
}

// Icon mapping with emojis
const iconMap: Record<string, string> = {
  'Package': '📦',
  'Zap': '⚡',
  'Shield': '🛡️',
};

export function PricingSection({ plans, theme = 'light' }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section 
      id="pricing"
      className={`py-24 ${
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            theme === 'dark' 
              ? 'bg-teal-500/10 border border-teal-500/20' 
              : 'bg-teal-100 border border-teal-200'
          }`}>
            <span className="text-xl">💳</span>
            <span className={`${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
              Flexible Pricing
            </span>
          </div>
          <h2 className={`text-4xl md:text-5xl mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Transparent pricing with no hidden fees. Start free, upgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className={`inline-flex items-center gap-4 mt-8 p-2 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100 border border-gray-200'
          }`}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-xl transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular ? 'md:-mt-4 md:mb-4' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg">
                    <span>⭐ Most Popular</span>
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl transition-all duration-300 ${
                plan.popular
                  ? theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20'
                    : 'bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-500 shadow-2xl'
                  : theme === 'dark'
                    ? 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                    : 'bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl'
              }`}>
                {/* Icon */}
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{iconMap[plan.iconName] || '✨'}</span>
                </div>

                {/* Plan Name */}
                <h3 className={`text-2xl mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      ${billingPeriod === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      /month
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className={`mt-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Save ${Math.round(plan.price * 0.2 * 12)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                        ✓
                      </span>
                      <span className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href="/signup"
                  className={`block w-full py-4 rounded-2xl text-center transition-all hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-2xl'
                      : theme === 'dark'
                        ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-emerald-500'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            All plans include 14-day free trial • No credit card required
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Bank-Level Security
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💯</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                30-Day Money Back
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎧</span>
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                24/7 Support
              </span>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className={`mt-12 p-8 rounded-3xl border-2 border-dashed ${
          theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🏢</span>
              <div>
                <h4 className={`text-2xl mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Need a Custom Enterprise Plan?
                </h4>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Contact our sales team for volume pricing, custom integrations, and dedicated support.
                </p>
              </div>
            </div>
            <a
              href="/signup"
              className={`flex-shrink-0 px-8 py-4 rounded-2xl transition-all hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-emerald-500' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500 shadow-lg'
              }`}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

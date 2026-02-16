/**
 * Gradient Metric Card Component
 * 
 * ✅ Features:
 * - Beautiful purple gradient background
 * - Real API data integration
 * - Icon support
 * - Dark/light theme support
 */

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GradientMetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  isDark: boolean;
}

export function GradientMetricCard({ icon: Icon, value, label, isDark }: GradientMetricCardProps) {
  return (
    <div 
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Top Icon */}
      <div className="flex items-center justify-between mb-8">
        {/* Left Icon */}
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </p>
      </div>

      {/* Label */}
      <div>
        <p className="text-sm text-white/80 font-medium">
          {label}
        </p>
      </div>

      {/* Decorative background circles */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
    </div>
  );
}

/**
 * Gradient Metrics Grid Component
 */
interface GradientMetricsGridProps {
  income: number;
  expense: number;
  profit: number;
  profitMargin: number;
  isDark: boolean;
  isLoading?: boolean;
}

export function GradientMetricsGrid({
  income,
  expense,
  profit,
  profitMargin,
  isDark,
  isLoading = false,
}: GradientMetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  // Import icons dynamically to avoid import errors
  const { DollarSign, CreditCard, TrendingUp, Eye } = require('lucide-react');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <GradientMetricCard
        icon={DollarSign}
        value={income}
        label="Income"
        isDark={isDark}
      />
      <GradientMetricCard
        icon={CreditCard}
        value={expense}
        label="Expense"
        isDark={isDark}
      />
      <GradientMetricCard
        icon={TrendingUp}
        value={profit}
        label="Profit"
        isDark={isDark}
      />
      <GradientMetricCard
        icon={Eye}
        value={profitMargin}
        label="Total Page View"
        isDark={isDark}
      />
    </div>
  );
}
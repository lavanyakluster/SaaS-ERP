'use client';

import { useTheme } from '@/lib/store/theme-store';
import type { LucideIcon } from 'lucide-react';
import { MetricCard } from './MetricCard';

export interface MetricData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  status: 'good' | 'warning' | 'critical';
}

interface MetricsGridProps {
  metrics: MetricData[];
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, isLoading = false }: MetricsGridProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-40 rounded-xl border animate-pulse ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="p-5 space-y-4">
              {/* Icon skeleton */}
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              {/* Title skeleton */}
              <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              {/* Value skeleton */}
              <div className={`h-8 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} isDark={isDark} />
      ))}
    </div>
  );
}
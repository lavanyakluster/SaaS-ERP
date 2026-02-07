/**
 * Stats Card Component
 * Displays key metrics
 */

import { LucideIcon } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme-store';
import { memo } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatsCard = memo(function StatsCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: StatsCardProps) {
  const { isDark } = useThemeStore();

  const variants = {
    default: {
      container: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      label: isDark ? 'text-gray-400' : 'text-gray-600',
      value: isDark ? 'text-white' : 'text-gray-900',
      icon: isDark ? 'text-gray-500' : 'text-gray-400',
    },
    success: {
      container: isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200',
      label: isDark ? 'text-green-400' : 'text-green-700',
      value: isDark ? 'text-green-400' : 'text-green-700',
      icon: isDark ? 'text-green-400' : 'text-green-600',
    },
    warning: {
      container: isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
      label: isDark ? 'text-yellow-400' : 'text-yellow-700',
      value: isDark ? 'text-yellow-400' : 'text-yellow-700',
      icon: isDark ? 'text-yellow-400' : 'text-yellow-600',
    },
    danger: {
      container: isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200',
      label: isDark ? 'text-red-400' : 'text-red-700',
      value: isDark ? 'text-red-400' : 'text-red-700',
      icon: isDark ? 'text-red-400' : 'text-red-600',
    },
  };

  const style = variants[variant];

  return (
    <div className={`p-5 rounded-xl border ${style.container}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${style.label}`}>
          {label}
        </span>
        <Icon className={`w-5 h-5 ${style.icon}`} />
      </div>
      <div className={`text-3xl font-bold ${style.value}`}>
        {value}
      </div>
    </div>
  );
});
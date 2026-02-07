/**
 * Status Badge Component
 * Displays status with color indicators
 */

import { LucideIcon, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme-store';
import { memo } from 'react';

type StatusType = 'active' | 'pending' | 'suspended' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
}

const STATUS_CONFIG: Record<StatusType, {
  icon: LucideIcon;
  label: string;
  classLight: string;
  classDark: string;
}> = {
  active: {
    icon: CheckCircle,
    label: 'Active',
    classLight: 'bg-green-50 text-green-700 border-green-200',
    classDark: 'bg-green-900/30 text-green-400 border-green-800',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    classLight: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    classDark: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  },
  suspended: {
    icon: XCircle,
    label: 'Suspended',
    classLight: 'bg-red-50 text-red-700 border-red-200',
    classDark: 'bg-red-900/30 text-red-400 border-red-800',
  },
  inactive: {
    icon: XCircle,
    label: 'Inactive',
    classLight: 'bg-gray-50 text-gray-700 border-gray-200',
    classDark: 'bg-gray-900/30 text-gray-400 border-gray-800',
  },
};

export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  const { isDark } = useThemeStore();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const className = isDark ? config.classDark : config.classLight;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
});
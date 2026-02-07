/**
 * AlertMessage Component
 * Reusable alert for success, error, info messages
 */

import { CheckCircle, AlertCircle, Info, type LucideProps } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string | ReactNode;
  theme?: 'light' | 'dark';
  icon?: ReactNode | ComponentType<LucideProps>;
}

export function AlertMessage({ type, title, message, theme = 'light', icon }: AlertMessageProps) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: theme === 'dark'
            ? 'bg-emerald-900/20 border border-emerald-800'
            : 'bg-emerald-50 border border-emerald-200',
          icon: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600',
          title: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700',
          message: theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600',
        };
      case 'error':
        return {
          container: 'bg-red-500/10 border border-red-500/20',
          icon: 'text-red-500',
          title: 'text-red-500',
          message: 'text-red-500',
        };
      case 'info':
        return {
          container: theme === 'dark'
            ? 'bg-blue-900/20 border border-blue-800'
            : 'bg-blue-50 border border-blue-200',
          icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
          title: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
          message: theme === 'dark' ? 'text-blue-500' : 'text-blue-600',
        };
      default:
        // ✅ Fallback for any unexpected type
        return {
          container: theme === 'dark'
            ? 'bg-gray-900/20 border border-gray-800'
            : 'bg-gray-50 border border-gray-200',
          icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
          title: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
          message: theme === 'dark' ? 'text-gray-500' : 'text-gray-600',
        };
    }
  };

  const getIcon = () => {
    if (icon) {
      if (typeof icon === 'function') {
        const Icon = icon;
        return <Icon className="w-5 h-5" />;
      }
      return icon;
    }
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        // ✅ Fallback icon
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 ${styles.container}`}>
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        {title && (
          <p className={`text-sm font-semibold ${styles.title}`}>
            {title}
          </p>
        )}
        <p className={`text-sm ${title ? 'mt-0.5' : ''} ${title ? styles.message : styles.title}`}>
          {message}
        </p>
      </div>
    </div>
  );
}

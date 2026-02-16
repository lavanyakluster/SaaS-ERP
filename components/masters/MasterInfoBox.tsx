import { ReactNode } from 'react';

interface MasterInfoBoxProps {
  title: string;
  items?: string[];
  children?: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  variant?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

export function MasterInfoBox({
  title,
  items,
  children,
  theme = 'light',
  variant = 'info',
  className = ''
}: MasterInfoBoxProps) {
  const variantStyles = {
    info: {
      light: 'bg-teal-50 border-teal-200',
      dark: 'bg-teal-900/20 border-teal-700',
      iconBg: theme === 'dark' ? 'bg-teal-600' : 'bg-teal-500',
      titleColor: theme === 'dark' ? 'text-teal-300' : 'text-teal-900',
      textColor: theme === 'dark' ? 'text-teal-200' : 'text-teal-700'
    },
    warning: {
      light: 'bg-amber-50 border-amber-200',
      dark: 'bg-amber-900/20 border-amber-700',
      iconBg: theme === 'dark' ? 'bg-amber-600' : 'bg-amber-500',
      titleColor: theme === 'dark' ? 'text-amber-300' : 'text-amber-900',
      textColor: theme === 'dark' ? 'text-amber-200' : 'text-amber-700'
    },
    success: {
      light: 'bg-green-50 border-green-200',
      dark: 'bg-green-900/20 border-green-700',
      iconBg: theme === 'dark' ? 'bg-green-600' : 'bg-green-500',
      titleColor: theme === 'dark' ? 'text-green-300' : 'text-green-900',
      textColor: theme === 'dark' ? 'text-green-200' : 'text-green-700'
    },
    error: {
      light: 'bg-red-50 border-red-200',
      dark: 'bg-red-900/20 border-red-700',
      iconBg: theme === 'dark' ? 'bg-red-600' : 'bg-red-500',
      titleColor: theme === 'dark' ? 'text-red-300' : 'text-red-900',
      textColor: theme === 'dark' ? 'text-red-200' : 'text-red-700'
    }
  };

  const styles = variantStyles[variant];
  const bgClass = theme === 'dark' ? styles.dark : styles.light;

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠';
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${bgClass} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.iconBg}`}>
          <span className="text-white text-xs">{getIcon()}</span>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-1 ${styles.titleColor}`}>
            {title}
          </p>
          {items && items.length > 0 && (
            <ul className={`text-xs space-y-1 ${styles.textColor}`}>
              {items.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          )}
          {children && (
            <div className={`text-xs ${styles.textColor}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

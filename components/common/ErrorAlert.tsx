import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export function ErrorAlert({
  message,
  onDismiss,
  theme = 'light',
  className = ''
}: ErrorAlertProps) {
  return (
    <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
      theme === 'dark' 
        ? 'bg-red-900/20 border-red-800' 
        : 'bg-red-50 border-red-200'
    } ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-600 dark:text-red-400 flex-1">
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

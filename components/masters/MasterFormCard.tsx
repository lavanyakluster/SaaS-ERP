import { ReactNode } from 'react';

interface MasterFormCardProps {
  children: ReactNode;
  theme?: 'light' | 'dark' | 'system';
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
  className?: string;
}

export function MasterFormCard({
  children,
  theme = 'light',
  maxWidth = '7xl',
  className = ''
}: MasterFormCardProps) {
  const maxWidthClass = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl'
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto rounded-2xl shadow-xl border ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    } ${className}`}>
      {children}
    </div>
  );
}

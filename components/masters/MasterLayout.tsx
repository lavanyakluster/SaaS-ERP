'use client';

import { ReactNode } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';

interface MasterLayoutProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function MasterLayout({ children }: MasterLayoutProps) {
  const { theme } = useThemeStore();

  return (
    <div className={`h-full flex flex-col overflow-hidden ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {children}
    </div>
  );
}

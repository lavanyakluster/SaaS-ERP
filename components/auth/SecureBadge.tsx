/**
 * SecureBadge Component
 * Security badge for auth pages
 */

import { Sparkles } from 'lucide-react';

interface SecureBadgeProps {
  text?: string;
  theme?: 'light' | 'dark' | 'system';
}

export function SecureBadge({ text = 'SECURE LOGIN', theme = 'light' }: SecureBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-5">
      <Sparkles className="w-4 h-4 text-emerald-500" />
      <span className={`text-xs font-semibold ${
        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
      }`}>
        {text}
      </span>
    </div>
  );
}

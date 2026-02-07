/**
 * Global Loading Indicator
 * 
 * Features:
 * - Shows loading state for async operations
 * - Progress bar with percentage
 * - Loading message display
 * - Smooth animations
 * - Portal rendering (top of page)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useLoadingStore, loadingSelectors } from '@/lib/store/loading-store';

// ============================================================================
// COMPONENT
// ============================================================================

export const GlobalLoading: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const isGlobalLoading = useLoadingStore(loadingSelectors.isGlobalLoading);
  const highestPriority = useLoadingStore(loadingSelectors.highestPriority);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server or if not mounted
  if (!mounted || !isGlobalLoading || !highestPriority) {
    return null;
  }

  const { message, progress } = highestPriority;

  const loadingElement = (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{
            width: progress !== undefined ? `${progress}%` : '0%',
            animation: progress === undefined ? 'indeterminate 1.5s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Loading Message (if provided) */}
      {message && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 animate-slide-in-right">
          <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </span>
          {progress !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}

      <style>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 30%;
          }
          50% {
            width: 50%;
          }
          100% {
            transform: translateX(400%);
            width: 30%;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  // Only use createPortal on client-side after mount
  if (typeof window !== 'undefined' && document.body) {
    return createPortal(loadingElement, document.body);
  }

  return null;
};

export default GlobalLoading;
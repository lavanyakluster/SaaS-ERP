/**
 * Chart Fullscreen Modal Component
 * 
 * ✅ Enterprise Features:
 * - Fullscreen chart display
 * - Larger chart size for better visibility
 * - Close button with ESC key support
 * - Dark mode support
 * - Smooth animations
 */

'use client';

import { useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { X } from 'lucide-react';

interface ChartFullscreenModalProps {
  isOpen: boolean;
  title: string;
  option: EChartsOption;
  isDark: boolean;
  onClose: () => void;
}

export function ChartFullscreenModal({
  isOpen,
  title,
  option,
  isDark,
  onClose,
}: ChartFullscreenModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${
          isDark ? 'bg-black/80' : 'bg-black/50'
        } backdrop-blur-sm transition-opacity`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-[95vw] h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
          }`}
        >
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all hover:scale-110 ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
            title="Close (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-8 h-[calc(90vh-80px)] flex items-center justify-center">
          <ReactECharts
            option={option}
            style={{ width: '100%', height: '100%' }}
            theme={isDark ? 'dark' : undefined}
            notMerge={true}
            lazyUpdate={true}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  );
}

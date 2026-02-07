'use client';

import { X } from 'lucide-react';
import { ResizableChartWidget } from './ResizableChartWidget';

interface WidgetFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: {
    id: string;
    title: string;
    subtitle?: string;
    chartType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';
    data: any[];
    dataKeys: { key: string; label: string; color: string }[];
    size: 'small' | 'medium' | 'large' | 'full';
  } | null;
  isDark: boolean;
  onChangeChartType?: (id: string, type: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table') => void;
}

export function WidgetFullscreenModal({
  isOpen,
  onClose,
  widget,
  isDark,
  onChangeChartType,
}: WidgetFullscreenModalProps) {
  if (!widget || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300"
      >
        <div
          className={`w-full h-full rounded-2xl shadow-2xl flex flex-col ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {widget.title}
              </h2>
              {widget.subtitle && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {widget.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-90 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-hidden">
            <ResizableChartWidget
              id={widget.id}
              title=""
              chartType={widget.chartType}
              data={widget.data}
              dataKeys={widget.dataKeys}
              size="full"
              isDark={isDark}
              onChangeChartType={onChangeChartType}
              hideHeader={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default WidgetFullscreenModal;
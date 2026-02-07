'use client';

import { useState } from 'react';
import { X, Plus, Grid3x3, Save } from 'lucide-react';
import type { Widget } from '@/components/dashboard/types';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: Widget[];
  activeWidgets: string[];
  onSave: (widgetIds: string[]) => void;
  isDark: boolean;
}

export function DashboardCustomizer({
  isOpen,
  onClose,
  availableWidgets,
  activeWidgets,
  onSave,
  isDark,
}: DashboardCustomizerProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(activeWidgets);

  if (!isOpen) return null;

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    onSave(selectedWidgets);
    onClose();
  };

  // Group widgets by category
  const widgetsByCategory = availableWidgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Customize Dashboard
                </h2>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select widgets to display on your dashboard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {Object.entries(widgetsByCategory).map(([category, widgets]) => (
              <div key={category}>
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide`}>
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {widgets.map((widget) => {
                    const isSelected = selectedWidgets.includes(widget.id);
                    return (
                      <button
                        key={widget.id}
                        onClick={() => toggleWidget(widget.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : isDark
                              ? 'border-gray-700 bg-gray-900 hover:border-gray-600'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {widget.title}
                            </h4>
                            {widget.subtitle && (
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {widget.subtitle}
                              </p>
                            )}
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {widget.chartType}
                              </span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : isDark
                                ? 'border-gray-600'
                                : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedWidgets.length} widget{selectedWidgets.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-teal-600 text-white hover:from-blue-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCustomizer;

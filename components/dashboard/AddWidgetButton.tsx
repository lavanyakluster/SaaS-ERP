'use client';

import { Plus } from 'lucide-react';

interface AddWidgetButtonProps {
  onClick: () => void;
  isDark: boolean;
}

export function AddWidgetButton({ onClick, isDark }: AddWidgetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 border-dashed p-8 w-full h-full min-h-[300px] flex flex-col items-center justify-center transition-all ${
        isDark
          ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <Plus className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <h3 className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        Add Widget
      </h3>
      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Click to customize
      </p>
    </button>
  );
}

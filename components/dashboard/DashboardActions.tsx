'use client';

import { LayoutGrid, Download, RefreshCw } from 'lucide-react';

interface DashboardActionsProps {
  onCustomize: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isDark?: boolean;
}

export function DashboardActions({
  onCustomize,
  onExport,
  onRefresh,
  isRefreshing = false,
  isDark = false,
}: DashboardActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onCustomize}
        className={`p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        }`}
        title="Customize Dashboard"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      <button
        onClick={onExport}
        className={`p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        }`}
        title="Export Data"
      >
        <Download className="w-4 h-4" />
      </button>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`p-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Refresh Data"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

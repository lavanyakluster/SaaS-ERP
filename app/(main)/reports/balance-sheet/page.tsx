'use client';

import { usePageTheme } from '@/lib/hooks';
import { getGradientStyle, getGradientLightStyle, getGradientPrimaryColor } from '@/lib/utils/gradient';
import { FileBarChart, Download, Filter } from 'lucide-react';

export default function BalanceSheetPage() {
  const { theme, isDark, activeGradient } = usePageTheme();

  return (
    <div className={`p-8 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={getGradientStyle(activeGradient)}
            >
              <FileBarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Balance Sheet
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                View financial position
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${
                isDark 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button
              className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              style={getGradientStyle(activeGradient)}
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`rounded-2xl border p-8 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={getGradientLightStyle(activeGradient)}
              >
                <FileBarChart className="w-8 h-8" style={{ color: getGradientPrimaryColor(activeGradient) }} />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Balance Sheet Report
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This page will display assets, liabilities, and equity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
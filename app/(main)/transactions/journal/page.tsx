'use client';

import { useThemeStore } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';
import { BookOpen, Plus } from 'lucide-react';

export default function JournalPage() {
  const { theme } = useThemeStore();
  const { activeGradient } = useGradientStore();

  return (
    <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
              }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Journal Voucher
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage journal entries
              </p>
            </div>
          </div>
          
          <button
            className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
            }}
          >
            <Plus className="w-5 h-5" />
            New Journal Entry
          </button>
        </div>

        {/* Content Area */}
        <div className={`rounded-2xl border p-8 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${activeGradient.from}20, ${activeGradient.via}20, ${activeGradient.to}20)`
                }}
              >
                <BookOpen className="w-8 h-8" style={{ color: activeGradient.via }} />
              </div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Journal Voucher Management
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              This page will contain journal voucher creation and management functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

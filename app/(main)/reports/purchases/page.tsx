'use client';

/**
 * Purchase Reports Page with Tabs
 * Similar structure to Dashboard with multiple report views
 */

import { useState } from 'react';
import { ClipboardList, Download, Filter } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Import individual report components (to be created)
import PurchaseRegister from '@/components/reports/purchase/PurchaseRegister';
import PurchaseReturn from '@/components/reports/purchase/PurchaseReturn';

type PurchaseTab = 'purchase-register' | 'purchase-return';

export default function PurchaseReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<PurchaseTab>(
    (searchParams.get('tab') as PurchaseTab) || 'purchase-register'
  );

  const tabs = [
    { id: 'purchase-register', label: 'Purchase Register', icon: ClipboardList },
    { id: 'purchase-return', label: 'Purchase Return', icon: ClipboardList },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'purchase-register':
        return <PurchaseRegister />;
      case 'purchase-return':
        return <PurchaseReturn />;
      default:
        return <PurchaseRegister />;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Purchase Reports
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive purchase analysis and reporting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl border overflow-x-auto ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 p-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/reports/purchases?tab=${tab.id}`}
                onClick={() => setActiveTab(tab.id as PurchaseTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}

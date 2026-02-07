'use client';

/**
 * Sales Reports Page with Tabs
 * Similar structure to Dashboard with multiple report views
 */

import { useState } from 'react';
import { FileBarChart, Calendar, Download, Filter } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Import individual report components (to be created)
import DailySalesSummary from '@/components/reports/sales/DailySalesSummary';
import SalesConversion from '@/components/reports/sales/SalesConversion';
import SalesRegister from '@/components/reports/sales/SalesRegister';
import SalesReturn from '@/components/reports/sales/SalesReturn';

type SalesTab = 'daily-sales-summary' | 'sales-conversion' | 'sales-register' | 'sales-return';

export default function SalesReportsPage() {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SalesTab>(
    (searchParams.get('tab') as SalesTab) || 'daily-sales-summary'
  );

  const tabs = [
    { id: 'daily-sales-summary', label: 'Daily Sales Summary', icon: FileBarChart },
    { id: 'sales-conversion', label: 'Sales Conversion', icon: FileBarChart },
    { id: 'sales-register', label: 'Sales Register', icon: FileBarChart },
    { id: 'sales-return', label: 'Sales Return', icon: FileBarChart },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily-sales-summary':
        return <DailySalesSummary />;
      case 'sales-conversion':
        return <SalesConversion />;
      case 'sales-register':
        return <SalesRegister />;
      case 'sales-return':
        return <SalesReturn />;
      default:
        return <DailySalesSummary />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Reports
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive sales analysis and reporting
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
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-xl border overflow-x-auto flex-shrink-0 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 p-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/reports/sales?tab=${tab.id}`}
                onClick={() => setActiveTab(tab.id as SalesTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
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

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
    </div>
  );
}

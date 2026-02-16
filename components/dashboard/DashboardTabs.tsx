'use client';

import { LayoutDashboard, TrendingUp, Wallet, Package, Target } from 'lucide-react';
import type { DashboardType } from '@/components/dashboard/types';

interface DashboardTab {
  id: DashboardType;
  label: string;
  icon: React.ElementType;
}

interface DashboardTabsProps {
  activeTab: DashboardType;
  onTabChange: (tab: DashboardType) => void;
  isDark: boolean;
}

const tabs: DashboardTab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'account', label: 'Account', icon: Wallet },
  { id: 'item', label: 'Item', icon: Package },
  { id: 'sales-kpi', label: 'Sale KPI', icon: Target },
];

export function DashboardTabs({ activeTab, onTabChange, isDark }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              isActive
                ? isDark
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-600 text-white shadow-lg'
                : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

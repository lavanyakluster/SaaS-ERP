/**
 * Module Settings Section
 * Enable/disable modules for the organization
 */

'use client';

import { memo, useState } from 'react';
import { useThemeStore } from '@/lib/store/theme-store';
import { SettingsCard } from '../SettingsCard';
import { Layers, LayoutDashboard, FileText, Database, BarChart3, Users, DollarSign } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  color: string;
}

const DEFAULT_MODULES: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview and analytics',
    icon: LayoutDashboard,
    enabled: true,
    color: 'blue',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Receipt, payment, and journal entries',
    icon: FileText,
    enabled: true,
    color: 'green',
  },
  {
    id: 'masters',
    name: 'Masters',
    description: 'Account, group, and branch management',
    icon: Database,
    enabled: true,
    color: 'purple',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Financial reports and statements',
    icon: BarChart3,
    enabled: true,
    color: 'teal',
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'User and role administration',
    icon: Users,
    enabled: true,
    color: 'orange',
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Subscription and payment management',
    icon: DollarSign,
    enabled: false,
    color: 'yellow',
  },
];

export const ModuleSettings = memo(function ModuleSettings() {
  const { isDark } = useThemeStore();
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);

  const toggleModule = (moduleId: string) => {
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  return (
    <SettingsCard
      title="Module Management"
      description="Enable or disable modules for your organization"
      icon={Layers}
    >
      <div className="space-y-3">
        {modules.map((module) => {
          const ModuleIcon = module.icon;
          
          return (
            <div
              key={module.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-900'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  module.enabled
                    ? isDark
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-600'
                    : isDark
                    ? 'bg-gray-800 text-gray-600'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <ModuleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {module.name}
                  </h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {module.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleModule(module.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  module.enabled
                    ? 'bg-emerald-600'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    module.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
});
'use client';

import {
  Building2, Palette, Globe, Server, Layers, Shield, Activity,
  Users, User, LayoutDashboard, DollarSign, FileText,
  Database, Zap, Key, Webhook, ExternalLink, Lock, Clock,
  CreditCard, Crown, Settings as SettingsIcon, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type SettingsCategory = 
  | 'organization'
  | 'tenant-config'
  | 'users-access'
  | 'modules'
  | 'integrations'
  | 'security'
  | 'billing';

interface SettingsSidebarProps {
  activeCategory: SettingsCategory;
  activeSection: string;
  onCategoryChange: (category: SettingsCategory) => void;
  onSectionChange: (section: string) => void;
  isDark: boolean;
  organizationName?: string;
  onClose?: () => void;
}

interface SectionItem {
  id: string;
  label: string;
  icon: any;
  description: string;
}

interface NavigationCategory {
  id: SettingsCategory;
  label: string;
  icon: any;
  sections: SectionItem[];
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Settings navigation structure
 * Defines all categories and their sections
 */
const SETTINGS_NAVIGATION: NavigationCategory[] = [
  {
    id: 'organization' as SettingsCategory,
    label: 'Organization',
    icon: Building2,
    sections: [
      { 
        id: 'org-profile', 
        label: 'Organization Profile', 
        icon: Building2, 
        description: 'Basic organization information' 
      },
      { 
        id: 'org-branding', 
        label: 'Branding & Theme', 
        icon: Palette, 
        description: 'Logo, colors, and visual identity' 
      },
      { 
        id: 'org-domain', 
        label: 'Domain & URL', 
        icon: Globe, 
        description: 'Custom domain and subdomain settings' 
      },
      { 
        id: 'org-localization', 
        label: 'Localization', 
        icon: Globe, 
        description: 'Timezone, language, and regional settings' 
      },
    ],
  },
  {
    id: 'tenant-config' as SettingsCategory,
    label: 'Tenant Configuration',
    icon: Server,
    sections: [
      { 
        id: 'tenant-modules', 
        label: 'Module Management', 
        icon: Layers, 
        description: 'Enable/disable features and modules' 
      },
      { 
        id: 'tenant-data', 
        label: 'Data Isolation', 
        icon: Shield, 
        description: 'Multi-tenant data separation settings' 
      },
      { 
        id: 'tenant-limits', 
        label: 'Usage & Limits', 
        icon: Activity, 
        description: 'Storage, users, and resource quotas' 
      },
    ],
  },
  {
    id: 'users-access' as SettingsCategory,
    label: 'Users & Access',
    icon: Users,
    sections: [
      { 
        id: 'users', 
        label: 'User Management', 
        icon: User, 
        description: 'Invite and manage users' 
      },
      { 
        id: 'roles', 
        label: 'Roles & Permissions', 
        icon: Shield, 
        description: 'Role-based access control' 
      },
    ],
  },
  {
    id: 'modules' as SettingsCategory,
    label: 'Module Settings',
    icon: LayoutDashboard,
    sections: [
      { 
        id: 'module-sales', 
        label: 'Sales Configuration', 
        icon: DollarSign, 
        description: 'Sales module settings' 
      },
      { 
        id: 'module-purchases', 
        label: 'Purchase Configuration', 
        icon: FileText, 
        description: 'Purchase module settings' 
      },
      { 
        id: 'module-inventory', 
        label: 'Inventory Configuration', 
        icon: Database, 
        description: 'Inventory settings' 
      },
      { 
        id: 'module-accounting', 
        label: 'Accounting Configuration', 
        icon: DollarSign, 
        description: 'Accounting settings' 
      },
    ],
  },
  {
    id: 'integrations' as SettingsCategory,
    label: 'Integrations',
    icon: Zap,
    sections: [
      { 
        id: 'api-keys', 
        label: 'API Keys', 
        icon: Key, 
        description: 'API authentication' 
      },
      { 
        id: 'webhooks', 
        label: 'Webhooks', 
        icon: Webhook, 
        description: 'Configure webhooks' 
      },
      { 
        id: 'third-party', 
        label: 'Third-Party Apps', 
        icon: ExternalLink, 
        description: 'Connected applications' 
      },
    ],
  },
  {
    id: 'security' as SettingsCategory,
    label: 'Security',
    icon: Shield,
    sections: [
      { 
        id: 'security-settings', 
        label: 'Security Settings', 
        icon: Lock, 
        description: 'Password policies and 2FA' 
      },
      { 
        id: 'session-management', 
        label: 'Session Management', 
        icon: Clock, 
        description: 'Session timeout and controls' 
      },
      { 
        id: 'audit-logs', 
        label: 'Audit Logs', 
        icon: FileText, 
        description: 'User activity tracking' 
      },
      { 
        id: 'ip-whitelist', 
        label: 'IP Whitelist', 
        icon: Globe, 
        description: 'Restrict access by IP address' 
      },
    ],
  },
  {
    id: 'billing' as SettingsCategory,
    label: 'Billing & Subscription',
    icon: CreditCard,
    sections: [
      { 
        id: 'subscription', 
        label: 'Current Plan', 
        icon: Crown, 
        description: 'View and manage subscription' 
      },
      { 
        id: 'billing-info', 
        label: 'Billing Information', 
        icon: CreditCard, 
        description: 'Payment method and invoices' 
      },
      { 
        id: 'usage', 
        label: 'Usage Statistics', 
        icon: Activity, 
        description: 'Monitor resource usage' 
      },
    ],
  },
];

/**
 * Default organization name
 */
const DEFAULT_ORGANIZATION_NAME = 'SmartBook ERP';

// ============================================
// COMPONENT
// ============================================

export function SettingsSidebar({
  activeCategory,
  activeSection,
  onCategoryChange,
  onSectionChange,
  isDark,
  organizationName = DEFAULT_ORGANIZATION_NAME,
  onClose
}: SettingsSidebarProps) {
  const settingsNavigation = SETTINGS_NAVIGATION;

  return (
    <div className={`w-72 border-r overflow-y-auto ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Settings
              </h2>
              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {organizationName}
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        {settingsNavigation.map((category) => {
          const CategoryIcon = category.icon;
          const isActive = activeCategory === category.id;
          
          // Skip categories with no sections
          if (category.sections.length === 0) {
            return null;
          }
          
          return (
            <div key={category.id} className="mb-4">
              {/* Category Header */}
              <button
                onClick={() => {
                  onCategoryChange(category.id);
                  if (category.sections.length > 0) {
                    onSectionChange(category.sections[0].id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors mb-1 ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-700'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <CategoryIcon className="w-4 h-4" />
                {category.label}
              </button>

              {/* Sections */}
              {isActive && category.sections.length > 0 && (
                <div className="ml-4 space-y-0.5">
                  {category.sections.map((section) => {
                    const SectionIcon = section.icon;
                    const isSectionActive = activeSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => onSectionChange(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSectionActive
                            ? isDark
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : isDark
                              ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <SectionIcon className="w-3.5 h-3.5" />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
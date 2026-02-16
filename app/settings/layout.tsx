'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTheme } from '@/lib/store/theme-store';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SettingsTopNav } from '@/components/settings/SettingsTopNav';
import { SettingsProvider, useSettings } from '@/lib/contexts/settings-context';

// ============================================
// TYPES
// ============================================

interface SettingsLayoutProps {
  children: React.ReactNode;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Section metadata for titles and descriptions
 * Maps section IDs to their display information
 */
const SECTION_METADATA: Record<string, { title: string; description: string }> = {
  // Organization
  'org-profile': { 
    title: 'Organization Profile', 
    description: 'Manage your organization information and settings' 
  },
  'org-branding': { 
    title: 'Branding & Theme', 
    description: 'Customize your organization\'s visual identity' 
  },
  'org-domain': { 
    title: 'Domain & URL', 
    description: 'Configure your custom domain and subdomain' 
  },
  'org-localization': { 
    title: 'Localization', 
    description: 'Set timezone, language, and regional preferences' 
  },
  
  // Tenant Configuration
  'tenant-modules': { 
    title: 'Module Management', 
    description: 'Enable and configure system modules' 
  },
  'tenant-data': { 
    title: 'Data Isolation', 
    description: 'Multi-tenant data separation settings' 
  },
  'tenant-limits': { 
    title: 'Usage & Limits', 
    description: 'Manage storage and user quotas' 
  },
  
  // Users & Access
  'users': { 
    title: 'User Management', 
    description: 'Invite and manage team members' 
  },
  'roles': { 
    title: 'Roles & Permissions', 
    description: 'Configure role-based access control' 
  },
  
  // Modules
  'module-sales': { 
    title: 'Sales Configuration', 
    description: 'Configure sales module settings' 
  },
  'module-purchases': { 
    title: 'Purchase Configuration', 
    description: 'Configure purchase module settings' 
  },
  'module-inventory': { 
    title: 'Inventory Configuration', 
    description: 'Configure inventory settings' 
  },
  'module-accounting': { 
    title: 'Accounting Configuration', 
    description: 'Configure accounting settings' 
  },
  
  // Integrations
  'api-keys': { 
    title: 'API Keys', 
    description: 'Manage API authentication keys' 
  },
  'webhooks': { 
    title: 'Webhooks', 
    description: 'Configure webhook endpoints' 
  },
  'third-party': { 
    title: 'Third-Party Apps', 
    description: 'Manage connected applications' 
  },
  
  // Security
  'security-settings': { 
    title: 'Security Settings', 
    description: 'Password policies and two-factor authentication' 
  },
  'session-management': { 
    title: 'Session Management', 
    description: 'Control session timeout and security' 
  },
  'audit-logs': { 
    title: 'Audit Logs', 
    description: 'View user activity and system logs' 
  },
  'ip-whitelist': { 
    title: 'IP Whitelist', 
    description: 'Restrict access by IP address' 
  },
  
  // Billing
  'subscription': { 
    title: 'Current Plan', 
    description: 'View and manage your subscription' 
  },
  'billing-info': { 
    title: 'Billing Information', 
    description: 'Manage payment methods and invoices' 
  },
  'usage': { 
    title: 'Usage Statistics', 
    description: 'Monitor your resource usage' 
  },
};

/**
 * Default fallback metadata for sections not explicitly defined
 */
const DEFAULT_SECTION_METADATA = {
  title: 'Settings',
  description: 'Configure your settings'
};

// ============================================
// COMPONENTS
// ============================================

function SettingsLayoutContent({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const { selectedOrganization } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { activeCategory, activeSection, setActiveCategory, setActiveSection } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  const sectionMeta = SECTION_METADATA[activeSection] || DEFAULT_SECTION_METADATA;

  const handleClose = () => {
    router.push('/dashboard');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // You can add search filtering logic here
    console.log('Search query:', query);
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Navigation */}
      <SettingsSidebar
        activeCategory={activeCategory}
        activeSection={activeSection}
        onCategoryChange={setActiveCategory}
        onSectionChange={setActiveSection}
        isDark={isDark}
        organizationName={selectedOrganization?.displayName || selectedOrganization?.name}
        onClose={handleClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <SettingsTopNav
          title={sectionMeta.title}
          description={sectionMeta.description}
          isDark={isDark}
          showSearch={true}
          searchPlaceholder="Search settings..."
          onSearchChange={handleSearchChange}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <SettingsProvider>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </SettingsProvider>
  );
}

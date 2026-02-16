/**
 * Settings Navigation Configuration
 * Centralized navigation structure for settings page
 */

import {
  Building2,
  Palette,
  Globe,
  Server,
  Layers,
  Activity,
  LayoutDashboard,
  DollarSign,
  FileText,
  Database,
  Users,
  Shield,
  Key,
  Webhook,
  Lock,
  CreditCard,
} from 'lucide-react';

interface SettingsSectionItem {
  id: string;
  label: string;
  icon: any;
  description: string;
}

export interface SettingsNavItem {
  id: string;
  label: string;
  icon: any;
  sections: SettingsSectionItem[];
}

export const SETTINGS_NAVIGATION: SettingsNavItem[] = [
  {
    id: 'organization',
    label: 'Organization',
    icon: Building2,
    sections: [
      { id: 'org-profile', label: 'Organization Profile', icon: Building2, description: 'Basic organization information' },
      { id: 'org-branding', label: 'Branding & Theme', icon: Palette, description: 'Logo, colors, and visual identity' },
      { id: 'org-domain', label: 'Domain & URL', icon: Globe, description: 'Custom domain and subdomain settings' },
      { id: 'org-localization', label: 'Localization', icon: Globe, description: 'Timezone, language, and regional settings' },
    ],
  },
  {
    id: 'tenant-config',
    label: 'Tenant Configuration',
    icon: Server,
    sections: [
      { id: 'tenant-modules', label: 'Module Management', icon: Layers, description: 'Enable/disable features and modules' },
      { id: 'tenant-data', label: 'Data Isolation', icon: Shield, description: 'Multi-tenant data separation settings' },
      { id: 'tenant-limits', label: 'Usage & Limits', icon: Activity, description: 'Storage, users, and resource quotas' },
    ],
  },
  {
    id: 'users-access',
    label: 'Users & Access',
    icon: Users,
    sections: [
      { id: 'users', label: 'User Management', icon: Users, description: 'Manage team members and access' },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield, description: 'Define roles and permission sets' },
      { id: 'teams', label: 'Teams & Groups', icon: Users, description: 'Organize users into teams' },
    ],
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: LayoutDashboard,
    sections: [
      { id: 'module-dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Dashboard configuration' },
      { id: 'module-transactions', label: 'Transactions', icon: FileText, description: 'Transaction module settings' },
      { id: 'module-masters', label: 'Masters', icon: Database, description: 'Master data configuration' },
      { id: 'module-reports', label: 'Reports', icon: DollarSign, description: 'Report settings and templates' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Webhook,
    sections: [
      { id: 'api-keys', label: 'API Keys', icon: Key, description: 'Manage API keys and tokens' },
      { id: 'webhooks', label: 'Webhooks', icon: Webhook, description: 'Configure webhook endpoints' },
      { id: 'third-party', label: 'Third-party Apps', icon: Webhook, description: 'Connected applications' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    sections: [
      { id: 'security-auth', label: 'Authentication', icon: Lock, description: 'Login and authentication settings' },
      { id: 'security-password', label: 'Password Policy', icon: Key, description: 'Password requirements and rules' },
      { id: 'security-sessions', label: 'Session Management', icon: Activity, description: 'Session timeout and controls' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    sections: [
      { id: 'billing-plan', label: 'Current Plan', icon: CreditCard, description: 'Subscription and billing details' },
      { id: 'billing-payment', label: 'Payment Methods', icon: CreditCard, description: 'Manage payment methods' },
      { id: 'billing-invoices', label: 'Invoices', icon: FileText, description: 'View billing history' },
    ],
  },
];

export const getSectionTitle = (sectionId: string): string => {
  const sectionMap: Record<string, string> = {
    'org-profile': 'Organization Profile',
    'org-branding': 'Branding & Theme',
    'org-domain': 'Domain & URL',
    'org-localization': 'Localization',
    'tenant-modules': 'Module Management',
    'tenant-data': 'Data Isolation',
    'tenant-limits': 'Usage & Limits',
    'users': 'User Management',
    'roles': 'Roles & Permissions',
    'teams': 'Teams & Groups',
    'module-dashboard': 'Dashboard Settings',
    'module-transactions': 'Transaction Settings',
    'module-masters': 'Master Data Settings',
    'module-reports': 'Report Settings',
    'api-keys': 'API Keys',
    'webhooks': 'Webhooks',
    'third-party': 'Third-party Applications',
    'security-auth': 'Authentication',
    'security-password': 'Password Policy',
    'security-sessions': 'Session Management',
    'billing-plan': 'Current Plan',
    'billing-payment': 'Payment Methods',
    'billing-invoices': 'Invoices',
  };

  return sectionMap[sectionId] || 'Settings';
};

export const getSectionDescription = (sectionId: string): string => {
  const descriptionMap: Record<string, string> = {
    'org-profile': 'Manage your organization\'s basic information and contact details',
    'org-branding': 'Customize your brand identity with logo, colors, and themes',
    'org-domain': 'Configure custom domain and subdomain settings',
    'org-localization': 'Set timezone, language, and regional preferences',
    'tenant-modules': 'Enable or disable modules for your organization',
    'tenant-data': 'Configure data isolation and separation policies',
    'tenant-limits': 'View and manage resource usage limits',
    'users': 'Manage team members, invitations, and user access',
    'roles': 'Define and manage user roles and permissions',
    'teams': 'Organize users into teams and groups',
    'module-dashboard': 'Configure dashboard widgets and layout',
    'module-transactions': 'Customize transaction module settings',
    'module-masters': 'Configure master data management',
    'module-reports': 'Set up report templates and preferences',
    'api-keys': 'Create and manage API keys for integrations',
    'webhooks': 'Configure webhook endpoints for event notifications',
    'third-party': 'Manage connected third-party applications',
    'security-auth': 'Configure authentication methods and policies',
    'security-password': 'Set password strength requirements and rules',
    'security-sessions': 'Manage session timeout and security controls',
    'billing-plan': 'View and manage your subscription plan',
    'billing-payment': 'Add or update payment methods',
    'billing-invoices': 'Access billing history and invoices',
  };

  return descriptionMap[sectionId] || 'Configure settings for this section';
};

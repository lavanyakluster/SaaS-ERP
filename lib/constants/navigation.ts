/**
 * Navigation Menu Configuration
 * Centralized navigation structure for SmartBook ERP
 */

import {
  LayoutDashboard,
  FileText,
  Database,
  BarChart3,
  Settings,
  Receipt,
  CreditCard,
  ArrowLeftRight,
  BookOpen,
  Building2,
  Users,
  DollarSign,
  Target,
  Coins,
  TrendingUp,
  FileBarChart,
  ClipboardList,
  Scale,
  Award,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: Array<{
    label: string;
    page: string;
    href: string;
  }>;
}

export const NAVIGATION_MENU: NavItem[] = [
  // 1. Dashboard (first)
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    children: [
      {
        label: 'Overview',
        page: 'overview',
        href: '/dashboard',
      },
      {
        label: 'Sales',
        page: 'sales',
        href: '/dashboard?tab=sales',
      },
      {
        label: 'Account',
        page: 'account',
        href: '/dashboard?tab=account',
      },
      {
        label: 'Item',
        page: 'item',
        href: '/dashboard?tab=item',
      },
      {
        label: 'Sales KPI',
        page: 'sales-kpi',
        href: '/dashboard?tab=sales-kpi',
      },
      {
        label: 'Loyalty',
        page: 'loyalty',
        href: '/dashboard?tab=loyalty',
      },
      {
        label: 'Sales Target',
        page: 'sales-target',
        href: '/dashboard?tab=sales-target',
      },
    ],
  },
  // 2. Masters (second)
  {
    label: 'Masters',
    icon: Database,
    children: [
      {
        label: 'Account Master',
        page: 'accounts',
        href: '/masters/accounts',
      },
      {
        label: 'Group Master',
        page: 'groups',
        href: '/masters/groups',
      },
      {
        label: 'Branch Master',
        page: 'branches',
        href: '/masters/branches',
      },
      {
        label: 'Profit Center',
        page: 'profit-centers',
        href: '/masters/profit-centers',
      },
      {
        label: 'Currency Master',
        page: 'currencies',
        href: '/masters/currencies',
      },
    ],
  },
  // 3. Reports (third)
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      {
        label: 'Sale',
        page: 'sales',
        href: '/reports/sales',
      },
      {
        label: 'Purchase',
        page: 'purchases',
        href: '/reports/purchases',
      },
    ],
  },
  // 4. Transactions (last)
  {
    label: 'Transactions',
    icon: FileText,
    children: [
      {
        label: 'Receipt Voucher',
        page: 'receipts',
        href: '/transactions/receipts',
      },
      {
        label: 'Payment Voucher',
        page: 'payments',
        href: '/transactions/payments',
      },
      {
        label: 'Contra Voucher',
        page: 'contra',
        href: '/transactions/contra',
      },
      {
        label: 'Journal Voucher',
        page: 'journal',
        href: '/transactions/journal',
      },
    ],
  },
];

/**
 * Quick access shortcuts for global search
 */
export const QUICK_ACTIONS = [
  { label: 'New Receipt Voucher', href: '/transactions/receipts', icon: Receipt, color: '#10B981' },
  { label: 'New Payment Voucher', href: '/transactions/payments', icon: CreditCard, color: '#EF4444' },
  { label: 'Sale Reports', href: '/reports/sales', icon: FileBarChart, color: '#3B82F6' },
  { label: 'Purchase Reports', href: '/reports/purchases', icon: ClipboardList, color: '#8B5CF6' },
  { label: 'New Account', href: '/masters/accounts', icon: Users, color: '#F59E0B' },
  { label: 'View Dashboard', href: '/dashboard', icon: TrendingUp, color: '#06B6D4' },
  { label: 'Loyalty Dashboard', href: '/dashboard?tab=loyalty', icon: Award, color: '#EC4899' },
  { label: 'Sales Target Analysis', href: '/dashboard?tab=sales-target', icon: Target, color: '#14B8A6' },
] as const;

/**
 * Breadcrumb configuration for pages
 */
export const BREADCRUMB_CONFIG: Record<string, string[]> = {
  '/dashboard': ['Dashboard'],
  '/dashboard/loyalty': ['Dashboard', 'Loyalty'],
  '/dashboard/sales-target': ['Dashboard', 'Sales Target'],
  '/transactions/receipts': ['Transactions', 'Receipt Voucher'],
  '/transactions/payments': ['Transactions', 'Payment Voucher'],
  '/transactions/contra': ['Transactions', 'Contra Voucher'],
  '/transactions/journal': ['Transactions', 'Journal Voucher'],
  '/masters/accounts': ['Masters', 'Account Master'],
  '/masters/groups': ['Masters', 'Group Master'],
  '/masters/branches': ['Masters', 'Branch Master'],
  '/masters/profit-centers': ['Masters', 'Profit Center'],
  '/masters/currencies': ['Masters', 'Currency Master'],
  '/reports/sales': ['Reports', 'Sales'],
  '/reports/purchases': ['Reports', 'Purchase'],
  '/settings': ['Settings', 'General Settings'],
  '/billing': ['Billing'],
} as const;

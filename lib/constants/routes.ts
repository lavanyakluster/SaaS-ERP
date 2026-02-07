/**
 * Application Routes Constants
 * 
 * Centralized route definitions for type-safe navigation
 * Following enterprise patterns with no magic strings
 */

export const ROUTES = {
  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    TENANT_SETUP: '/tenant-setup',
  },

  // Main Application Routes
  MAIN: {
    DASHBOARD: '/dashboard',
    BILLING: '/billing',
  },

  // Settings Routes
  SETTINGS: {
    ROOT: '/settings',
    ORGANIZATION: '/settings/organization',
    MODULES: '/settings/modules',
    USERS: '/settings/users', // Add users route
  },

  // Masters Routes
  MASTERS: {
    ACCOUNTS: '/masters/accounts',
    BRANCHES: '/masters/branches',
    CURRENCIES: '/masters/currencies',
    GROUPS: '/masters/groups',
    PROFIT_CENTERS: '/masters/profit-centers',
  },

  // Transactions Routes
  TRANSACTIONS: {
    JOURNAL: '/transactions/journal',
    PAYMENTS: '/transactions/payments',
    RECEIPTS: '/transactions/receipts',
    CONTRA: '/transactions/contra',
  },

  // Reports Routes
  REPORTS: {
    BALANCE_SHEET: '/reports/balance-sheet',
    PROFIT_LOSS: '/reports/profit-loss',
    TRIAL_BALANCE: '/reports/trial-balance',
    LEDGER: '/reports/ledger',
    VAT: '/reports/vat',
  },
} as const;

/**
 * Build organization settings route with query parameter
 * @param organizationId - Organization ID
 * @returns Full route with query parameter
 */
export const buildOrganizationSettingsRoute = (organizationId: string): string => {
  return `${ROUTES.SETTINGS.ROOT}?section=organization&id=${organizationId}`;
};

/**
 * Build users & access settings route with query parameter
 * @param organizationId - Organization ID
 * @returns Full route with query parameter
 */
export const buildUsersSettingsRoute = (organizationId: string): string => {
  return `${ROUTES.SETTINGS.ROOT}?section=users&id=${organizationId}`;
};

/**
 * Navigation route types for type safety
 */
export type AuthRoute = typeof ROUTES.AUTH[keyof typeof ROUTES.AUTH];
export type MainRoute = typeof ROUTES.MAIN[keyof typeof ROUTES.MAIN];
export type SettingsRoute = typeof ROUTES.SETTINGS[keyof typeof ROUTES.SETTINGS];
export type MastersRoute = typeof ROUTES.MASTERS[keyof typeof ROUTES.MASTERS];
export type TransactionsRoute = typeof ROUTES.TRANSACTIONS[keyof typeof ROUTES.TRANSACTIONS];
export type ReportsRoute = typeof ROUTES.REPORTS[keyof typeof ROUTES.REPORTS];

export type AppRoute = 
  | AuthRoute 
  | MainRoute 
  | SettingsRoute 
  | MastersRoute 
  | TransactionsRoute 
  | ReportsRoute;
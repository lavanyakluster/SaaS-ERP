/**
 * Application-wide Constants
 * Centralized configuration for SmartBook ERP
 * Performance optimized with const assertions
 */

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  name: 'SmartBook',
  description: 'Cloud ERP Solution for GCC Markets',
  version: '1.0.0',
  author: 'SmartBook Team',
  defaultLocale: 'en',
  supportedLocales: ['en', 'ar'] as const,
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Auth tokens
  accessToken: 'smartbook_access_token',
  refreshToken: 'smartbook_refresh_token',
  
  // User preferences
  theme: 'smartbook_theme',
  language: 'smartbook_language',
  
  // Workspace selection
  selectedFirm: 'smartbook_firm',
  selectedYear: 'smartbook_year',
  selectedBranch: 'smartbook_branch',
  
  // UI state
  sidebarCollapsed: 'smartbook_sidebar_collapsed',
  gradientPreference: 'smartbook_gradient',
  
  // Zustand stores
  authStore: 'smartbook-auth-storage',
  themeStore: 'smartbook-theme-storage',
  gradientStore: 'smartbook-gradient-storage',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  // Public routes
  home: '/',
  
  // Auth routes
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  verifyEmail: '/verify-email',
  tenantSetup: '/tenant-setup',
  
  // Dashboard routes
  dashboard: '/dashboard',
  settings: '/settings',
  billing: '/billing',
  
  // Settings sub-routes
  SETTINGS_ORG_PROFILE: '/settings/org-profile',
  
  // Masters routes
  masters: {
    accounts: '/masters/accounts',
    groups: '/masters/groups',
    branches: '/masters/branches',
    currencies: '/masters/currencies',
    profitCenters: '/masters/profit-centers',
  },
  
  // Transactions routes  
  transactions: {
    receipts: '/transactions/receipts',
    payments: '/transactions/payments',
    contra: '/transactions/contra',
    journal: '/transactions/journal',
  },
  
  // Reports routes
  reports: {
    ledger: '/reports/ledger',
    trialBalance: '/reports/trial-balance',
    balanceSheet: '/reports/balance-sheet',
    profitLoss: '/reports/profit-loss',
    vat: '/reports/vat',
  },
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/api/login',
    signup: '/api/signup',
    logout: '/api/logout',
    forgotPassword: '/api/forgot-password',
    resetPassword: '/api/reset-password',
    verifyEmail: '/api/verify-email',
  },
  
  // User endpoints
  user: {
    profile: '/api/user/profile',
    updateProfile: '/api/user/profile/update',
    changePassword: '/api/user/password/change',
  },
  
  // Firm endpoints
  firms: {
    list: '/api/firms',
    get: (id: string) => `/api/firms/${id}`,
    create: '/api/firms',
    update: (id: string) => `/api/firms/${id}`,
    delete: (id: string) => `/api/firms/${id}`,
  },
  
  // Masters endpoints
  masters: {
    accounts: '/api/masters/accounts',
    groups: '/api/masters/groups',
    branches: '/api/masters/branches',
    currencies: '/api/masters/currencies',
  },
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  pageSizeOptions: [10, 20, 50, 100] as const,
  maxLimit: 100,
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  display: 'DD/MM/YYYY',
  displayLong: 'DD MMMM YYYY',
  api: 'YYYY-MM-DD',
  timestamp: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm:ss',
  dateTime: 'DD/MM/YYYY HH:mm',
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Please enter a valid phone number',
  },
  
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  
  companyName: {
    minLength: 2,
    maxLength: 100,
    message: 'Company name must be between 2 and 100 characters',
  },
  
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-50 characters (letters, numbers, underscore, hyphen)',
  },
} as const;

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_CONFIG = {
  borderRadius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '24px',
  },
  
  spacing: {
    xs: '12px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
  
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  zIndex: {
    modal: 1000,
    dropdown: 900,
    header: 800,
    sidebar: 700,
    overlay: 600,
  },
} as const;

// ============================================================================
// GCC COUNTRIES
// ============================================================================

export const GCC_COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', timezone: 'Asia/Dubai' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', timezone: 'Asia/Riyadh' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', timezone: 'Asia/Qatar' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', timezone: 'Asia/Kuwait' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', timezone: 'Asia/Bahrain' },
  { code: 'OM', name: 'Oman', currency: 'OMR', timezone: 'Asia/Muscat' },
] as const;

// ============================================================================
// CURRENCIES
// ============================================================================

export const CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
] as const;

// ============================================================================
// TIMEZONES
// ============================================================================

export const TIMEZONES = [
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
  { value: 'Asia/Qatar', label: 'Doha (GMT+3)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (GMT+3)' },
  { value: 'Asia/Bahrain', label: 'Manama (GMT+3)' },
  { value: 'Asia/Muscat', label: 'Muscat (GMT+4)' },
] as const;

// ============================================================================
// FISCAL YEAR MONTHS
// ============================================================================

export const FISCAL_YEAR_STARTS = [
  { value: 'January', label: 'January' },
  { value: 'April', label: 'April' },
  { value: 'July', label: 'July' },
  { value: 'October', label: 'October' },
] as const;

// ============================================================================
// INDUSTRIES
// ============================================================================

export const INDUSTRIES = [
  { value: 'trading', label: 'Trading & Distribution' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Professional Services' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'logistics', label: 'Logistics & Transportation' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_INVALID: 'Invalid or expired token',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  WEAK_PASSWORD: 'Password is too weak',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  
  // Generic errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred',
  
  // Form errors
  FORM_VALIDATION_ERROR: 'Please fix the errors in the form',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  DATA_SAVED: 'Data saved successfully',
  DATA_DELETED: 'Data deleted successfully',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type Currency = typeof CURRENCIES[number];
export type Industry = typeof INDUSTRIES[number];
export type GCCCountry = typeof GCC_COUNTRIES[number];

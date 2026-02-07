/**
 * Unified Color System for SmartBook ERP
 * 
 * This file contains all color constants used throughout the application
 * to ensure brand consistency across all pages and components.
 * 
 * Primary Brand Colors: Emerald/Teal Gradient
 */

// ============================================================================
// PRIMARY BRAND GRADIENTS
// ============================================================================

/**
 * Main brand gradient - used for primary CTAs, logos, and key UI elements
 */
export const GRADIENTS = {
  // Primary brand gradient (emerald to teal)
  primary: 'from-emerald-500 to-teal-600',
  primaryHover: 'from-emerald-600 to-teal-700',
  
  // Background gradients for light mode
  bgLight: 'from-emerald-50 via-teal-50 to-cyan-50',
  bgLightAlt: 'from-gray-50 via-gray-100 to-gray-50',
  
  // Background gradients for dark mode
  bgDark: 'from-gray-900 to-gray-800',
  bgDarkAlt: 'dark:from-gray-900 dark:to-gray-800',
  
  // Accent gradients (secondary use)
  accent1: 'from-blue-500 to-indigo-600',
  accent2: 'from-purple-500 to-pink-600',
  accent3: 'from-orange-500 to-red-600',
  accent4: 'from-teal-500 to-cyan-600',
  accent5: 'from-indigo-500 to-purple-600',
  
  // Text gradients
  textPrimary: 'from-emerald-600 via-teal-600 to-cyan-600',
  textAccent: 'from-emerald-600 to-teal-600',
} as const;

// ============================================================================
// ICON GRADIENTS
// ============================================================================

/**
 * Icon background gradients for consistency across cards and features
 */
export const ICON_GRADIENTS = {
  primary: 'from-emerald-500 to-teal-600',
  secondary: 'from-blue-500 to-indigo-600',
  tertiary: 'from-purple-500 to-pink-600',
  success: 'from-emerald-500 to-green-600',
  warning: 'from-orange-500 to-red-600',
  info: 'from-teal-500 to-cyan-600',
  
  // Descriptive names for easier usage
  emeraldTeal: 'from-emerald-500 to-teal-600',
  blueIndigo: 'from-blue-500 to-indigo-600',
  purplePink: 'from-purple-500 to-pink-600',
  emeraldGreen: 'from-emerald-500 to-green-600',
  orangeRed: 'from-orange-500 to-red-600',
  tealCyan: 'from-teal-500 to-cyan-600',
  indigoPurple: 'from-indigo-500 to-purple-600',
} as const;

// ============================================================================
// SOLID COLORS
// ============================================================================

/**
 * Solid color values for specific use cases
 */
export const COLORS = {
  // Primary brand colors
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
} as const;

// ============================================================================
// BORDER COLORS
// ============================================================================

/**
 * Border colors for consistency
 */
export const BORDERS = {
  light: 'border-gray-200',
  dark: 'border-gray-800',
  primary: 'border-emerald-500',
  primaryLight: 'border-emerald-200',
  primaryDark: 'border-emerald-700',
  
  // Hover states
  hoverLight: 'hover:border-emerald-200',
  hoverDark: 'hover:border-gray-600',
} as const;

// ============================================================================
// SHADOW COLORS
// ============================================================================

/**
 * Shadow colors for depth and elevation
 */
export const SHADOWS = {
  primary: 'shadow-emerald-500/50',
  primaryLight: 'shadow-emerald-100',
  primaryDark: 'shadow-emerald-500/20',
  
  // Standard shadows
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  
  // Hover shadows
  hoverLg: 'hover:shadow-lg',
  hoverXl: 'hover:shadow-xl',
  hover2xl: 'hover:shadow-2xl',
  hoverPrimary: 'hover:shadow-emerald-100',
} as const;

// ============================================================================
// TEXT COLORS
// ============================================================================

/**
 * Text colors for consistency across themes
 */
export const TEXT_COLORS = {
  // Light mode
  light: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    tertiary: 'text-gray-600',
    muted: 'text-gray-500',
    placeholder: 'text-gray-400',
  },
  
  // Dark mode
  dark: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    tertiary: 'text-gray-400',
    muted: 'text-gray-500',
    placeholder: 'text-gray-600',
  },
  
  // Brand colors
  brand: {
    primary: 'text-emerald-600',
    primaryDark: 'text-emerald-400',
    secondary: 'text-teal-600',
    secondaryDark: 'text-teal-400',
  },
} as const;

// ============================================================================
// BACKGROUND COLORS
// ============================================================================

/**
 * Background colors for cards, sections, and containers
 */
export const BG_COLORS = {
  // Light mode
  light: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
    card: 'bg-white',
    hover: 'hover:bg-gray-50',
    active: 'bg-emerald-50',
  },
  
  // Dark mode
  dark: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    tertiary: 'bg-gray-700',
    card: 'bg-gray-900',
    hover: 'hover:bg-gray-800',
    active: 'bg-emerald-900/20',
  },
} as const;

// ============================================================================
// BUTTON COLORS
// ============================================================================

/**
 * Pre-defined button color schemes
 */
export const BUTTON_COLORS = {
  primary: {
    base: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    hover: 'hover:shadow-lg hover:scale-105 transition-all',
    shadow: 'shadow-lg shadow-emerald-500/50',
  },
  
  secondary: {
    light: 'bg-gray-900 text-white hover:bg-gray-800',
    dark: 'bg-gray-800 text-white hover:bg-gray-700',
  },
  
  outline: {
    light: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50',
    dark: 'border-2 border-gray-700 text-white hover:bg-gray-800',
  },
  
  ghost: {
    light: 'text-gray-700 hover:bg-gray-100',
    dark: 'text-gray-300 hover:bg-gray-800',
  },
} as const;

// ============================================================================
// CARD COLORS
// ============================================================================

/**
 * Card color schemes for different themes
 */
export const CARD_COLORS = {
  light: {
    base: 'bg-white border border-gray-200',
    hover: 'hover:border-emerald-200 hover:shadow-emerald-100',
    active: 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50',
  },
  
  dark: {
    base: 'bg-gray-900 border border-gray-700',
    hover: 'hover:border-gray-600',
    active: 'border-emerald-500 shadow-lg shadow-emerald-500/20',
  },
} as const;

// ============================================================================
// STATUS COLORS
// ============================================================================

/**
 * Status indicator colors
 */
export const STATUS_COLORS = {
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  
  error: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
  },
  
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get theme-aware colors based on current theme
 */
export const getThemedColor = (theme: 'light' | 'dark', colorKey: string) => {
  return theme === 'dark' ? `dark:${colorKey}` : colorKey;
};

/**
 * Combine multiple color classes
 */
export const combineColors = (...colors: string[]) => {
  return colors.filter(Boolean).join(' ');
};

/**
 * Get gradient class for component type
 */
export const getGradientForType = (type: 'primary' | 'accent1' | 'accent2' | 'accent3' | 'accent4' | 'accent5') => {
  return GRADIENTS[type];
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GradientType = keyof typeof GRADIENTS;
export type IconGradientType = keyof typeof ICON_GRADIENTS;
export type ColorType = keyof typeof COLORS;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  GRADIENTS,
  ICON_GRADIENTS,
  COLORS,
  BORDERS,
  SHADOWS,
  TEXT_COLORS,
  BG_COLORS,
  BUTTON_COLORS,
  CARD_COLORS,
  STATUS_COLORS,
  getThemedColor,
  combineColors,
  getGradientForType,
};
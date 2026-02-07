/**
 * Library Index
 * Main export file for all library modules
 * Performance optimized with tree-shaking support
 */

// Constants
export * from './constants';

// Utilities
export * from './utils';

// Stores
export {
  useAuthStore,
  useAuthStatus,
  useAuthUser,
  useAuthTokens,
  useSelectedFirmYear,
  useAuthActions,
  useIsAuthenticated,
  type AuthStatus,
  type User,
  type Tokens,
} from './store/auth-store';

export {
  useThemeStore,
  useTheme,
  useThemeActions,
  type Theme,
} from './store/theme-store';

export {
  useGradientStore,
  useActiveGradient,
  useGradientPresets,
  useGradientActions,
  GRADIENT_PRESETS,
  type Gradient,
} from './store/gradient-store';

// Hooks
export * from './hooks';
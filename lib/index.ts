/**
 * Library Index
 * Main export file for all library modules
 * Performance optimized with tree-shaking support
 */

// Constants
export * from './constants';

// Stores
export {
  useAuthStore,
  useAuthStatus,
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

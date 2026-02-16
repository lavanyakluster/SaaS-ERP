/**
 * Enterprise Hooks Barrel Export
 * 
 * Organized by category for better tree-shaking
 */

// ============================================================================
// API HOOKS
// ============================================================================

export * from './useSignup';
export * from './useSendOtp';
export * from './useVerifyOtp';
export * from './useLogin';
export * from './useForgotPassword';
export * from './useResetPassword';
export * from './useSocialLogin';
export * from './useCreateOrganization';
export * from './useOrganizations';
export * from './useSwitchOrganization';
export * from './useOrganizationById';
export * from './useUpdateOrganization';
export * from './useDeleteOrganization';
export * from './useAutoOrganizationSwitch';
export * from './useSubscription';
export * from './useBranches';
export * from './useYears';
export * from './useProfitLoss';
export * from './useSalesDashboard';
export * from './useLoyaltyDashboard';
export * from './useSalesTarget';
export * from './useSalesSummary';
export * from './useSalesConversion';
export * from './useSalesRegister';
export * from './useSalesReturn';
export * from './useDateRange';
export * from './useBranchCode';
export * from './usePurchaseRegister';
export * from './usePurchaseReturn';
export * from './useQuotesStatus';

export * from './useMicrosoftAuth';

// ============================================================================
// THEME HOOKS
// ============================================================================

export * from './usePageTheme';

// ============================================================================
// PERMISSIONS HOOKS
// ============================================================================

export * from './usePermissions';
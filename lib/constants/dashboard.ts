/**
 * Dashboard Constants
 * Configuration values for dashboard components
 */

// ============================================================================
// DATE CONSTANTS
// ============================================================================

/**
 * Get current financial year date range
 * Assumes financial year starts in January
 */
export const getCurrentFinancialYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  return {
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`,
    year: currentYear,
  };
};

/**
 * Get date range for current month
 */
export const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get last day of current month
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${lastDay}`,
    month,
    year,
  };
};

/**
 * Get date range for year-to-date
 */
export const getYearToDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-${month}-${day}`,
    year,
  };
};

// ============================================================================
// MONTH CONSTANTS
// ============================================================================

export const MONTHS = [
  { value: '01', label: 'January', short: 'Jan' },
  { value: '02', label: 'February', short: 'Feb' },
  { value: '03', label: 'March', short: 'Mar' },
  { value: '04', label: 'April', short: 'Apr' },
  { value: '05', label: 'May', short: 'May' },
  { value: '06', label: 'June', short: 'Jun' },
  { value: '07', label: 'July', short: 'Jul' },
  { value: '08', label: 'August', short: 'Aug' },
  { value: '09', label: 'September', short: 'Sep' },
  { value: '10', label: 'October', short: 'Oct' },
  { value: '11', label: 'November', short: 'Nov' },
  { value: '12', label: 'December', short: 'Dec' },
] as const;

/**
 * Get current month value (01-12)
 */
export const getCurrentMonthValue = (): string => {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, '0');
};

// ============================================================================
// DASHBOARD LIMITS
// ============================================================================

/**
 * Default limits for dashboard data
 */
export const DASHBOARD_LIMITS = {
  // Top/Bottom performers
  TOP_PERFORMERS: 10,
  BOTTOM_PERFORMERS: 10,
  
  // Branch data
  MAX_BRANCHES: 100,
  TOP_BRANCHES: 10,
  
  // Customer data
  TOP_CUSTOMERS: 10,
  
  // Chart limits
  MAX_CHART_ITEMS: 10,
  MAX_TREND_MONTHS: 12,
} as const;

// ============================================================================
// TIER CONSTANTS (for Loyalty Dashboard)
// ============================================================================

export const LOYALTY_TIERS = [
  { value: 'bronze', label: 'Bronze', color: '#cd7f32' },
  { value: 'silver', label: 'Silver', color: '#c0c0c0' },
  { value: 'gold', label: 'Gold', color: '#ffd700' },
  { value: 'platinum', label: 'Platinum', color: '#e5e4e2' },
  { value: 'diamond', label: 'Diamond', color: '#b9f2ff' },
] as const;

// ============================================================================
// CATEGORY CONSTANTS (for Sales Target Dashboard)
// ============================================================================

export const BUSINESS_CATEGORIES = [
  { value: 'pharmacy', label: 'Pharmacy', color: '#3b82f6' },
  { value: 'medical', label: 'Medical', color: '#10b981' },
  { value: 'van', label: 'Van', color: '#f59e0b' },
  { value: 'others', label: 'Others', color: '#6b7280' },
] as const;

// ============================================================================
// ACHIEVEMENT THRESHOLDS
// ============================================================================

export const ACHIEVEMENT_THRESHOLDS = {
  EXCELLENT: 100,  // 100%+
  GOOD: 75,        // 75-99%
  AVERAGE: 50,     // 50-74%
  POOR: 25,        // 25-49%
  CRITICAL: 0,     // 0-24%
} as const;

// ============================================================================
// COLOR MAPPING
// ============================================================================

export const ACHIEVEMENT_COLORS = {
  EXCELLENT: '#10b981',  // Green
  GOOD: '#06b6d4',       // Cyan
  AVERAGE: '#f59e0b',    // Amber
  POOR: '#f97316',       // Orange
  CRITICAL: '#ef4444',   // Red
} as const;

/**
 * Get achievement color based on percentage
 */
export const getAchievementColor = (percentage: number): string => {
  if (percentage >= ACHIEVEMENT_THRESHOLDS.EXCELLENT) return ACHIEVEMENT_COLORS.EXCELLENT;
  if (percentage >= ACHIEVEMENT_THRESHOLDS.GOOD) return ACHIEVEMENT_COLORS.GOOD;
  if (percentage >= ACHIEVEMENT_THRESHOLDS.AVERAGE) return ACHIEVEMENT_COLORS.AVERAGE;
  if (percentage >= ACHIEVEMENT_THRESHOLDS.POOR) return ACHIEVEMENT_COLORS.POOR;
  return ACHIEVEMENT_COLORS.CRITICAL;
};

/**
 * Get achievement label based on percentage
 */
export const getAchievementLabel = (percentage: number): string => {
  if (percentage >= ACHIEVEMENT_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (percentage >= ACHIEVEMENT_THRESHOLDS.GOOD) return 'Good';
  if (percentage >= ACHIEVEMENT_THRESHOLDS.AVERAGE) return 'Average';
  if (percentage >= ACHIEVEMENT_THRESHOLDS.POOR) return 'Poor';
  return 'Critical';
};

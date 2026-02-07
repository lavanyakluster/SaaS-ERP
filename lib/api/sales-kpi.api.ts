/**
 * Sales KPI API
 * Endpoints for fetching sales KPI data
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface SalesKpiData {
  branch: string;
  todaySales: number;
  yesterdaySales: number;
  lastWeekdayAvg: number;
  dayPerc: number;
  forecastNextDay: number;
  thisMonthSales: number;
  lastMonthSales: number;
  monthPerc: number | null;
  forecastNextMonth: number;
  monthFlag: string; // "Red", "Green", etc.
  thisYearSales: number;
  lastYearSales: number;
  yearPerc: number;
  forecastNextYear: number;
  yearFlag: string; // "Red", "Green", etc.
}

/**
 * Sales KPI Request Parameters
 */
export interface SalesKpiParams {
  year: string; // ✅ Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Sales KPI data for all branches
 * @param params - Year parameter
 */
export const getSalesKpi = async (params: SalesKpiParams): Promise<SalesKpiData[]> => {
  const response = await apiClient.get<SalesKpiData[]>('/salesKpi', {
    params: {
      year: params.year, // ✅ Add year parameter
    },
  });
  return response.data;
};
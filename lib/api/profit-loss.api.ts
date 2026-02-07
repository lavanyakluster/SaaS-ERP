/**
 * Profit & Loss API
 * Income, Expense, and Profit data endpoints
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Income/Expense/Profit Response from API
 */
export interface ProfitLossData {
  yRMTH: string; // "2026/01"
  fIRST_DAY_OF_DATE: string; // ISO date string
  lAST_DAY_OF_DATE: string; // ISO date string
  yR: number; // Year
  mTH: number; // Month (1-12)
  iNCOME: number; // Total income
  eXPENSE: number; // Total expense
  pROFIT: number; // Total profit (income - expense)
}

/**
 * Standardized API Response
 */
export interface ProfitLossResponse {
  success: boolean;
  data: ProfitLossData[];
  message?: string;
}

/**
 * Request parameters for fetching profit/loss data
 */
export interface ProfitLossRequest {
  fromDt: string; // Date in YYYY-MM-DD format
  toDt: string; // Date in YYYY-MM-DD format
  brCode: string; // Branch code (e.g., "005", "S01") - use "0" for all branches
  year: string; // ✅ Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Income/Expense/Profit data for date range and branch
 * 
 * @param params - fromDt, toDt, brCode, and year
 * @returns Promise with profit/loss data
 * 
 * @example
 * const data = await getProfitLossData({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-31',
 *   brCode: '005',
 *   year: '2026'
 * });
 */
export const getProfitLossData = async (
  params: ProfitLossRequest
): Promise<ProfitLossData[]> => {
  try {
    console.log('📊 Fetching profit/loss data:', params);

    const response = await apiClient.get<ProfitLossData[]>('/incomeExPProfit', {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode, // Always send brCode (use "0" for all branches)
        year: params.year, // ✅ Add year parameter
      },
    });

    console.log('✅ Profit/loss data received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch profit/loss data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch profit/loss data');
  }
};

/**
 * Calculate total metrics from profit/loss data
 * 
 * @param data - Array of profit/loss data
 * @returns Aggregated totals
 */
export const calculateTotals = (data: ProfitLossData[]) => {
  if (!data || data.length === 0) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      totalProfit: 0,
      profitMargin: 0,
    };
  }

  const totalIncome = data.reduce((sum, item) => sum + item.iNCOME, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.eXPENSE, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.pROFIT, 0);
  const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    totalProfit,
    profitMargin,
  };
};

/**
 * Format profit/loss data for charts
 * 
 * @param data - Array of profit/loss data
 * @returns Formatted data for chart visualization
 */
export const formatChartData = (data: ProfitLossData[]) => {
  return data.map((item) => ({
    month: item.yRMTH,
    income: item.iNCOME,
    expense: item.eXPENSE,
    profit: item.pROFIT,
    year: item.yR,
    monthNumber: item.mTH,
  }));
};
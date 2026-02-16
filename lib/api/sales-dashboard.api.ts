/**
 * Sales Dashboard API
 * 
 * Endpoints:
 * - GET /salesDashboard - Get sales dashboard data with monthly sales, rep sales, and branch analysis
 */

import { apiClient } from './client';

// ===========================
// TypeScript Interfaces
// ===========================

/**
 * Monthly Sales Data
 */
export interface MonthlySalesData {
  YRMTH: string;        // e.g., "2025/05"
  YR: number;           // Year: 2025
  MTH: number;          // Month: 5
  Sale: number;         // Total sales for the month
  Profit: number;       // Total profit for the month
}

/**
 * Sales Representative Data
 */
export interface SalesRepData {
  Code: string;         // Rep code: "15", "25", etc.
  SalesMan: string;     // Rep name: "ABDUL AZEEZ"
  Sale: number;         // Total sales
  Profit: number;       // Total profit
}

/**
 * Branch Sales Data
 */
export interface BranchSalesData {
  BranchCode: string;           // e.g., "S01"
  BranchName: string;           // e.g., "AL BADAR DRUGS STORE L.L.C"
  ThisYearSale: number;         // Current year sales
  ThisYearProfit: number;       // Current year profit
  LastYearSale: number;         // Last year sales
  LastYearProfit: number;       // Last year profit
}

/**
 * Branch Profit Data (same structure as BranchSalesData)
 * Used for profit analysis tab
 */
export type BranchProfitData = BranchSalesData;

/**
 * Sales Dashboard API Response
 */
export interface SalesDashboardResponse {
  Table: MonthlySalesData[];      // Monthly sales data
  Table1: SalesRepData[];         // Sales rep data
  Table2: BranchSalesData[];      // Branch sales data
}

/**
 * Sales Dashboard Request Parameters
 */
export interface SalesDashboardParams {
  fromDt: string;   // Format: YYYY-MM-DD
  toDt: string;     // Format: YYYY-MM-DD
  brCode: string;   // Branch code - use "0" for all branches
  year: string;     // ✅ Year parameter (e.g., "2026")
}

// ===========================
// API Functions
// ===========================

/**
 * Get Sales Dashboard Data
 * 
 * @param params - Date range, branch code, and year
 * @returns Sales dashboard data with monthly sales, rep sales, and branch analysis
 * 
 * @example
 * const data = await getSalesDashboard({
 *   fromDt: '2025-01-01',
 *   toDt: '2026-01-15',
 *   brCode: '0',  // "0" for all branches, or specific branch code like "S01"
 *   year: '2026'
 * });
 */
export const getSalesDashboard = async (
  params: SalesDashboardParams
): Promise<SalesDashboardResponse> => {
  const response = await apiClient.get<SalesDashboardResponse>('/salesDashboard', {
    params: {
      fromDt: params.fromDt,
      toDt: params.toDt,
      brCode: params.brCode, // Always send brCode (use "0" for all branches)
      year: params.year, // ✅ Add year parameter
    },
  });

  return response.data;
};
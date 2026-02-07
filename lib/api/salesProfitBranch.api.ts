/**
 * Sales Profit Branch API
 * 
 * ✅ Enterprise Features:
 * - Monthly sales/profit data (Table)
 * - Salesman-wise analysis (Table1)
 * - Branch-wise analysis (Table2)
 * - Multi-tenant architecture
 * - Dynamic date and branch filtering
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Monthly sales/profit data
 */
export interface MonthlySalesProfit {
  YRMTH: string;
  YR: number;
  MTH: number;
  Sale: number;
  Profit: number;
}

/**
 * Salesman-wise data
 */
export interface SalesmanData {
  Code: string;
  SalesMan: string;
  Sale: number;
  Profit: number;
}

/**
 * Branch-wise data
 */
export interface BranchData {
  BranchCode: string;
  BranchName: string;
  ThisYearSale: number;
  ThisYearProfit: number;
  LastYearSale: number;
  LastYearProfit: number;
}

/**
 * API Response
 */
export interface SalesProfitBranchResponse {
  Table: MonthlySalesProfit[];
  Table1: SalesmanData[];
  Table2: BranchData[];
}

/**
 * API Parameters
 */
export interface SalesProfitBranchParams {
  fromDt: string;
  toDt: string;
  brCode: string;
  year: string; // ✅ Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get sales profit branch data
 */
export const getSalesProfitBranch = async (
  params: SalesProfitBranchParams
): Promise<SalesProfitBranchResponse> => {
  const response = await apiClient.get<SalesProfitBranchResponse>('/salesProfitBranch', {
    params: {
      fromDt: params.fromDt,
      toDt: params.toDt,
      brCode: params.brCode,
      year: params.year, // ✅ Add year parameter
    },
  });
  
  return response.data;
};
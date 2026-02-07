/**
 * Sales Summary API
 * Endpoints for sales summary reports
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Sales Summary Item from /sales-summary endpoint
 */
export interface SalesSummaryItem {
  SLNO: number;
  TYP: string;        // Type: " CASH", " CARD", " CASH SR", etc.
  DES: string;        // Description: "CASH SALES", "CARD SALES", etc.
  SH_AMT: number | null;
  SH_TAX: number | null;
  SH_DISAMT: number | null;
  NOS: number;        // Number of sales
  PV: number | null;
  SH_TYP: string | null;
  SHI_DTT: string | null;
}

/**
 * Sales Summary Response with Table wrapper
 */
export interface SalesSummaryResponse {
  Table: SalesSummaryItem[];
}

/**
 * Dashboard Sales Summary Item from /dash-sale-summary endpoint
 * Updated based on actual API response
 */
export interface DashSalesSummaryItem {
  branchCode?: string;    // Branch code
  branchName?: string;    // Branch name (if available)
  cashNet?: number;       // Cash net amount
  cashWet?: number;       // Cash wet amount (with tax?)
  cardNet?: number;       // Card net amount
  cardWet?: number;       // Card wet amount (with tax?)
  creditNet?: number;     // Credit net amount
  creditWet?: number;     // Credit wet amount (with tax?)
  insuranceNet?: number;  // Insurance net amount
  insuranceWet?: number;  // Insurance wet amount (with tax?)
  totalBills?: number;    // Total number of bills
  redeemedPoints?: number; // Redeemed points
  
  // Legacy fields (keeping for backward compatibility)
  sLNO?: number;
  tYP?: string;
  dES?: string;
  sH_AMT?: number | null;
  sH_TAX?: number | null;
  sH_DISAMT?: number | null;
  nOS?: number;
  pV?: number | null;
  sH_TYP?: string | null;
  sHI_DTT?: string | null;
}

/**
 * Parameters for sales summary API calls
 */
export interface SalesSummaryParams {
  dtf: string;      // From date (YYYY-MM-DD)
  dtt: string;      // To date (YYYY-MM-DD)
  brcode: string;   // Branch code ("0" for all branches)
  shift?: string;   // Shift number (optional, default "0" for all shifts)
  year: string;     // ✅ Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Sales Summary
 * @param params - Filter parameters including year
 * @returns Sales summary data with Table wrapper
 * 
 * @example
 * const data = await getSalesSummary({
 *   dtf: '2025-01-01',
 *   dtt: '2025-01-01',
 *   brcode: '0',
 *   shift: '0',
 *   year: '2026'
 * });
 */
export const getSalesSummary = async (
  params: SalesSummaryParams
): Promise<SalesSummaryResponse> => {
  const response = await apiClient.get<SalesSummaryResponse>('/sales-summary', {
    params: {
      dtf: params.dtf,
      dtt: params.dtt,
      brcode: params.brcode,
      shift: params.shift || '0',
      year: params.year, // ✅ Add year parameter
    },
  });

  return response.data;
};

/**
 * Get Dashboard Sales Summary
 * @param params - Filter parameters including year (without shift)
 * @returns Dashboard sales summary data (direct array)
 * 
 * @example
 * const data = await getDashSalesSummary({
 *   dtf: '2025-01-01',
 *   dtt: '2025-01-01',
 *   brcode: '0',
 *   year: '2026'
 * });
 */
export const getDashSalesSummary = async (
  params: Omit<SalesSummaryParams, 'shift'>
): Promise<DashSalesSummaryItem[]> => {
  const response = await apiClient.get<DashSalesSummaryItem[]>('/dash-sale-summary', {
    params: {
      dtf: params.dtf,
      dtt: params.dtt,
      brcode: params.brcode,
      year: params.year, // ✅ Add year parameter
    },
  });

  return response.data;
};

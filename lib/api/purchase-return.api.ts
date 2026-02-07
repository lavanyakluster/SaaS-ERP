/**
 * Purchase Return API
 * Endpoint for purchase return reports
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Purchase Return Item from /purchase-return endpoint
 */
export interface PurchaseReturnItem {
  Branch: string;           // Branch code (e.g., "M05", "M06")
  Date: string;             // Return date (ISO format)
  DocNo: string;            // Document number (e.g., "PR-26-M05-1")
  Code: string;             // Supplier code
  Supplier: string;         // Supplier name
  ProdValue: number;        // Product value
  Discount: number;         // Discount amount
  Tax: number;              // Tax amount
  AddAmt: number;           // Additional amount / Expense
  Less: number;             // Less amount
  Coin: number;             // Coin adjustment
  Net: number;              // Net amount
  RefBillNo: string;        // Reference bill number
  RefBillDate: string;      // Reference bill date (ISO format)
  Id: number;               // Transaction ID
  Remark: string;           // Remarks
  EnteredBy: string;        // User who entered the return
}

/**
 * Parameters for purchase return API
 */
export interface PurchaseReturnParams {
  fromDt: string;   // From date (YYYY-MM-DD)
  toDt: string;     // To date (YYYY-MM-DD)
  brCode: string;   // Branch code ("0" for all branches)
  year: string;     // Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Purchase Return
 * @param params - Filter parameters including year
 * @returns Purchase return data (direct array)
 * 
 * @example
 * const data = await getPurchaseReturn({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-30',
 *   brCode: '0',
 *   year: '2026'
 * });
 */
export const getPurchaseReturn = async (
  params: PurchaseReturnParams
): Promise<PurchaseReturnItem[]> => {
  console.log('📊 Purchase Return API Call:', params);

  const response = await apiClient.get<PurchaseReturnItem[]>('/purchase-return', {
    params: {
      fromDt: params.fromDt,
      toDt: params.toDt,
      brCode: params.brCode,
      year: params.year,
    },
  });

  console.log('✅ Purchase Return API Response:', {
    count: response.data?.length || 0,
    firstItem: response.data?.[0],
  });

  return response.data;
};

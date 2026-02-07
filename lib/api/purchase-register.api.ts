/**
 * Purchase Register API
 * Endpoints for purchase register reports
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Purchase Register Item from /purchase-register endpoint
 */
export interface PurchaseRegisterItem {
  Branch: string;                // Branch code (e.g., "M01", "M06")
  'Bill No.': string;            // Bill number
  Grn: string;                   // GRN number (e.g., "26-M01-1")
  'Prod Value': number;          // Product value
  Date: string;                  // Purchase date (ISO format)
  'Bill Date': string;           // Bill date (ISO format)
  Supplier: string;              // Supplier name
  Party: string;                 // Party name
  SalesMan: string;              // Salesman code
  RefNo: string;                 // Reference number
  Expense: number;               // Expense amount
  Net: number;                   // Net amount
  Dis: number;                   // Discount
  Tax: number;                   // Tax amount
  RoundOff: Record<string, any>; // Round off (can be empty object)
  ID: number;                    // Transaction ID (shid for detail API)
  Remark: string;                // Remarks
}

/**
 * Purchase Register Detail Item from /purchase-register-det endpoint
 */
export interface PurchaseRegisterDetailItem {
  RD_GRN: string;         // GRN number
  RD_QTY: number;         // Quantity
  RD_FRQ: number;         // Free quantity
  RD_PRT: number;         // Purchase rate
  RD_SRT: number;         // Sale rate
  RD_UN: number;          // Units
  RD_NRT: number;         // Net rate
  RD_REPL: number;        // Replace
  RD_PC: string;          // Product code
  PM_MBCOD: string;       // Barcode
  PM_UNP: string;         // Unit (e.g., "PC", "PKT")
  PM_NM: string;          // Product name
  RD_AMT: number;         // Amount
  RD_DISAMT: number;      // Discount amount
  RD_BN: string;          // Batch number
  RD_EXP: string;         // Expiry date (MMYY format)
  RD_BRCOD: string;       // Branch code
  RD_RHID: number;        // Header ID (links to parent)
  RD_PTAX: number;        // Purchase tax percentage
  RD_TAXAMT: number;      // Tax amount
}

/**
 * Parameters for purchase register API
 */
export interface PurchaseRegisterParams {
  fromDt: string;   // From date (YYYY-MM-DD)
  toDt: string;     // To date (YYYY-MM-DD)
  brCode: string;   // Branch code ("0" for all branches)
  year: string;     // Year parameter (e.g., "2026")
}

/**
 * Parameters for purchase register detail API
 */
export interface PurchaseRegisterDetailParams {
  shid: number;     // Transaction ID from parent record
  brCode: string;   // Branch code
  year: string;     // Year parameter (e.g., "2026")
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get Purchase Register
 * @param params - Filter parameters including year
 * @returns Purchase register data (direct array)
 * 
 * @example
 * const data = await getPurchaseRegister({
 *   fromDt: '2026-01-01',
 *   toDt: '2026-01-30',
 *   brCode: '0',
 *   year: '2026'
 * });
 */
export const getPurchaseRegister = async (
  params: PurchaseRegisterParams
): Promise<PurchaseRegisterItem[]> => {
  console.log('📊 Purchase Register API Call:', params);

  const response = await apiClient.get<PurchaseRegisterItem[]>('/purchase-register', {
    params: {
      fromDt: params.fromDt,
      toDt: params.toDt,
      brCode: params.brCode,
      year: params.year,
    },
  });

  console.log('✅ Purchase Register API Response:', {
    count: response.data?.length || 0,
    firstItem: response.data?.[0],
  });

  return response.data;
};

/**
 * Get Purchase Register Detail
 * @param params - Detail parameters including year
 * @returns Purchase register detail data (direct array)
 * 
 * @example
 * const data = await getPurchaseRegisterDetail({
 *   shid: 7127,
 *   brCode: '017',
 *   year: '2026'
 * });
 */
export const getPurchaseRegisterDetail = async (
  params: PurchaseRegisterDetailParams
): Promise<PurchaseRegisterDetailItem[]> => {
  console.log('📊 Purchase Register Detail API Call:', params);

  const response = await apiClient.get<PurchaseRegisterDetailItem[]>('/purchase-register-det', {
    params: {
      shid: params.shid,
      brCode: params.brCode,
      year: params.year,
    },
  });

  console.log('✅ Purchase Register Detail API Response:', {
    count: response.data?.length || 0,
    firstItem: response.data?.[0],
  });

  return response.data;
};

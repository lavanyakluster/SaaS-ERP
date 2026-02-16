/**
 * Accounts API
 * Handles account dashboard data fetching
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface AccountItem {
  MainGroup: string;
  Particulars: string;
  Amount: number;
}

export interface FinancialRatios {
  ROA: string;      // Return on Assets
  WCR: string;      // Working Capital Ratio
  ROE: string;      // Return on Equity
  DER: string;      // Debt to Equity Ratio
}

export interface AccountsResponse {
  Table: AccountItem[];
  Table1: any[];
  Table2: any[];
  Table3: any[];
  Table4: any[];
  Table5: FinancialRatios[];
}

export interface AccountsParams {
  fromDt: string;        // Format: YYYY-MM-DD
  toDt: string;          // Format: YYYY-MM-DD
  brCode: string;        // Branch code
  grpCode: string;       // Group code (can be empty with '')
  checkedValue: number;  // 1 or 0
  acdtf: string;         // Accounting date from (Format: YYYY-MM-DD)
  cum: number;           // Cumulative flag (1 or 0)
  year: string;          // ✅ Year parameter (e.g., "2026")
}

// ✅ NEW: Cumulation Request Parameters
export interface CumulationParams {
  fromDt: string;        // Format: YYYY-MM-DD
  toDt: string;          // Format: YYYY-MM-DD
  brCode: string;        // Branch code
  year: string;          // Year parameter (e.g., "2026")
}

// ✅ NEW: Cumulation Response
export interface CumulationResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * ✅ Get Accounts Data
 * Fetches balance sheet, P&L, and financial ratios data
 */
export async function getAccounts(params: AccountsParams): Promise<AccountsResponse> {
  try {
    console.log('🔄 Fetching accounts data:', params);

    const response = await apiClient.get<AccountsResponse>('/accounts', {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode,
        grpCode: params.grpCode,
        checkedValue: params.checkedValue,
        acdtf: params.acdtf,
        cum: params.cum,
        year: params.year,  // ✅ Add year parameter
      },
    });

    console.log('✅ Accounts data fetched successfully:', {
      tableItems: response.data.Table?.length || 0,
      hasRatios: response.data.Table5?.length > 0,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch accounts data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch accounts data');
  }
}

/**
 * ✅ NEW: Manual Cumulation
 * Triggers manual cumulation for account data
 */
export async function performManualCumulation(params: CumulationParams): Promise<CumulationResponse> {
  try {
    console.log('🔄 Performing manual cumulation:', params);

    const response = await apiClient.post<CumulationResponse>('/accounts/cumulate', {
      fromDt: params.fromDt,
      toDt: params.toDt,
      brCode: params.brCode,
      year: params.year,
    });

    console.log('✅ Manual cumulation completed successfully');

    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to perform manual cumulation:', error);
    throw new Error(error.response?.data?.message || 'Failed to perform manual cumulation');
  }
}

/**
 * ✅ Parse Accounts Data into Assets and Liabilities
 * Separates the table data into logical sections
 */
export interface ParsedAccountsData {
  assets: AccountItem[];
  liabilities: AccountItem[];
  totalAssets: number;
  totalLiabilities: number;
  netProfit: number;
  ratios: FinancialRatios | null;
}

export function parseAccountsData(response: AccountsResponse): ParsedAccountsData {
  const assets: AccountItem[] = [];
  const liabilities: AccountItem[] = [];
  let totalAssets = 0;
  let totalLiabilities = 0;
  let netProfit = 0;
  let isLiabilitySection = false;

  // Parse Table data
  response.Table.forEach((item) => {
    // Check if we're entering liabilities section
    if (item.Particulars === 'LIABILITIES') {
      isLiabilitySection = true;
      return;
    }

    // Skip section headers
    if (item.Particulars === 'ASSET' || item.Particulars === 'CURRENT ASSETS') {
      return;
    }

    // Handle totals
    if (item.Particulars === 'Total') {
      if (isLiabilitySection) {
        totalLiabilities = item.Amount;
      } else {
        totalAssets = item.Amount;
      }
      return;
    }

    // Handle net profit
    if (item.Particulars === 'Net Profit') {
      netProfit = item.Amount;
    }

    // Add to appropriate array
    if (isLiabilitySection) {
      liabilities.push(item);
    } else {
      assets.push(item);
    }
  });

  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netProfit,
    ratios: response.Table5?.[0] || null,
  };
}
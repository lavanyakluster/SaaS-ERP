/**
 * Purchase Register Types
 * TypeScript interfaces for Purchase Register APIs
 */

/**
 * Purchase Register Master Record
 * Response from /api/purchase-register
 */
export interface PurchaseRegisterRecord {
  Branch: string;
  'Bill No.': string;
  Grn: string; // GRN number
  'Prod Value': number;
  Date: string;
  'Bill Date': string;
  Supplier: string;
  Party: string;
  SalesMan: string;
  RefNo: string;
  Expense: number;
  Net: number;
  Dis: number;
  Tax: number;
  RoundOff: Record<string, any>;
  ID: number;
  Remark: string;
}

/**
 * Purchase Register Detail Record
 * Response from /api/purchase-register-det
 */
export interface PurchaseRegisterDetailItem {
  RD_GRN: string;
  RD_QTY: number;
  RD_FRQ: number;
  RD_PRT: number;
  RD_SRT: number;
  RD_UN: number;
  RD_NRT: number;
  RD_REPL: number;
  RD_PC: string;
  PM_MBCOD: string;
  PM_UNP: string;
  PM_NM: string;
  RD_AMT: number;
  RD_DISAMT: number;
  RD_BN: string;
  RD_EXP: string;
  RD_BRCOD: string;
  RD_RHID: number;
  RD_PTAX: number;
  RD_TAXAMT: number;
}

/**
 * API Request Parameters
 */
export interface PurchaseRegisterParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string; // Format: YYYY-MM-DD
  brCode: string;
  year: string; // Year parameter (e.g., "2026")
}

export interface PurchaseRegisterDetailParams {
  shid: number; // Transaction ID
  brCode: string;
  year: string; // Year parameter (e.g., "2026")
}

/**
 * API Response Types
 */
export type PurchaseRegisterResponse = PurchaseRegisterRecord[];
export type PurchaseRegisterDetailResponse = PurchaseRegisterDetailItem[];

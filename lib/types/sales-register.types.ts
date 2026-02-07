/**
 * Sales Register Types
 * TypeScript interfaces for Sales Register APIs
 */

/**
 * Sales Register Master Record
 * Response from /api/sales-register
 */
export interface SalesRegisterRecord {
  Branch: string;
  BillNo: string;
  lpoNo: string;
  lpoDate: string;
  Date: string;
  Code: string;
  Party: string;
  SalesMan: string;
  RefNo: string;
  RefDate: string;
  Net: number;
  Discount: number;
  Tax: number;
  RoundOff: number;
  ID: number;
  Remark: string;
}

/**
 * Sales Register Detail Record
 * Response from /api/sales-register-det
 */
export interface SalesRegisterDetailRecord {
  BillNo: string;
  Code: string;
  Barcode: string;
  Product: string;
  Rate: number;
  Qty: number;
  Free: Record<string, unknown> | number;
  Pack: number;
  UOM: number;
  Amount: number;
  Discount: number;
  Tax: number;
  Net: number;
}

/**
 * API Request Parameters
 */
export interface SalesRegisterParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string; // Format: YYYY-MM-DD
  brCode: string;
  year: string; // ✅ Added year parameter (e.g., "2026")
}

export interface SalesRegisterDetailParams {
  shid: number; // Sales Header ID
  brCode: string;
  year: string; // ✅ Added year parameter (e.g., "2026")
}

/**
 * API Response Types
 */
export type SalesRegisterResponse = SalesRegisterRecord[];
export type SalesRegisterDetailResponse = SalesRegisterDetailRecord[];
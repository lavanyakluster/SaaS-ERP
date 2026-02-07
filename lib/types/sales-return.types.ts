/**
 * Sales Return Types
 * TypeScript interfaces for Sales Return APIs
 */

/**
 * Sales Return Master Record
 * Response from /api/sales-return
 */
export interface SalesReturnRecord {
  Branch: string;
  BillNo: string;
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
  Remark: Record<string, unknown> | string;
}

/**
 * Sales Return Detail Record
 * Response from /api/sales-return-det
 */
export interface SalesReturnDetailRecord {
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
export interface SalesReturnParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string; // Format: YYYY-MM-DD
  brCode: string;
  year: string; // ✅ Added year parameter (e.g., "2026")
}

export interface SalesReturnDetailParams {
  shid: number; // Sales Header ID
  brCode: string;
  year: string; // ✅ Added year parameter (e.g., "2026")
}

/**
 * API Response Types
 */
export type SalesReturnResponse = SalesReturnRecord[];
export type SalesReturnDetailResponse = SalesReturnDetailRecord[];
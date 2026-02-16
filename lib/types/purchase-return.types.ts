/**
 * Purchase Return Types
 * TypeScript interfaces for Purchase Return APIs
 */

/**
 * Purchase Return Master Record
 * Response from /api/purchase-return
 */
export interface PurchaseReturnRecord {
  Branch: string;
  Date: string;
  DocNo: string; // GRN/Document number
  Code: string;
  Supplier: string;
  ProdValue: number;
  Discount: number;
  Tax: number;
  AddAmt: number;
  Less: number;
  Coin: number;
  Net: number;
  RefBillNo: string;
  RefBillDate: string;
  Id: number;
  Remark: string;
  EnteredBy: string;
}

/**
 * API Request Parameters
 */
export interface PurchaseReturnParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string; // Format: YYYY-MM-DD
  brCode: string;
  year: string; // Year parameter (e.g., "2026")
}

/**
 * API Response Types
 */
export type PurchaseReturnResponse = PurchaseReturnRecord[];

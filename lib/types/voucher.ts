/**
 * Voucher Type Definitions
 */

import type { Status } from "./common";

export type VoucherType =
  | "Receipt"
  | "Payment"
  | "Contra"
  | "Journal"
  | "receipt"
  | "payment"
  | "contra"
  | "journal"
  | "invoice"
  | "Invoice";

export type PaymentMode = "cash" | "bank" | "card" | "online";

export interface VoucherLine {
  id: number;
  accountCode: string;
  accountName: string;
  description: string;
  refNo: string;
  amount: number;
  taxCode?: string;
  taxAmount?: number;
  remarks?: string;
}

export interface Voucher {
  id: string;
  voucherNo: string;
  date: string;
  type: VoucherType;
  party: string;
  partyId?: string;
  branch: string;
  branchId: string;
  lines: VoucherLine[];
  totalAmount: number;
  taxAmount?: number;
  grandTotal?: number;
  narration: string;
  status: Status;
  paymentMode?: PaymentMode;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVoucherDTO {
  date: string;
  type: VoucherType;
  party: string;
  branchId: string;
  lines: Omit<VoucherLine, "id">[];
  narration: string;
  paymentMode?: PaymentMode;
}

export interface UpdateVoucherDTO
  extends Partial<CreateVoucherDTO> {
  id: string;
}

export interface VoucherFilters {
  type?: VoucherType;
  status?: Status;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

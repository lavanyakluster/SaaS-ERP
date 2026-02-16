/**
 * Firm & Branch Type Definitions
 */

export interface Firm {
  id: string;
  name: string;
  location: string;
  branches: number;
  currency: string;
  taxRegistration: string;
  logo?: string;
  address?: string;
}

export interface FinancialYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: 'Current' | 'Active' | 'Closed';
  firmId: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  code: string;
  isHeadOffice: boolean;
  firmId: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface FirmSelectionData {
  firm: Firm;
  financialYear: FinancialYear;
}

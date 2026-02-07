/**
 * Ledger/Account Head Configuration
 * These represent the chart of accounts for ledger restrictions
 */

export interface Ledger {
  id: string;
  code: string;
  name: string;
  type: 'customer' | 'supplier' | 'general' | 'bank' | 'cash';
}

export const DEFAULT_LEDGERS: Ledger[] = [
  { id: 'QR116', code: 'QR116', name: '51 MINIMART RAYYAN cgf', type: 'customer' },
  { id: 'S001', code: 'S001', name: 'GLOBAL STALLION SYSTEMS', type: 'supplier' },
  { id: 'QR164', code: 'QR164', name: 'Gulf Medical Company', type: 'customer' },
  { id: 'B001', code: 'B001', name: 'Doha Bank - Main Account', type: 'bank' },
  { id: 'C001', code: 'C001', name: 'Cash in Hand - HQ', type: 'cash' },
  { id: 'QR201', code: 'QR201', name: 'Al Meera Consumer Goods', type: 'customer' },
  { id: 'S045', code: 'S045', name: 'Qatar Steel Company', type: 'supplier' },
  { id: 'QR305', code: 'QR305', name: 'Hamad Medical Corporation', type: 'customer' },
  { id: 'S102', code: 'S102', name: 'Al Jazeera Trading LLC', type: 'supplier' },
  { id: 'B002', code: 'B002', name: 'Qatar National Bank - Current', type: 'bank' },
  { id: 'QR420', code: 'QR420', name: 'Ooredoo Qatar', type: 'customer' },
  { id: 'S156', code: 'S156', name: 'Gulf Equipment Trading', type: 'supplier' },
  { id: 'C002', code: 'C002', name: 'Cash in Hand - Branch 1', type: 'cash' },
  { id: 'QR511', code: 'QR511', name: 'Vodafone Qatar', type: 'customer' },
  { id: 'S203', code: 'S203', name: 'Al Futtaim Motors', type: 'supplier' },
];

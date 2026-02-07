/**
 * Branches Configuration
 * Hardcoded branch data for SmartBook ERP
 */

export interface Branch {
  id: string;
  name: string;
  businessUnit: number;
}

/**
 * All available branches in the system
 * Based on actual branch data from the organization
 */
export const BRANCHES: Branch[] = [
  { id: 'S01', name: 'AL BADAR DRUGS STORE L.L.C', businessUnit: 1 },
  { id: '001', name: 'NOOR AL SALAMA PHARMACY', businessUnit: 10 },
  { id: '002', name: 'AL SALAMA PHARMACY', businessUnit: 4 },
  { id: '003', name: 'DAR AL SHIFA PHARMACY', businessUnit: 10 },
  { id: '004', name: 'AL MANAMA PHARMACY', businessUnit: 2 },
  { id: '005', name: 'AL HALA PHARMACY', businessUnit: 10 },
  { id: '006', name: 'AL ZAIN PHARMACY', businessUnit: 3 },
  { id: '007', name: 'NEW RUKIN AL SHIFAA PHARMACY', businessUnit: 9 },
  { id: '008', name: 'NOOR AL SALAMA PHARAMACY BR', businessUnit: 8 },
  { id: '009', name: 'BADR AL SALAMA PHARMACY - DIBBA', businessUnit: 6 },
  { id: '010', name: 'KOOKH AL SALAMA PHARMACY', businessUnit: 3 },
  { id: '011', name: 'BADER AL SALAMA PHARMACY', businessUnit: 3 },
  { id: '013', name: 'BADER AL SALAMA PHARMACY BR1', businessUnit: 3 },
  { id: '014', name: 'AL SUHAILA PHARMACY', businessUnit: 2 },
  { id: '015', name: 'WADI AL MADINA PHARMACY', businessUnit: 2 },
  { id: '016', name: 'AL ISHRAQ PHARMACY LLC', businessUnit: 10 },
  { id: '017', name: 'AL KHAIR PHARMACY', businessUnit: 10 },
  { id: '021', name: 'AL SUHAILA PHARMACY BR1', businessUnit: 2 },
  { id: '022', name: 'AL SUHAILA PHARMACY BR2', businessUnit: 2 },
  { id: '024', name: 'RUMAN PHARMACY (S.P.S - L.L.C)', businessUnit: 10 },
  { id: '025', name: 'RUMAN PHARMACY L.L.C S.P SHJ BR', businessUnit: 10 },
  { id: '026', name: 'FALCON MED PHARMACY', businessUnit: 2 },
  { id: '027', name: 'BADER AL SALAMA PHARMACY BR2', businessUnit: 3 },
  { id: '028', name: 'RUMAN PHARMACY BR1', businessUnit: 10 },
  { id: '029', name: 'RUMAN PHARMACY (S.P.S-LLC)-BR2', businessUnit: 10 },
  { id: '030', name: 'RUMAN PHARMACY - NAKHEEL', businessUnit: 10 },
  { id: '031', name: 'BADR AL SALAMA PHARMACY - BIDIYA', businessUnit: 6 },
  { id: 'E01', name: 'Expiry Store', businessUnit: 1 },
];

/**
 * Get branch by ID
 */
export const getBranchById = (id: string): Branch | undefined => {
  return BRANCHES.find(branch => branch.id === id);
};

/**
 * Get branches by business unit
 */
export const getBranchesByBusinessUnit = (businessUnit: number): Branch[] => {
  return BRANCHES.filter(branch => branch.businessUnit === businessUnit);
};

/**
 * Get all business units
 */
export const getAllBusinessUnits = (): number[] => {
  return Array.from(new Set(BRANCHES.map(branch => branch.businessUnit))).sort((a, b) => a - b);
};

/**
 * Search branches by name or ID
 */
export const searchBranches = (query: string): Branch[] => {
  const searchTerm = query.toLowerCase();
  return BRANCHES.filter(
    branch =>
      branch.name.toLowerCase().includes(searchTerm) ||
      branch.id.toLowerCase().includes(searchTerm)
  );
};

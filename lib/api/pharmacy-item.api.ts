import { apiClient } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://130.94.45.215/V1/api';

/**
 * ✅ Pharmacy Item Dashboard API Response Interface
 */
export interface PharmacyItem {
  itemID: number;
  itemName: string;
  itemCategory: string;
  brand: string;
  supplier: string | null;
  totalSold: number;
  totalRevenue: number;
  averageUnitPrice: number;
  grossMargin: number;
  currentStock: number;
  daysOfSupply: number;
  inventoryTurnover: number | null;
  expiryRisk: string;
  nearestExpiryDate: string | null;
  aBCClass: string;
  lastSaleDate: string;
  reorderStatus: string;
}

export interface PharmacyExpiryItem {
  sT_COD: string;
  itemName: string | null;
  cT_NM: string | null;
  company: string | null;
  supplier: string | null;
  stockInUnits: number | null;
  expiryMMYY: string;
  expiryStatus: string;
}

export interface PharmacyItemDashboardResponse {
  table1: PharmacyItem[];
  table2: PharmacyExpiryItem[];
}

export interface PharmacyItemDashboardParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string;   // Format: YYYY-MM-DD
  brCode: string; // Branch code
  year: string;   // ✅ Year parameter (e.g., "2026")
}

/**
 * ✅ Fetch Pharmacy Item Dashboard Data
 * 
 * @param params - Date range, branch code, and year
 * @returns Pharmacy item dashboard data with inventory and expiry information
 */
export const getPharmacyItemDashboard = async (
  params: PharmacyItemDashboardParams
): Promise<{ items: PharmacyItem[]; expiryItems: PharmacyExpiryItem[] }> => {
  const response = await apiClient.get<PharmacyItemDashboardResponse>(
    '/pharmacy-itemDashboard',
    {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode,
        year: params.year, // ✅ Add year parameter
      },
    }
  );

  return {
    items: response.data.table1 || [],
    expiryItems: response.data.table2 || [],
  };
};
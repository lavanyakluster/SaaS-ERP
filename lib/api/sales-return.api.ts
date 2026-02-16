/**
 * Sales Return API Service
 * Service layer for sales return endpoints
 */

import { apiClient } from './client';
import type {
  SalesReturnParams,
  SalesReturnDetailParams,
  SalesReturnRecord,
  SalesReturnDetailRecord,
} from '@/lib/types/sales-return.types';

/**
 * Fetches sales return master data
 * @param params - Filter parameters (date range, branch code, and year)
 * @returns Promise with sales return records
 */
export const getSalesReturn = async (
  params: SalesReturnParams
): Promise<SalesReturnRecord[]> => {
  try {
    const response = await apiClient.get<SalesReturnRecord[]>('/sales-return', {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode,
        year: params.year,
      },
    });

    console.log('✅ Sales Return API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sales return:', error);
    throw error;
  }
};

/**
 * Fetches sales return detail data for a specific bill
 * @param params - Detail parameters (sales header ID, branch code, and year)
 * @returns Promise with sales return detail records
 */
export const getSalesReturnDetail = async (
  params: SalesReturnDetailParams
): Promise<SalesReturnDetailRecord[]> => {
  try {
    const response = await apiClient.get<SalesReturnDetailRecord[]>('/sales-return-det', {
      params: {
        shid: params.shid,
        brCode: params.brCode,
        year: params.year,
      },
    });

    console.log('✅ Sales Return Detail API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sales return detail:', error);
    throw error;
  }
};

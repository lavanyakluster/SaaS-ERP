/**
 * Sales Register API Service
 * Service layer for sales register endpoints
 */

import { apiClient } from './client';
import type {
  SalesRegisterParams,
  SalesRegisterDetailParams,
  SalesRegisterRecord,
  SalesRegisterDetailRecord,
} from '@/lib/types/sales-register.types';

/**
 * Fetches sales register master data
 * @param params - Filter parameters (date range, branch code, and year)
 * @returns Promise with sales register records
 */
export const getSalesRegister = async (
  params: SalesRegisterParams
): Promise<SalesRegisterRecord[]> => {
  try {
    const response = await apiClient.get<SalesRegisterRecord[]>('/sales-register', {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode,
        year: params.year,
      },
    });

    console.log('✅ Sales Register API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sales register:', error);
    throw error;
  }
};

/**
 * Fetches sales register detail data for a specific bill
 * @param params - Detail parameters (sales header ID, branch code, and year)
 * @returns Promise with sales register detail records
 */
export const getSalesRegisterDetail = async (
  params: SalesRegisterDetailParams
): Promise<SalesRegisterDetailRecord[]> => {
  try {
    const response = await apiClient.get<SalesRegisterDetailRecord[]>('/sales-register-det', {
      params: {
        shid: params.shid,
        brCode: params.brCode,
        year: params.year,
      },
    });

    console.log('✅ Sales Register Detail API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching sales register detail:', error);
    throw error;
  }
};

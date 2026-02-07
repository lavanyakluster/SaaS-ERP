/**
 * Sales Register API Service
 * Service layer for sales register endpoints
 */

import axios from 'axios';
import type {
  SalesRegisterParams,
  SalesRegisterDetailParams,
  SalesRegisterResponse,
  SalesRegisterDetailResponse,
} from '@/lib/types/sales-register.types';

// API Base URL
const API_BASE_URL = 'http://corniche02.dyndns.org:8121/V1/api';

// API Endpoints
const ENDPOINTS = {
  SALES_REGISTER: '/sales-register',
  SALES_REGISTER_DETAIL: '/sales-register-det',
} as const;

/**
 * Fetches sales register master data
 * @param params - Filter parameters (date range, branch code, and year)
 * @param token - Authorization token
 * @returns Promise with sales register records
 */
export const fetchSalesRegister = async (
  params: SalesRegisterParams,
  token: string
): Promise<SalesRegisterResponse> => {
  try {
    const response = await axios.get<SalesRegisterResponse>(
      `${API_BASE_URL}${ENDPOINTS.SALES_REGISTER}`,
      {
        params: {
          fromDt: params.fromDt,
          toDt: params.toDt,
          brCode: params.brCode,
          year: params.year, // ✅ Added year parameter
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch sales register data'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};

/**
 * Fetches sales register detail data for a specific bill
 * @param params - Detail parameters (sales header ID, branch code, and year)
 * @param token - Authorization token
 * @returns Promise with sales register detail records
 */
export const fetchSalesRegisterDetail = async (
  params: SalesRegisterDetailParams,
  token: string
): Promise<SalesRegisterDetailResponse> => {
  try {
    const response = await axios.get<SalesRegisterDetailResponse>(
      `${API_BASE_URL}${ENDPOINTS.SALES_REGISTER_DETAIL}`,
      {
        params: {
          shid: params.shid,
          brCode: params.brCode,
          year: params.year, // ✅ Added year parameter
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch sales register details'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};
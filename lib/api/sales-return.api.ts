/**
 * Sales Return API Service
 * Service layer for sales return endpoints
 */

import axios from 'axios';
import type {
  SalesReturnParams,
  SalesReturnDetailParams,
  SalesReturnResponse,
  SalesReturnDetailResponse,
} from '@/lib/types/sales-return.types';

// API Base URL
const API_BASE_URL = 'http://corniche02.dyndns.org:8121/V1/api';

// API Endpoints
const ENDPOINTS = {
  SALES_RETURN: '/sales-return',
  SALES_RETURN_DETAIL: '/sales-return-det',
} as const;

/**
 * Fetches sales return master data
 * @param params - Filter parameters (date range, branch code, and year)
 * @param token - Authorization token
 * @returns Promise with sales return records
 */
export const fetchSalesReturn = async (
  params: SalesReturnParams,
  token: string
): Promise<SalesReturnResponse> => {
  try {
    const response = await axios.get<SalesReturnResponse>(
      `${API_BASE_URL}${ENDPOINTS.SALES_RETURN}`,
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
        error.response?.data?.message || 'Failed to fetch sales return data'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};

/**
 * Fetches sales return detail data for a specific bill
 * @param params - Detail parameters (sales header ID, branch code, and year)
 * @param token - Authorization token
 * @returns Promise with sales return detail records
 */
export const fetchSalesReturnDetail = async (
  params: SalesReturnDetailParams,
  token: string
): Promise<SalesReturnDetailResponse> => {
  try {
    const response = await axios.get<SalesReturnDetailResponse>(
      `${API_BASE_URL}${ENDPOINTS.SALES_RETURN_DETAIL}`,
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
        error.response?.data?.message || 'Failed to fetch sales return details'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};
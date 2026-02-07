/**
 * Year API
 * API functions for fiscal year management
 * Uses organization-level access token with static API URL
 */

import axios from 'axios';
import type { YearsList } from '@/lib/types/year.types';

// Static API URL for organization-level endpoints
const STATIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://130.94.45.215/V1/api';

/**
 * Fetch available years list
 * Uses organization-level access token
 * @param token - Organization access token
 * @returns Array of year strings
 */
export const fetchYearsList = async (token: string): Promise<YearsList> => {
  try {
    console.log('📅 Fetching years list with organization token...');
    console.log('🔗 Using static API URL:', STATIC_API_URL);
    
    const response = await axios.get<YearsList>(`${STATIC_API_URL}/get-years-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ Years list fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to fetch years list:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
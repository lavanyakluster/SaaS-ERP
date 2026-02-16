/**
 * Quotes Status API
 * Handles sales conversion and funnel analysis data
 */

import { apiClient } from './client';

// ✅ Response Types based on expected data structure
export interface QuoteStatusData {
  stage: string;
  count: number;
  conversion: number;
  dropoff: number;
}

export interface QuotesStatusMetrics {
  conversionRate: number;
  conversionRateChange: number;
  totalLeads: number;
  totalLeadsChange: number;
  convertedSales: number;
  convertedSalesChange: number;
  avgTimeToConvert: number;
  avgTimeToConvertChange: number;
  funnelData: QuoteStatusData[];
}

export interface QuotesStatusParams {
  fromDt: string; // Format: YYYY-MM-DD
  toDt: string;   // Format: YYYY-MM-DD
  brCode: string;
  year: number;
}

/**
 * Fetch quotes status data for sales conversion analysis
 * @param params - Query parameters for the request
 * @returns Promise with quotes status metrics
 */
export const getQuotesStatus = async (params: QuotesStatusParams): Promise<QuotesStatusMetrics> => {
  try {
    const response = await apiClient.get<any[]>('/quotes-status', {
      params: {
        fromDt: params.fromDt,
        toDt: params.toDt,
        brCode: params.brCode,
        year: params.year,
      },
    });

    // ✅ IMPORTANT: Handle empty array response
    const data = response.data || [];

    // ✅ CRITICAL: Transform API response to match UI requirements
    // Since the API currently returns empty array, we'll need to parse the actual structure
    // when real data is available. For now, providing a fallback structure.
    
    if (data.length === 0) {
      // Return default structure when no data
      return {
        conversionRate: 0,
        conversionRateChange: 0,
        totalLeads: 0,
        totalLeadsChange: 0,
        convertedSales: 0,
        convertedSalesChange: 0,
        avgTimeToConvert: 0,
        avgTimeToConvertChange: 0,
        funnelData: [
          { stage: 'Leads Generated', count: 0, conversion: 100, dropoff: 0 },
          { stage: 'Qualified Leads', count: 0, conversion: 0, dropoff: 0 },
          { stage: 'Proposals Sent', count: 0, conversion: 0, dropoff: 0 },
          { stage: 'Negotiations', count: 0, conversion: 0, dropoff: 0 },
          { stage: 'Closed Won', count: 0, conversion: 0, dropoff: 0 },
        ],
      };
    }

    // ✅ TODO: Parse actual API response structure when data is available
    // This is a placeholder transformation
    const parsedData: QuotesStatusMetrics = {
      conversionRate: 0,
      conversionRateChange: 0,
      totalLeads: 0,
      totalLeadsChange: 0,
      convertedSales: 0,
      convertedSalesChange: 0,
      avgTimeToConvert: 0,
      avgTimeToConvertChange: 0,
      funnelData: data.map((item: any, index: number) => ({
        stage: item.stage || `Stage ${index + 1}`,
        count: item.count || 0,
        conversion: item.conversion || 0,
        dropoff: item.dropoff || 0,
      })),
    };

    return parsedData;
  } catch (error) {
    console.error('❌ Error fetching quotes status:', error);
    throw error;
  }
};

/**
 * Calculate conversion metrics from funnel data
 * Helper function to compute metrics if the API doesn't provide them directly
 */
export const calculateConversionMetrics = (funnelData: QuoteStatusData[]): Partial<QuotesStatusMetrics> => {
  if (funnelData.length === 0) {
    return {
      conversionRate: 0,
      totalLeads: 0,
      convertedSales: 0,
    };
  }

  const totalLeads = funnelData[0]?.count || 0;
  const convertedSales = funnelData[funnelData.length - 1]?.count || 0;
  const conversionRate = totalLeads > 0 ? (convertedSales / totalLeads) * 100 : 0;

  return {
    conversionRate: Number(conversionRate.toFixed(1)),
    totalLeads,
    convertedSales,
  };
};

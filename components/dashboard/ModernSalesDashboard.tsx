'use client';

import { useMemo } from 'react';
import { ModernChartWidget } from './ModernChartWidget';
import { useSalesDashboard } from '@/lib/hooks/useSalesDashboard';
import type { Branch } from '@/lib/api/branch.api';

interface ModernSalesDashboardProps {
  isDark: boolean;
  onFullscreen?: (id: string, data?: any) => void;
  dateRange: string;
  selectedBranch: string;
  branches: Branch[] | undefined; // ✅ Allow undefined when disabled
}

export function ModernSalesDashboard({ 
  isDark, 
  onFullscreen,
  dateRange,
  selectedBranch,
  branches 
}: ModernSalesDashboardProps) {
  // Helper function to convert date range to actual dates
  const getDateRange = (range: string): { fromDt: string; toDt: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (range) {
      case 'Today':
        return { fromDt: formatDate(today), toDt: formatDate(today) };
      case 'This Week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { fromDt: formatDate(weekStart), toDt: formatDate(today) };
      }
      case 'This Month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { fromDt: formatDate(monthStart), toDt: formatDate(today) };
      }
      case 'This Quarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        return { fromDt: formatDate(quarterStart), toDt: formatDate(today) };
      }
      case 'Year 2025':
      default:
        return { fromDt: '2025-01-01', toDt: '2025-12-31' };
    }
  };

  // Get branch code from selected branch - ✅ Dynamic mapping from real API data
  const getBranchCode = (): string => {
    // ✅ CRITICAL: Guard against undefined branches
    if (!branches || branches.length === 0) {
      return '0'; // Default to all branches if no data loaded
    }

    // Handle "All Branches" case
    if (selectedBranch === 'All Branches') {
      return '0'; // API uses "0" for all branches
    }

    // Find the selected branch
    const branch = branches.find(b => b.bR_NM === selectedBranch);
    
    if (branch) {
      return branch.bR_COD;
    }

    // If specific branch is selected but not found, use first branch
    if (branches.length > 0) {
      return branches[0].bR_COD;
    }

    // Final fallback
    return '0';
  };

  // Get date range and branch code
  const { fromDt, toDt } = getDateRange(dateRange);
  const branchCode = getBranchCode();

  // ✅ Fetch real sales dashboard data from API
  const { data: salesData, isLoading, error } = useSalesDashboard({
    fromDt,
    toDt,
    brCode: branchCode,
  });

  // ✅ Process monthly sales data
  const salesGrowthData = useMemo(() => {
    if (!salesData?.Table || salesData.Table.length === 0) {
      // Return empty array - no mock data
      return [];
    }

    // Map API data to chart format
    return salesData.Table.map(item => ({
      name: item.YRMTH.replace('/', '-'), // Convert "2025/05" to "2025-05"
      month: item.YRMTH,
      sales: item.Sale,
      profit: item.Profit,
    }));
  }, [salesData]);

  // ✅ Process sales rep data
  const repSalesData = useMemo(() => {
    if (!salesData?.Table1 || salesData.Table1.length === 0) {
      // Return empty array - no mock data
      return [];
    }

    // Map API data to table format
    return salesData.Table1.map(item => ({
      name: item.SalesMan ? `${item.SalesMan}#${item.Code}` : `Rep #${item.Code}`,
      sale: item.Sale,
      profit: item.Profit,
    }));
  }, [salesData]);

  return (
    <div className="space-y-6">
      {/* Sales Growth & Rep Sales Widgets Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Sales Growth Bar Chart */}
        <div className="h-[400px]">
          <ModernChartWidget
            id="sales-growth"
            title="Sales Growth"
            subtitle={`${salesGrowthData.length} Month${salesGrowthData.length > 1 ? 's' : ''} - ${dateRange}`}
            data={salesGrowthData}
            dataKeys={[
              { key: 'sales', label: 'Sales', color: '#8b5cf6' },
              { key: 'profit', label: 'Profit', color: '#06b6d4' },
            ]}
            isDark={isDark}
            defaultChartType="column"
            onFullscreen={onFullscreen}
            compact
          />
        </div>

        {/* Rep Sales Table */}
        <div className="h-[400px]">
          <ModernChartWidget
            id="rep-sales"
            title="Rep Sales"
            subtitle={`${repSalesData.length} Sales Representatives - ${dateRange}`}
            data={repSalesData}
            dataKeys={[
              { key: 'sale', label: 'Sale', color: '#8b5cf6' },
              { key: 'profit', label: 'Profit', color: '#06b6d4' },
            ]}
            isDark={isDark}
            defaultChartType="table"
            onFullscreen={onFullscreen}
            compact
            tableFirstColumnName="Rep"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { CommonReportFilters, type ReportFilters } from '@/components/reports/CommonReportFilters';
import { useSalesSummary, useDashSalesSummary } from '@/lib/hooks/useSalesSummary';
import { useSalesDashboard } from '@/lib/hooks'; // ✅ Import the correct hook
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DailySalesSummary() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for filters
  const [filters, setFilters] = useState<ReportFilters>({
    branchCode: '0',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState<'summary' | 'salesman'>('summary');

  // Fetch data from both APIs
  const { data: salesSummaryData, isLoading: isSalesSummaryLoading } = useSalesSummary({
    dtf: filters.fromDate,
    dtt: filters.toDate,
    brcode: filters.branchCode,
    shift: '0',
  });

  const { data: dashSalesData, isLoading: isDashSalesLoading } = useDashSalesSummary({
    dtf: filters.fromDate,
    dtt: filters.toDate,
    brcode: filters.branchCode,
  });

  // ✅ Use correct hook with correct parameter names (fromDt, toDt, brCode)
  const { data: salesDashboardData, isLoading: isSalesDashboardLoading } = useSalesDashboard({
    fromDt: filters.fromDate,
    toDt: filters.toDate,
    brCode: filters.branchCode,
  });

  const isLoading = isSalesSummaryLoading || isDashSalesLoading || isSalesDashboardLoading;

  // Debug: Log the actual data structure
  console.log('📊 Raw API Data:', {
    dashSalesData,
    salesDashboardData,
    filters,
    isLoading,
  });

  const handleLoadReport = (newFilters: ReportFilters) => {
    console.log('🔄 Loading Daily Sales Summary with filters:', newFilters);
    console.log('📊 Dynamic Values:', {
      branchCode: newFilters.branchCode,
      fromDate: newFilters.fromDate,
      toDate: newFilters.toDate,
      activeTab,
    });
    setFilters(newFilters);
  };

  // Process data for bar chart - Using actual API response structure
  const chartData = useMemo(() => {
    console.log('🔍 Processing Chart Data...');
    
    if (!dashSalesData || !Array.isArray(dashSalesData) || dashSalesData.length === 0) {
      console.log('❌ No data available for chart');
      return [];
    }

    // ✅ Map each branch to show all sales types
    const result = dashSalesData.map((item) => ({
      branchCode: item.branchCode || 'Unknown',
      'Cash Sales': item.cashWet || item.cashNet || 0,
      'Card Sales': item.cardWet || item.cardNet || 0,
      'Credit Sales': item.creditWet || item.creditNet || 0,
      'Returned Sales': 0,
      'Total Sales': (item.cashWet || item.cashNet || 0) + 
                     (item.cardWet || item.cardNet || 0) + 
                     (item.creditWet || item.creditNet || 0),
    }));

    console.log('✅ Chart Data Processed:', result);
    return result;
  }, [dashSalesData]);

  // Process data for table - Using actual API response structure
  const tableData = useMemo(() => {
    console.log('🔍 Processing Table Data...');
    
    // ✅ Salesman tab: Use salesDashboard API data (Table1 - Sales Rep Data)
    if (activeTab === 'salesman') {
      if (!salesDashboardData?.Table1 || salesDashboardData.Table1.length === 0) {
        console.log('❌ No salesman data available');
        return [];
      }

      const rows = salesDashboardData.Table1.map((item) => ({
        code: item.Code,
        salesman: item.SalesMan,
        sale: item.Sale,
        profit: item.Profit,
      }));

      console.log('✅ Salesman Table Data Processed:', rows);
      return rows;
    }
    
    // ✅ Summary tab: Use dashSalesData
    if (!dashSalesData || !Array.isArray(dashSalesData) || dashSalesData.length === 0) {
      console.log('❌ No data available for table');
      return [];
    }

    const rows = dashSalesData.map((item, index) => {
      const row = {
        code: item.branchCode || `Branch ${index + 1}`,
        description: item.branchName || item.branchCode || `Branch ${index + 1}`,
        cashSales: item.cashWet || item.cashNet || 0,
        cardSales: item.cardWet || item.cardNet || 0,
        creditSales: item.creditWet || item.creditNet || 0,
        insurance: item.insuranceWet || item.insuranceNet || 0,
        pointsRedeemed: item.redeemedPoints || 0,
        totalBills: item.totalBills || 0,
      };
      
      console.log('📝 Created row:', row);
      return row;
    });

    console.log('✅ Table Data Processed:', rows);
    return rows;
  }, [dashSalesData, salesDashboardData, activeTab]);

  // Process data for salesman chart
  const salesmanChartData = useMemo(() => {
    if (activeTab !== 'salesman' || !salesDashboardData?.Table1) {
      return [];
    }

    const data = salesDashboardData.Table1.map((item) => ({
      salesman: item.SalesMan,
      sales: item.Sale,
      profit: item.Profit,
    }));

    console.log('📊 Salesman Chart Data:', data);
    return data;
  }, [salesDashboardData, activeTab]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!tableData.length) {
      if (activeTab === 'salesman') {
        return { sale: 0, profit: 0 };
      }
      return { 
        cashSales: 0, 
        cardSales: 0, 
        creditSales: 0, 
        insurance: 0, 
        pointsRedeemed: 0, 
        totalBills: 0 
      };
    }

    if (activeTab === 'salesman') {
      const result = tableData.reduce((acc, row: any) => ({
        sale: acc.sale + row.sale,
        profit: acc.profit + row.profit,
      }), { sale: 0, profit: 0 });
      
      console.log('💰 Salesman Totals Calculated:', result);
      return result;
    }

    const result = tableData.reduce((acc, row: any) => ({
      cashSales: acc.cashSales + row.cashSales,
      cardSales: acc.cardSales + row.cardSales,
      creditSales: acc.creditSales + row.creditSales,
      insurance: acc.insurance + row.insurance,
      pointsRedeemed: acc.pointsRedeemed + row.pointsRedeemed,
      totalBills: acc.totalBills + row.totalBills,
    }), { 
      cashSales: 0, 
      cardSales: 0, 
      creditSales: 0, 
      insurance: 0, 
      pointsRedeemed: 0, 
      totalBills: 0 
    });

    console.log('💰 Totals Calculated:', result);
    return result;
  }, [tableData, activeTab]);

  const cashTotals = activeTab === 'salesman'
    ? null
    : (totals as {
        cashSales: number;
        cardSales: number;
        creditSales: number;
        insurance: number;
        pointsRedeemed: number;
        totalBills: number;
      });

  const salesmanTotals = activeTab === 'salesman'
    ? (totals as { sale: number; profit: number })
    : null;

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Common Filters - Always at Top */}
      <CommonReportFilters onLoad={handleLoadReport} />

      {/* Active Filters Display - Shows dynamic values being used */}
      {filters.branchCode !== '0' || filters.fromDate !== filters.toDate ? (
        <div className={`rounded-lg border p-3 ${
          isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              Active Filters:
            </span>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Branch:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filters.branchCode === '0' ? 'All Branches' : filters.branchCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Period:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filters.fromDate} {filters.fromDate !== filters.toDate ? `to ${filters.toDate}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tab:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'summary' ? 'Summary View' : 'Salesman View (Year-over-Year)'}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className={`rounded-lg border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-blue-500 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('salesman')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'salesman'
                ? 'bg-blue-500 text-white'
                : isDark
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Salesman
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={`rounded-lg border p-8 text-center ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading sales data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sales Summary
                </h3>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bar Graph
                  </span>
                </div>
              </div>
              
              {activeTab === 'salesman' ? (
                // ✅ Salesman Chart - Shows sales by salesman
                salesmanChartData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      No salesman data available for the selected filters
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesmanChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="salesman" 
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '10px' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => {
                          if (value >= 1000) {
                            return `${(value / 1000).toFixed(0)}K`;
                          }
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          color: isDark ? '#F3F4F6' : '#111827',
                        }}
                        formatter={(value?: number) => {
                          if (value === undefined || value === null) return '';
                          return value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#6366F1" name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                )
              ) : (
                // ✅ Summary Chart - Shows sales by type
                chartData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      No data available for the selected filters
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="branchCode" 
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={isDark ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => {
                          if (value >= 1000) {
                            return `${(value / 1000).toFixed(0)}K`;
                          }
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          color: isDark ? '#F3F4F6' : '#111827',
                        }}
                        formatter={(value?: number) => {
                          if (value === undefined || value === null) return '';
                          return value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Cash Sales" fill="#C026D3" name="Cash Sales" />
                      <Bar dataKey="Card Sales" fill="#EC4899" name="Card Sales" />
                      <Bar dataKey="Credit Sales" fill="#22D3EE" name="Credit Sales" />
                      <Bar dataKey="Returned Sales" fill="#FBBF24" name="Returned Sales" />
                      <Bar dataKey="Total Sales" fill="#10B981" name="Total Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                )
              )}
            </div>
          </div>

          {/* Table */}
          <div className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              {activeTab === 'summary' ? (
                <table className="w-full text-sm">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="text-left p-3 font-semibold whitespace-nowrap">Branch Code</th>
                      <th className="text-left p-3 font-semibold whitespace-nowrap">Branch Name</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Cash Sales</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Card Sales</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Credit Sales</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Insurance</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Points Redeemed</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Total Bills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center">
                          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            No data available for the selected filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tableData.map((row: any, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} ${
                            index % 2 === 0 
                              ? isDark ? 'bg-gray-800' : 'bg-white'
                              : isDark ? 'bg-gray-750' : 'bg-gray-50'
                          }`}
                        >
                          <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium whitespace-nowrap`}>
                            {row.code}
                          </td>
                          <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.description}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.cashSales.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.cardSales.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.creditSales.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.insurance.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.pointsRedeemed.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold whitespace-nowrap`}>
                            {row.totalBills}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-indigo-600 text-white font-semibold">
                    <tr>
                      <td colSpan={2} className="p-3 whitespace-nowrap">Total</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.cashSales.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.cardSales.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.creditSales.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.insurance.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.pointsRedeemed.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{cashTotals?.totalBills}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="text-left p-3 font-semibold whitespace-nowrap">Code</th>
                      <th className="text-left p-3 font-semibold whitespace-nowrap">Salesman</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Sale</th>
                      <th className="text-right p-3 font-semibold whitespace-nowrap">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center">
                          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            No salesman data available for the selected filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tableData.map((row: any, index) => (
                        <tr 
                          key={index} 
                          className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} ${
                            index % 2 === 0 
                              ? isDark ? 'bg-gray-800' : 'bg-white'
                              : isDark ? 'bg-gray-750' : 'bg-gray-50'
                          }`}
                        >
                          <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium whitespace-nowrap`}>
                            {row.code}
                          </td>
                          <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.salesman}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.sale.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                            {row.profit.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-indigo-600 text-white font-semibold">
                    <tr>
                      <td colSpan={2} className="p-3 whitespace-nowrap">Total</td>
                      <td className="p-3 text-right whitespace-nowrap">{salesmanTotals?.sale.toFixed(2)}</td>
                      <td className="p-3 text-right whitespace-nowrap">{salesmanTotals?.profit.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

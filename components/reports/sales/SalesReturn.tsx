'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { CommonReportFilters, type ReportFilters } from '@/components/reports/CommonReportFilters';
import { useSalesReturn, useSalesReturnDetail } from '@/lib/hooks/useSalesReturn';
import { useAuthStore } from '@/lib/store/auth-store';
import type { SalesReturnRecord } from '@/lib/types/sales-return.types';

export default function SalesReturn() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Debug: Check token status
  useEffect(() => {
    const token = useAuthStore.getState().getAccessToken();
    const isAuthenticated = useAuthStore.getState().isAuthenticated();
    console.log('🔐 Token Status on SalesReturn mount:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'NO TOKEN',
      isAuthenticated,
      tokenFromStorage: typeof window !== 'undefined' ? sessionStorage.getItem('sb_access_token')?.substring(0, 50) + '...' : 'SSR',
    });
  }, []);

  // State for filters
  const [filters, setFilters] = useState<ReportFilters>({
    branchCode: '0',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Fetch sales return master data
  const { data: salesReturnData, isLoading, error } = useSalesReturn({
    fromDt: filters.fromDate,
    toDt: filters.toDate,
    brCode: filters.branchCode,
  });

  // Debug: Log data when it changes
  useEffect(() => {
    console.log('📊 Sales Return Data:', {
      data: salesReturnData,
      dataLength: salesReturnData?.length || 0,
      isLoading,
      error,
      filters,
    });
  }, [salesReturnData, isLoading, error, filters]);

  const handleLoadReport = (newFilters: ReportFilters) => {
    console.log('🔄 Loading Sales Return with filters:', newFilters);
    console.log('📅 Filter Details:', {
      fromDate: newFilters.fromDate,
      toDate: newFilters.toDate,
      branchCode: newFilters.branchCode,
    });
    setFilters(newFilters);
    setExpandedRows(new Set()); // Collapse all rows when filters change
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Group data by branch
  const groupedData = useMemo(() => {
    if (!salesReturnData) return {};
    
    const groups: Record<string, SalesReturnRecord[]> = {};
    salesReturnData.forEach((record) => {
      if (!groups[record.Branch]) {
        groups[record.Branch] = [];
      }
      groups[record.Branch].push(record);
    });
    
    return groups;
  }, [salesReturnData]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    if (!salesReturnData) return 0;
    return salesReturnData.reduce((sum, record) => sum + record.Net, 0);
  }, [salesReturnData]);

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Common Filters - Always at Top */}
      <CommonReportFilters onLoad={handleLoadReport} />

      {/* Active Filters Display */}
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
          </div>
        </div>
      ) : null}

      {/* Loading State */}
      {isLoading ? (
        <div className={`rounded-lg border p-8 text-center ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading sales return...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sales Return Table */}
          {Object.entries(groupedData).map(([branch, records]) => (
            <div key={branch} className="space-y-2">
              {/* Branch Header */}
              <div className={`rounded-lg border px-4 py-2 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Branch: {branch}
                </h3>
              </div>

              {/* Master Records */}
              <div className={`rounded-lg border overflow-hidden ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-3 font-semibold whitespace-nowrap w-10"></th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Bill No.</th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Date</th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Code</th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Party</th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Salesman</th>
                        <th className="text-right p-3 font-semibold whitespace-nowrap">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <MasterRow
                          key={record.ID}
                          record={record}
                          index={index}
                          isExpanded={expandedRows.has(record.ID)}
                          onToggle={() => toggleRow(record.ID)}
                          isDark={isDark}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {/* Grand Total */}
          {salesReturnData && salesReturnData.length > 0 && (
            <div className={`rounded-lg border p-4 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-end items-center gap-4">
                <span className={`text-lg font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Total:
                </span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* No Data */}
          {(!salesReturnData || salesReturnData.length === 0) && !isLoading && (
            <div className={`rounded-lg border p-8 text-center ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                No sales return data available for the selected filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Master Row Component with Expand/Collapse
function MasterRow({
  record,
  index,
  isExpanded,
  onToggle,
  isDark,
}: {
  record: SalesReturnRecord;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  // Fetch detail data when expanded
  const { data: detailData, isLoading: isLoadingDetail } = useSalesReturnDetail(
    {
      shid: record.ID,
      brCode: record.Branch.replace('P', '').replace('V', '').replace('M', '').replace('A', '').replace('W', '').replace('S', ''),
    },
    isExpanded
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <>
      {/* Master Row */}
      <tr
        className={`border-t cursor-pointer hover:bg-opacity-50 transition-colors ${
          isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
        } ${
          index % 2 === 0
            ? isDark ? 'bg-gray-800' : 'bg-white'
            : isDark ? 'bg-gray-750' : 'bg-gray-50'
        }`}
        onClick={onToggle}
      >
        <td className="p-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-indigo-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </td>
        <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium whitespace-nowrap`}>
          {record.BillNo}
        </td>
        <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
          {formatDate(record.Date)}
        </td>
        <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
          {record.Code}
        </td>
        <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
          {record.Party || '-'}
        </td>
        <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
          {record.SalesMan}
        </td>
        <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-medium whitespace-nowrap`}>
          {record.Net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>

      {/* Detail Rows */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className={`p-0 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="p-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading details...</span>
                </div>
              ) : detailData && detailData.length > 0 ? (
                <div className={`rounded-lg border overflow-hidden ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <tr>
                          <th className={`text-left p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Bill No</th>
                          <th className={`text-left p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Code</th>
                          <th className={`text-left p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Barcode</th>
                          <th className={`text-left p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Product</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Rate</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Qty</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Free</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Pack</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>UOM</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Amount</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Discount</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Tax</th>
                          <th className={`text-right p-2 font-semibold whitespace-nowrap ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.map((detail, detailIndex) => (
                          <tr
                            key={detailIndex}
                            className={`border-t ${
                              isDark ? 'border-gray-700' : 'border-gray-200'
                            } ${
                              detailIndex % 2 === 0
                                ? isDark ? 'bg-gray-800' : 'bg-white'
                                : isDark ? 'bg-gray-750' : 'bg-gray-50'
                            }`}
                          >
                            <td className={`p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.BillNo}
                            </td>
                            <td className={`p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Code}
                            </td>
                            <td className={`p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Barcode}
                            </td>
                            <td className={`p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap max-w-xs truncate`}>
                              {detail.Product}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Qty}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {typeof detail.Free === 'number' ? detail.Free : 0}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Pack}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.UOM}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                              {detail.Tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className={`p-2 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-medium whitespace-nowrap`}>
                              {detail.Net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    No detail data available
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
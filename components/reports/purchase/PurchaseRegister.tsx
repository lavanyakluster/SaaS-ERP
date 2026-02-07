'use client';

import { useState } from 'react';
import { Eye, Download, X } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { CommonReportFilters, type ReportFilters } from '@/components/reports/CommonReportFilters';
import { usePurchaseRegister, usePurchaseRegisterDetail } from '@/lib/hooks/usePurchaseRegister';
import { formatDate } from '@/lib/utils/format';

export default function PurchaseRegister() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for filters - updated when Load button is clicked
  const [filters, setFilters] = useState<ReportFilters>({
    branchCode: '0',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  // State for selected purchase (for detail view)
  const [selectedPurchase, setSelectedPurchase] = useState<{
    id: number;
    brCode: string;
    billNo: string;
  } | null>(null);

  // Fetch purchase register data with dynamic filters
  const { data: purchaseData, isLoading: isPurchaseLoading } = usePurchaseRegister({
    fromDt: filters.fromDate,
    toDt: filters.toDate,
    brCode: filters.branchCode,
  });

  // Fetch detail data when a purchase is selected
  const { data: detailData, isLoading: isDetailLoading } = usePurchaseRegisterDetail(
    {
      shid: selectedPurchase?.id || 0,
      brCode: selectedPurchase?.brCode || '',
    },
    !!selectedPurchase
  );

  const isLoading = isPurchaseLoading;

  // Handle filter changes when Load button is clicked
  const handleLoadReport = (newFilters: ReportFilters) => {
    console.log('📊 Purchase Register - Loading with filters:', newFilters);
    setFilters(newFilters);
  };

  // Handle view details
  const handleViewDetails = (id: number, brCode: string, billNo: string) => {
    setSelectedPurchase({ id, brCode, billNo });
  };

  // Handle close detail modal
  const handleCloseDetail = () => {
    setSelectedPurchase(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals
  const totals = purchaseData?.reduce(
    (acc, item) => ({
      prodValue: acc.prodValue + (item['Prod Value'] || 0),
      net: acc.net + (item.Net || 0),
      tax: acc.tax + (item.Tax || 0),
      dis: acc.dis + (item.Dis || 0),
      expense: acc.expense + (item.Expense || 0),
    }),
    { prodValue: 0, net: 0, tax: 0, dis: 0, expense: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <CommonReportFilters 
        onLoad={handleLoadReport}
        defaultFromDate={filters.fromDate}
        defaultToDate={filters.toDate}
        defaultBranch={filters.branchCode}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Purchase Register Table */}
      {!isLoading && purchaseData && purchaseData.length > 0 && (
        <div
          className={`rounded-lg border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr
                  className={`${
                    isDark ? 'bg-gray-900 text-gray-300' : 'bg-blue-600 text-white'
                  }`}
                >
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Grn</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bill No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Bill Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Prod Value</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Dis</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Tax</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Net</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Expense</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseData.map((item, index) => (
                  <tr
                    key={`${item.ID}-${index}`}
                    className={`${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-900'
                    } transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDate(item.Date)}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.Grn}</td>
                    <td className="px-4 py-3 text-sm">{item['Bill No.']}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDate(item['Bill Date'])}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.Supplier}>
                      {item.Supplier}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(item['Prod Value'])}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.Dis)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.Tax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.Net)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.Expense)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetails(item.ID, item.Branch, item['Bill No.'])}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                        title="View Details"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Footer */}
              <tfoot>
                <tr
                  className={`font-semibold ${
                    isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <td colSpan={5} className="px-4 py-3 text-sm text-right">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.prodValue || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.dis || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.tax || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                    {formatCurrency(totals?.net || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.expense || 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Cards */}
          <div
            className={`grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border-t ${
              isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Bills</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {purchaseData.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Prod Value</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals?.prodValue || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Discount</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals?.dis || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tax</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totals?.tax || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Net Amount</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(totals?.net || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data */}
      {!isLoading && (!purchaseData || purchaseData.length === 0) && (
        <div
          className={`text-center py-12 rounded-lg border ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          No data available for the selected filters
        </div>
      )}

      {/* Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
              isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">Purchase Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bill No: {selectedPurchase.billNo}
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isDetailLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {!isDetailLoading && detailData && detailData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`${
                          isDark ? 'bg-gray-900 text-gray-300' : 'bg-blue-600 text-white'
                        }`}
                      >
                        <th className="px-3 py-2 text-left text-xs font-semibold">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Barcode</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold">Batch</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold">Expiry</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Free</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Rate</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Disc</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Tax</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {detailData.map((item, index) => (
                        <tr
                          key={`${item.RD_PC}-${index}`}
                          className={`${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <td className="px-3 py-2 text-xs max-w-xs" title={item.PM_NM}>
                            <div className="font-medium">{item.PM_NM}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                              {item.RD_PC}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                            {item.PM_MBCOD || '-'}
                          </td>
                          <td className="px-3 py-2 text-xs text-center">{item.RD_BN}</td>
                          <td className="px-3 py-2 text-xs text-center">{item.RD_EXP}</td>
                          <td className="px-3 py-2 text-xs text-right font-medium">
                            {item.RD_QTY}
                          </td>
                          <td className="px-3 py-2 text-xs text-right text-green-600 dark:text-green-400">
                            {item.RD_FRQ || 0}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {formatCurrency(item.RD_PRT)}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {formatCurrency(item.RD_DISAMT)}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {formatCurrency(item.RD_TAXAMT)}
                          </td>
                          <td className="px-3 py-2 text-xs text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.RD_AMT)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isDetailLoading && (!detailData || detailData.length === 0) && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No detail data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { CommonReportFilters, type ReportFilters } from '@/components/reports/CommonReportFilters';
import { usePurchaseReturn } from '@/lib/hooks/usePurchaseReturn';
import { formatDate } from '@/lib/utils/format';

export default function PurchaseReturn() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for filters - updated when Load button is clicked
  const [filters, setFilters] = useState<ReportFilters>({
    branchCode: '0',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  // Fetch purchase return data with dynamic filters
  const { data: returnData, isLoading } = usePurchaseReturn({
    fromDt: filters.fromDate,
    toDt: filters.toDate,
    brCode: filters.branchCode,
  });

  // Handle filter changes when Load button is clicked
  const handleLoadReport = (newFilters: ReportFilters) => {
    console.log('📊 Purchase Return - Loading with filters:', newFilters);
    setFilters(newFilters);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals
  const totals = returnData?.reduce(
    (acc, item) => ({
      prodValue: acc.prodValue + (item.ProdValue || 0),
      discount: acc.discount + (item.Discount || 0),
      tax: acc.tax + (item.Tax || 0),
      net: acc.net + (item.Net || 0),
      addAmt: acc.addAmt + (item.AddAmt || 0),
    }),
    { prodValue: 0, discount: 0, tax: 0, net: 0, addAmt: 0 }
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

      {/* Purchase Return Table */}
      {!isLoading && returnData && returnData.length > 0 && (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {returnData.map((item, index) => (
                  <tr
                    key={`${item.Id}-${index}`}
                    className={`${
                      isDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-900'
                    } transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatDate(item.Date)}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.DocNo}</td>
                    <td className="px-4 py-3 text-sm">{item.RefBillNo || '-'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {item.RefBillDate ? formatDate(item.RefBillDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.Supplier}>
                      {item.Supplier}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(item.ProdValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.Discount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.Tax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.Net)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(item.AddAmt)}
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
                    {formatCurrency(totals?.discount || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.tax || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                    {formatCurrency(totals?.net || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(totals?.addAmt || 0)}
                  </td>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Returns</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {returnData.length}
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
                {formatCurrency(totals?.discount || 0)}
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
      {!isLoading && (!returnData || returnData.length === 0) && (
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
    </div>
  );
}
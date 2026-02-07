'use client';

/**
 * Purchase Report Page
 * Comprehensive purchase analysis and reporting
 */

import { useState } from 'react';
import { ClipboardList, Download, Filter, Calendar, TrendingDown, Package } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';

export default function PurchaseReportPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('summary');

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Purchase Report
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive purchase analysis and reporting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={`rounded-xl border p-4 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {/* Report Type */}
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="by-product">By Product</option>
              <option value="by-supplier">By Supplier</option>
              <option value="by-branch">By Branch</option>
              <option value="by-category">By Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Total Purchases
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 1,850,000
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <TrendingDown className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">-5.2%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-500/30' : 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                Total Orders
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                892
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-pink-500/30' : 'bg-pink-200'}`}>
              <ClipboardList className={`w-5 h-5 ${isDark ? 'text-pink-300' : 'text-pink-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+4.1%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                Avg Order Value
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 2,074
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/30' : 'bg-indigo-200'}`}>
              <TrendingDown className={`w-5 h-5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xs font-semibold">-8.9%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Top Supplier */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                Top Supplier
              </p>
              <h3 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Supplier ABC
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/30' : 'bg-cyan-200'}`}>
              <Package className={`w-5 h-5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AED 185K in purchases
            </span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Purchase Transactions
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed purchase breakdown for the selected period
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  PO No.
                </th>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </th>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier
                </th>
                <th className={`text-right p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </th>
                <th className={`text-center p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <td className={`p-3 ${isDark ? 'text-purple-400' : 'text-purple-600'} font-semibold`}>
                  PO-2025-001
                </td>
                <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Feb 04, 2026
                </td>
                <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                  Global Suppliers LLC
                </td>
                <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  AED 25,000.00
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Received
                  </span>
                </td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <td className={`p-3 ${isDark ? 'text-purple-400' : 'text-purple-600'} font-semibold`}>
                  PO-2025-002
                </td>
                <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Feb 03, 2026
                </td>
                <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                  Tech Solutions FZE
                </td>
                <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  AED 15,750.00
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                    In Transit
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

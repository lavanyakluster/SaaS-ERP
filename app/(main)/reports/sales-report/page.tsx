'use client';

/**
 * Sales Report Page
 * Comprehensive sales analysis and reporting
 */

import { useState } from 'react';
import { FileBarChart, Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';

export default function SalesReportPage() {
  const { isDark } = useTheme();
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('summary');

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Report
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive sales analysis and reporting
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
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg`}
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
            <FileBarChart className="w-4 h-4 text-gray-400" />
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
              <option value="by-customer">By Customer</option>
              <option value="by-branch">By Branch</option>
              <option value="by-salesperson">By Salesperson</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Total Sales
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 2,450,000
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/30' : 'bg-blue-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+12.5%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Total Orders
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1,247
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <FileBarChart className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+8.2%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Avg Order Value
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 1,965
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+3.8%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>vs last month</span>
          </div>
        </div>

        {/* Top Product */}
        <div className={`rounded-xl border p-5 ${
          isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Top Product
              </p>
              <h3 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Product XYZ
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/30' : 'bg-amber-200'}`}>
              <FileBarChart className={`w-5 h-5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AED 245K in sales
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
            Sales Transactions
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed sales breakdown for the selected period
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Invoice No.
                </th>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </th>
                <th className={`text-left p-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Customer
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
                <td className={`p-3 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                  INV-2025-001
                </td>
                <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Feb 04, 2026
                </td>
                <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                  ABC Trading LLC
                </td>
                <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  AED 12,500.00
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Paid
                  </span>
                </td>
              </tr>
              <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <td className={`p-3 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                  INV-2025-002
                </td>
                <td className={`p-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Feb 04, 2026
                </td>
                <td className={`p-3 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                  XYZ Company
                </td>
                <td className={`p-3 text-right ${isDark ? 'text-white' : 'text-gray-900'} font-semibold`}>
                  AED 8,750.00
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                    Pending
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

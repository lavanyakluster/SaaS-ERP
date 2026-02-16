'use client';

/**
 * Sales Report Page
 * Comprehensive sales analysis and reporting with enterprise-level table
 */

import { useState } from 'react';
import { FileBarChart, TrendingUp } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { EnhancedDataTable, Column } from '@/components/reports/EnhancedDataTable';

interface SalesTransaction {
  invoiceNo: string;
  date: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  branch: string;
  salesperson: string;
}

export default function SalesReportPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mock data - replace with API call
  const [transactions] = useState<SalesTransaction[]>([
    {
      invoiceNo: 'INV-2025-001',
      date: 'Feb 04, 2026',
      customer: 'ABC Trading LLC',
      amount: 12500.00,
      status: 'Paid',
      branch: 'Main Branch',
      salesperson: 'John Doe',
    },
    {
      invoiceNo: 'INV-2025-002',
      date: 'Feb 04, 2026',
      customer: 'XYZ Company',
      amount: 8750.00,
      status: 'Pending',
      branch: 'Branch 2',
      salesperson: 'Jane Smith',
    },
    {
      invoiceNo: 'INV-2025-003',
      date: 'Feb 03, 2026',
      customer: 'Global Enterprises',
      amount: 15200.00,
      status: 'Paid',
      branch: 'Main Branch',
      salesperson: 'John Doe',
    },
    {
      invoiceNo: 'INV-2025-004',
      date: 'Feb 03, 2026',
      customer: 'Tech Solutions',
      amount: 9500.00,
      status: 'Overdue',
      branch: 'Branch 3',
      salesperson: 'Mike Johnson',
    },
    {
      invoiceNo: 'INV-2025-005',
      date: 'Feb 02, 2026',
      customer: 'Retail Store',
      amount: 6800.00,
      status: 'Paid',
      branch: 'Branch 2',
      salesperson: 'Jane Smith',
    },
  ]);

  // Define columns for enhanced table
  const columns: Column<SalesTransaction>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No.',
      accessor: (row) => row.invoiceNo,
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value) => (
        <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.date,
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (row) => row.customer,
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value) => (
        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      accessor: (row) => row.branch,
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'salesperson',
      header: 'Salesperson',
      accessor: (row) => row.salesperson,
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      align: 'right',
      sortable: true,
      filterable: true,
      filterType: 'number',
      render: (value) => (
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AED {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      align: 'center',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Paid', 'Pending', 'Overdue'],
      render: (value) => {
        const statusColors = {
          Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
          Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
          Overdue: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[value as keyof typeof statusColors]
            }`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Sales Report
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive sales analysis and reporting
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Total Sales
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 52,750
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/30' : 'bg-blue-200'}`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+12.5%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30'
              : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className={`text-xs font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}
              >
                Total Orders
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <FileBarChart
                className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+8.2%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                Avg Order Value
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 10,550
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`}>
              <TrendingUp
                className={`w-5 h-5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+3.8%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Top Customer */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30'
              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Top Customer
              </p>
              <h3
                className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Global Enterprises
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/30' : 'bg-amber-200'}`}>
              <FileBarChart
                className={`w-5 h-5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AED 15,200 in sales
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div>
        <div className="mb-4">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sales Transactions
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed sales breakdown with advanced filtering and sorting
          </p>
        </div>
        <EnhancedDataTable data={transactions} columns={columns} pageSize={20} />
      </div>
    </div>
  );
}
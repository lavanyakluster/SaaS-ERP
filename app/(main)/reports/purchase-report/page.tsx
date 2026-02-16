'use client';

/**
 * Purchase Report Page
 * Comprehensive purchase analysis and reporting with enterprise-level table
 */

import { useState } from 'react';
import { ClipboardList, TrendingDown, Package } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { EnhancedDataTable, Column } from '@/components/reports/EnhancedDataTable';

interface PurchaseTransaction {
  poNo: string;
  date: string;
  supplier: string;
  amount: number;
  status: 'Received' | 'In Transit' | 'Pending' | 'Cancelled';
  branch: string;
  category: string;
}

export default function PurchaseReportPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mock data - replace with API call
  const [transactions] = useState<PurchaseTransaction[]>([
    {
      poNo: 'PO-2025-001',
      date: 'Feb 04, 2026',
      supplier: 'Global Suppliers LLC',
      amount: 25000.00,
      status: 'Received',
      branch: 'Main Branch',
      category: 'Electronics',
    },
    {
      poNo: 'PO-2025-002',
      date: 'Feb 03, 2026',
      supplier: 'Tech Solutions FZE',
      amount: 15750.00,
      status: 'In Transit',
      branch: 'Branch 2',
      category: 'IT Equipment',
    },
    {
      poNo: 'PO-2025-003',
      date: 'Feb 02, 2026',
      supplier: 'Office Supplies Co',
      amount: 8500.00,
      status: 'Received',
      branch: 'Main Branch',
      category: 'Office Supplies',
    },
    {
      poNo: 'PO-2025-004',
      date: 'Feb 02, 2026',
      supplier: 'Furniture World',
      amount: 32000.00,
      status: 'Pending',
      branch: 'Branch 3',
      category: 'Furniture',
    },
    {
      poNo: 'PO-2025-005',
      date: 'Feb 01, 2026',
      supplier: 'Global Suppliers LLC',
      amount: 12200.00,
      status: 'Received',
      branch: 'Branch 2',
      category: 'Electronics',
    },
  ]);

  // Define columns for enhanced table
  const columns: Column<PurchaseTransaction>[] = [
    {
      key: 'poNo',
      header: 'PO No.',
      accessor: (row) => row.poNo,
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value) => (
        <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
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
      key: 'supplier',
      header: 'Supplier',
      accessor: (row) => row.supplier,
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
      key: 'category',
      header: 'Category',
      accessor: (row) => row.category,
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
      filterOptions: ['Received', 'In Transit', 'Pending', 'Cancelled'],
      render: (value) => {
        const statusColors = {
          Received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
          'In Transit': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
          Pending: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
          Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
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
          Purchase Report
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive purchase analysis and reporting
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
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
                Total Purchases
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 93,450
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/30' : 'bg-purple-200'}`}>
              <TrendingDown
                className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">-5.2%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-500/30'
              : 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                Total Orders
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                5
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-pink-500/30' : 'bg-pink-200'}`}>
              <ClipboardList
                className={`w-5 h-5 ${isDark ? 'text-pink-300' : 'text-pink-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-xs font-semibold">+4.1%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border-indigo-500/30'
              : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className={`text-xs font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}
              >
                Avg Order Value
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AED 18,690
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/30' : 'bg-indigo-200'}`}>
              <TrendingDown
                className={`w-5 h-5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xs font-semibold">-8.9%</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              vs last period
            </span>
          </div>
        </div>

        {/* Top Supplier */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30'
              : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                Top Supplier
              </p>
              <h3 className={`text-lg font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Global Suppliers LLC
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/30' : 'bg-cyan-200'}`}>
              <Package className={`w-5 h-5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AED 37,200 in purchases
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div>
        <div className="mb-4">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Purchase Transactions
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed purchase breakdown with advanced filtering and sorting
          </p>
        </div>
        <EnhancedDataTable data={transactions} columns={columns} pageSize={20} />
      </div>
    </div>
  );
}
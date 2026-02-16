'use client';

import { Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/common';

// ============================================================================
// TYPES
// ============================================================================

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
  invoiceUrl: string;
}

interface BillingHistoryTableProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => void;
  theme?: 'light' | 'dark' | 'system';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BillingHistoryTable({ 
  invoices, 
  onDownload, 
  theme = 'light' 
}: BillingHistoryTableProps) {
  const isDark = theme === 'dark';

  // ========================================================================
  // COLUMN DEFINITIONS
  // ========================================================================

  const columns: ColumnDef<Invoice>[] = [
    {
      key: 'id',
      header: 'Invoice',
      accessor: (row) => row.id,
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {value}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.date,
      sortable: true,
      filterable: true,
      render: (value) => 
        new Date(value).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (row) => row.description,
      sortable: true,
      filterable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      sortable: true,
      filterable: false,
      align: 'right',
      render: (value) => (
        <span className="font-semibold">
          AED {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      filterable: true,
      render: (value: 'paid' | 'pending') => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
          value === 'paid'
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}>
          {value === 'paid' ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      accessor: (row) => row.id,
      sortable: false,
      filterable: false,
      align: 'right',
      render: (value) => (
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            onDownload(value);
          }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
            isDark
              ? 'text-emerald-400 hover:bg-gray-700'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      ),
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`p-6 rounded-2xl border shadow-lg ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Billing History
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Download your past invoices
          </p>
        </div>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        theme={theme}
        emptyMessage="No invoices found"
        defaultSortKey="date"
        defaultSortOrder="desc"
        enableGlobalFilter={true}
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
}

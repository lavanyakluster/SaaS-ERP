'use client';

import { DataTable, ColumnDef } from '@/components/common';

// ============================================================================
// TYPES
// ============================================================================

export interface SalesTransaction {
  invoiceNo: string;
  date: string;
  customer: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  branch?: string;
  salesRep?: string;
}

interface SalesReportTableProps {
  data: SalesTransaction[];
  theme?: 'light' | 'dark' | 'system';
  onRowClick?: (transaction: SalesTransaction) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SalesReportTable({ 
  data, 
  theme = 'light',
  onRowClick,
}: SalesReportTableProps) {
  const isDark = theme === 'dark';

  // ========================================================================
  // COLUMN DEFINITIONS
  // ========================================================================

  const columns: ColumnDef<SalesTransaction>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No.',
      accessor: (row) => row.invoiceNo,
      sortable: true,
      filterable: true,
      align: 'left',
      render: (value) => (
        <span className={`font-semibold ${
          isDark ? 'text-blue-400' : 'text-blue-600'
        }`}>
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
      align: 'left',
      render: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (row) => row.customer,
      sortable: true,
      filterable: true,
      align: 'left',
      render: (value) => (
        <span className={`font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      accessor: (row) => row.branch || '-',
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'salesRep',
      header: 'Sales Rep',
      accessor: (row) => row.salesRep || '-',
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (row) => row.amount,
      sortable: true,
      filterable: false,
      align: 'right',
      render: (value) => (
        <span className={`font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          AED {value.toLocaleString('en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      filterable: true,
      align: 'center',
      render: (value: 'Paid' | 'Pending' | 'Overdue') => {
        const statusStyles = {
          Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
          Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
          Overdue: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        };

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[value]}`}>
            {value}
          </span>
        );
      },
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <DataTable
      data={data}
      columns={columns}
      theme={theme}
      emptyMessage="No sales transactions found"
      defaultSortKey="date"
      defaultSortOrder="desc"
      enableGlobalFilter={true}
      enablePagination={true}
      pageSize={20}
      onRowClick={onRowClick}
    />
  );
}

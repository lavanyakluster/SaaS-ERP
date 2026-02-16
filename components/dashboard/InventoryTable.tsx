'use client';

import { DataTable, ColumnDef } from '@/components/common';

// ============================================================================
// TYPES
// ============================================================================

interface InventoryItem {
  itemType: string;
  category: string;
  barcode: string;
  brand: string;
  currentStock: number;
  reorderPoint: number;
  reorderStatus: string;
  assetValue: string;
  stockState: string;
}

interface InventoryTableProps {
  data: InventoryItem[];
  isDark: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusBadge(status: string) {
  if (status === 'In Stock') {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        In Stock
      </span>
    );
  } else if (status === 'Low Stock') {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        Low Stock
      </span>
    );
  } else if (status === 'Out of Stock' || status === 'Out') {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Out of Stock
      </span>
    );
  }
  return null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InventoryTable({ data, isDark }: InventoryTableProps) {
  // ========================================================================
  // COLUMN DEFINITIONS
  // ========================================================================

  const columns: ColumnDef<InventoryItem>[] = [
    {
      key: 'itemType',
      header: 'Item Type',
      accessor: (row) => row.itemType,
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => row.category,
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'barcode',
      header: 'Barcode',
      accessor: (row) => row.barcode,
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'brand',
      header: 'Brand',
      accessor: (row) => row.brand,
      sortable: true,
      filterable: true,
      align: 'left',
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      accessor: (row) => row.currentStock,
      sortable: true,
      filterable: false,
      align: 'center',
      render: (value) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'reorderPoint',
      header: 'Reorder Point',
      accessor: (row) => row.reorderPoint,
      sortable: true,
      filterable: false,
      align: 'center',
    },
    {
      key: 'reorderStatus',
      header: 'Reorder Status',
      accessor: (row) => row.reorderStatus,
      sortable: true,
      filterable: true,
      align: 'center',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'assetValue',
      header: 'Asset Value',
      accessor: (row) => row.assetValue,
      sortable: true,
      filterable: false,
      align: 'right',
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'stockState',
      header: 'Stock State',
      accessor: (row) => row.stockState,
      sortable: true,
      filterable: true,
      align: 'center',
      render: (value) => getStatusBadge(value),
    },
  ];

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <DataTable
      data={data}
      columns={columns}
      theme={isDark ? 'dark' : 'light'}
      emptyMessage="No inventory items found"
      defaultSortKey="itemType"
      defaultSortOrder="asc"
      enableGlobalFilter={true}
      enablePagination={true}
      pageSize={15}
    />
  );
}

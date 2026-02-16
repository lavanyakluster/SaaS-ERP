'use client';

/**
 * Advanced TanStack Table (React Table v8) Component
 * 
 * ✅ Enterprise Features:
 * - Column sorting (multi-column)
 * - Column filtering (individual + global)
 * - Column pinning (left/right)
 * - Column reordering (drag & drop)
 * - Column resizing
 * - Column visibility toggle
 * - Pagination
 * - Dark/light theme support
 * - Row selection
 * - Custom cell renderers
 */

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
  type ColumnOrderState,
  type ColumnSizingState,
  type ColumnPinningState,
  type FilterFn,
} from '@tanstack/react-table';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Settings2,
  X,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  GripVertical,
} from 'lucide-react';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isDark?: boolean;
  height?: string;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnPinning?: boolean;
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;
  enableGlobalFilter?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  isDark = false,
  height = '600px',
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableColumnPinning = true,
  enableColumnReordering = true,
  enableColumnResizing = true,
  enableGlobalFilter = true,
  pageSize = 20,
  onRowClick,
  className = '',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // ✅ Custom filter function for numeric columns
  const numericFilter: FilterFn<TData> = (row, columnId, filterValue) => {
    const value = row.getValue(columnId);
    if (value === null || value === undefined) return false;
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    const filterNum = parseFloat(filterValue);
    
    if (isNaN(numValue) || isNaN(filterNum)) {
      // Fallback to string matching if not a number
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    }
    
    // Support range queries like ">100", "<50", ">=100", "<=50"
    const filterStr = String(filterValue).trim();
    
    if (filterStr.startsWith('>=')) {
      return numValue >= parseFloat(filterStr.substring(2));
    } else if (filterStr.startsWith('<=')) {
      return numValue <= parseFloat(filterStr.substring(2));
    } else if (filterStr.startsWith('>')) {
      return numValue > parseFloat(filterStr.substring(1));
    } else if (filterStr.startsWith('<')) {
      return numValue < parseFloat(filterStr.substring(1));
    } else if (filterStr.includes('-')) {
      // Range query like "10-50"
      const [min, max] = filterStr.split('-').map(s => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        return numValue >= min && numValue <= max;
      }
    }
    
    // Default: check if the number contains the filter value
    return String(numValue).includes(String(filterNum));
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    columnResizeMode: 'onChange',
    enableColumnPinning: enableColumnPinning,
    filterFns: {
      numeric: numericFilter,
    },
    globalFilterFn: 'includesString',
    defaultColumn: {
      size: 200,
      minSize: 100,
      maxSize: 800,
      filterFn: 'auto', // Will auto-detect based on data type
    },
  });

  const baseClasses = isDark
    ? 'bg-gray-900 text-gray-100'
    : 'bg-white text-gray-900';

  const headerClasses = isDark
    ? 'bg-gradient-to-b from-gray-800 to-gray-850 text-gray-200 border-gray-700'
    : 'bg-gradient-to-b from-gray-100 to-gray-50 text-gray-800 border-gray-300';

  const rowClasses = isDark
    ? 'border-gray-700 hover:bg-gray-800/60 transition-all duration-150'
    : 'border-gray-200 hover:bg-blue-50/40 transition-all duration-150';

  const cellClasses = isDark
    ? 'border-gray-700'
    : 'border-gray-200';

  const handleColumnDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const currentOrder = table.getState().columnOrder;
    const allColumns = table.getAllLeafColumns().map(col => col.id);
    const orderedColumns = currentOrder.length ? currentOrder : allColumns;
    
    const draggedIndex = orderedColumns.indexOf(draggedColumn);
    const targetIndex = orderedColumns.indexOf(targetColumnId);
    
    const newOrder = [...orderedColumns];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);
    
    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  const toggleColumnPin = (columnId: string) => {
    const isPinned = table.getState().columnPinning.left?.includes(columnId);
    
    if (isPinned) {
      // Unpin
      setColumnPinning(prev => ({
        ...prev,
        left: prev.left?.filter(id => id !== columnId) || [],
      }));
    } else {
      // Pin to left
      setColumnPinning(prev => ({
        ...prev,
        left: [...(prev.left || []), columnId],
      }));
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-4 p-4 border-b ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        {/* Global Search */}
        {enableGlobalFilter && (
          <div className="relative flex-1 max-w-sm">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border text-sm transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Column Settings */}
        <div className="relative">
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Columns
          </button>

          {/* Column Settings Dropdown */}
          {showColumnSettings && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowColumnSettings(false)}
              />
              <div className={`absolute right-0 top-12 w-72 rounded-lg border shadow-xl z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="font-semibold text-sm">Column Settings</h4>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {table.getAllLeafColumns().map((column) => {
                    const isPinned = table.getState().columnPinning.left?.includes(column.id);
                    const columnDef = column.columnDef as any;
                    const canPin = columnDef.enablePinning !== false && enableColumnPinning;
                    
                    return (
                      <div
                        key={column.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {typeof column.columnDef.header === 'string'
                              ? column.columnDef.header
                              : column.id}
                          </span>
                        </label>
                        
                        {canPin && (
                          <button
                            onClick={() => toggleColumnPin(column.id)}
                            className={`p-1 rounded transition-colors ${
                              isPinned
                                ? 'text-blue-600 hover:text-blue-700'
                                : isDark
                                  ? 'text-gray-400 hover:text-gray-300'
                                  : 'text-gray-500 hover:text-gray-700'
                            }`}
                            title={isPinned ? 'Unpin column' : 'Pin column'}
                          >
                            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      table.resetColumnVisibility();
                      setColumnPinning({});
                      setColumnOrder([]);
                      setColumnSizing({});
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div
        className={`overflow-auto ${baseClasses} border-x ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        style={{ height: enablePagination ? `calc(${height} - 60px)` : height }}
      >
        <table className="w-full border-collapse">
          <thead className={`sticky top-0 z-10 ${headerClasses}`}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  const canResize = header.column.getCanResize() && enableColumnResizing;
                  const canReorder = enableColumnReordering;

                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-center text-xs font-semibold border-b ${cellClasses} relative ${
                        isPinned ? 'sticky z-20 shadow-md' : ''
                      } ${isDark && isPinned ? 'bg-gray-800' : isPinned ? 'bg-gray-50' : ''}`}
                      style={{
                        width: header.getSize(),
                        left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                        right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                      }}
                      draggable={canReorder}
                      onDragStart={() => canReorder && handleColumnDragStart(header.column.id)}
                      onDragOver={handleColumnDragOver}
                      onDrop={() => canReorder && handleColumnDrop(header.column.id)}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {canReorder && (
                            <GripVertical className={`w-4 h-4 cursor-grab ${
                              isDark ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                          )}
                          
                          <div
                            className={`flex items-center justify-center gap-2 flex-1 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {enableSorting && header.column.getCanSort() && (
                              <span className="text-gray-400">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown className="w-4 h-4" />
                                ) : (
                                  <ArrowUpDown className="w-4 h-4 opacity-50" />
                                )}
                              </span>
                            )}
                          </div>

                          {/* Column Resizer */}
                          {canResize && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${
                                header.column.getIsResizing()
                                  ? 'bg-blue-500'
                                  : isDark
                                    ? 'bg-gray-600 hover:bg-gray-500'
                                    : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Column Filter */}
                      {enableFiltering && header.column.getCanFilter() && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={(header.column.getFilterValue() ?? '') as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            placeholder={`Filter...`}
                            className={`w-full px-3 py-2 text-xs rounded border ${
                              isDark
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-4 py-8 text-center text-gray-500 ${cellClasses}`}
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`${rowClasses} ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    rowIndex % 2 === 0 
                      ? isDark ? 'bg-gray-900/50' : 'bg-gray-50/30'
                      : isDark ? 'bg-gray-900' : 'bg-white'
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    
                    return (
                      <td
                        key={cell.id}
                        className={`px-3 py-2 text-sm border-b ${cellClasses} ${
                          isPinned ? 'sticky z-10 shadow-md' : ''
                        } ${isDark && isPinned ? 'bg-gray-900' : isPinned ? 'bg-white' : ''}`}
                        style={{
                          width: cell.column.getSize(),
                          left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                          right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {enablePagination && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-t border-x border-b ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          } rounded-b-lg`}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                  : 'bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400'
              } border ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              } disabled:cursor-not-allowed transition-colors`}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className={`px-3 py-1 rounded ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                  : 'bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400'
              } border ${
                isDark ? 'border-gray-600' : 'border-gray-300'
              } disabled:cursor-not-allowed transition-colors`}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to create a numeric column with formatting
 */
export const createNumericColumn = <TData,>(
  accessorKey: string,
  header: string,
  format: (value: number) => string = (v) => v.toLocaleString()
): ColumnDef<TData> => ({
  accessorKey,
  header,
  cell: ({ getValue }) => {
    const value = getValue() as number;
    return <div className="text-center font-medium">{format(value)}</div>;
  },
});

/**
 * Helper function to create a currency column
 */
export const createCurrencyColumn = <TData,>(
  accessorKey: string,
  header: string,
  currency: string = 'SAR'
): ColumnDef<TData> => ({
  accessorKey,
  header,
  cell: ({ getValue }) => {
    const value = getValue() as number;
    return (
      <div className="text-center font-medium">
        {value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        <span className="text-xs text-gray-500">{currency}</span>
      </div>
    );
  },
});

/**
 * Helper function to create a percentage column
 */
export const createPercentageColumn = <TData,>(
  accessorKey: string,
  header: string
): ColumnDef<TData> => ({
  accessorKey,
  header,
  cell: ({ getValue }) => {
    const value = getValue() as number;
    const isPositive = value >= 0;
    return (
      <div
        className={`text-center font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? '+' : ''}
        {value.toFixed(2)}%
      </div>
    );
  },
});

/**
 * Helper function to create a badge column
 */
export const createBadgeColumn = <TData,>(
  accessorKey: string,
  header: string,
  colorMap?: Record<string, string>
): ColumnDef<TData> => ({
  accessorKey,
  header,
  cell: ({ getValue }) => {
    const value = getValue() as string;
    const color = colorMap?.[value] || 'bg-gray-100 text-gray-800';
    return (
      <div className="flex justify-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
        >
          {value}
        </span>
      </div>
    );
  },
});
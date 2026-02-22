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
  getFacetedRowModel,
  getFacetedUniqueValues,
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
  Filter,
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

interface FilterMenuState {
  columnId: string;
  position: { x: number; y: number };
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
  const EMPTY_FILTER_VALUE = '__EMPTY__';
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
  const [filterMenu, setFilterMenu] = useState<FilterMenuState | null>(null);
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});

  const toFilterValue = (value: unknown) =>
    value === null || value === undefined || value === '' ? EMPTY_FILTER_VALUE : String(value);

  // ✅ Custom filter function for numeric columns
  const numericFilter: FilterFn<TData> = (row, columnId, filterValue) => {
    if (Array.isArray(filterValue)) {
      if (filterValue.length === 0) return true;
      return filterValue.includes(toFilterValue(row.getValue(columnId)));
    }

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

  const multiSelectFilter: FilterFn<TData> = (row, columnId, filterValue) => {
    if (Array.isArray(filterValue)) {
      if (filterValue.length === 0) return true;
      return filterValue.includes(toFilterValue(row.getValue(columnId)));
    }

    if (!filterValue) return true;

    return toFilterValue(row.getValue(columnId))
      .toLowerCase()
      .includes(String(filterValue).toLowerCase());
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
    getFacetedRowModel: enableFiltering ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableFiltering ? getFacetedUniqueValues() : undefined,
    columnResizeMode: 'onChange',
    enableColumnPinning: enableColumnPinning,
    filterFns: {
      numeric: numericFilter,
      multiSelect: multiSelectFilter,
    },
    globalFilterFn: 'includesString',
    defaultColumn: {
      size: 200,
      minSize: 100,
      maxSize: 800,
      filterFn: multiSelectFilter,
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

  const getColumnFilterValues = (columnId: string): string[] => {
    const filterValue = table.getColumn(columnId)?.getFilterValue();
    return Array.isArray(filterValue) ? filterValue.map(String) : [];
  };

  const getColumnUniqueValues = (columnId: string): string[] => {
    const column = table.getColumn(columnId);
    if (!column) return [];

    const values = Array.from(column.getFacetedUniqueValues().keys())
      .map((value) => toFilterValue(value))
      .filter((value, index, arr) => arr.indexOf(value) === index);

    return values.sort((a, b) => {
      if (a === EMPTY_FILTER_VALUE) return 1;
      if (b === EMPTY_FILTER_VALUE) return -1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const getFilteredUniqueValues = (columnId: string): string[] => {
    const searchTerm = (filterSearch[columnId] || '').toLowerCase().trim();
    if (!searchTerm) return getColumnUniqueValues(columnId);

    return getColumnUniqueValues(columnId).filter((value) => {
      const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;
      return displayValue.toLowerCase().includes(searchTerm);
    });
  };

  const toggleFilterMenu = (columnId: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setFilterMenu((prev) =>
      prev?.columnId === columnId
        ? null
        : {
            columnId,
            position: { x: rect.left, y: rect.bottom + 6 },
          }
    );
  };

  const toggleColumnFilterValue = (columnId: string, value: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    const current = getColumnFilterValues(columnId);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    column.setFilterValue(next.length ? next : undefined);
  };

  const toggleSelectAllColumnValues = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    const allValues = getColumnUniqueValues(columnId);
    const selectedValues = getColumnFilterValues(columnId);
    const shouldClear = selectedValues.length === allValues.length;

    column.setFilterValue(shouldClear ? undefined : allValues);
  };

  const clearColumnFilter = (columnId: string) => {
    table.getColumn(columnId)?.setFilterValue(undefined);
  };

  const getStatusColorClasses = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (['paid', 'received', 'active', 'success', 'completed'].includes(normalized)) {
      return isDark
        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
    if (['pending', 'in transit', 'processing', 'open'].includes(normalized)) {
      return isDark
        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
        : 'bg-amber-100 text-amber-700 border border-amber-200';
    }
    if (['overdue', 'cancelled', 'canceled', 'failed', 'inactive', 'rejected'].includes(normalized)) {
      return isDark
        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
        : 'bg-red-100 text-red-700 border border-red-200';
    }
    return null;
  };

  const getSemanticTextClass = (columnId: string, value: unknown) => {
    const id = columnId.toLowerCase();
    if (typeof value === 'number') {
      const metricLikeColumn = /(profit|growth|change|trend|margin|variance|amount|sales|revenue|income|expense|balance|total|value)/.test(id);
      if (metricLikeColumn && value < 0) return 'text-red-600 dark:text-red-400 font-semibold';
      if (metricLikeColumn && value > 0) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      const statusClass = getStatusColorClasses(trimmed);
      if (statusClass) return statusClass;

      if (trimmed.endsWith('%')) {
        const parsed = Number.parseFloat(trimmed);
        if (!Number.isNaN(parsed) && parsed < 0) return 'text-red-600 dark:text-red-400 font-semibold';
        if (!Number.isNaN(parsed) && parsed > 0) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      }
    }

    return null;
  };

  const renderSemanticCell = (cell: any) => {
    const rawValue = cell.getValue();
    const semanticClass = getSemanticTextClass(cell.column.id, rawValue);
    const rendered = flexRender(cell.column.columnDef.cell, cell.getContext());

    if (!semanticClass) {
      return rendered;
    }

    const isBadge = semanticClass.includes('bg-');
    if (isBadge && (typeof rawValue === 'string' || typeof rawValue === 'number')) {
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${semanticClass}`}>
          {String(rawValue)}
        </span>
      );
    }

    return <span className={semanticClass}>{rendered}</span>;
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-4 p-4 border-b ${
        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        {/* Global Filter */}
        {enableGlobalFilter && (
          <div className="relative flex-1 max-w-sm">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Filter all columns..."
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
                  const selectedFilterValues = getColumnFilterValues(header.column.id);
                  const hasActiveFilter = selectedFilterValues.length > 0;

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

                          {enableFiltering && header.column.getCanFilter() && (
                            <button
                              type="button"
                              onClick={(e) => toggleFilterMenu(header.column.id, e)}
                              className={`p-1 rounded transition-colors ${
                                hasActiveFilter
                                  ? 'text-blue-500'
                                  : isDark
                                    ? 'text-gray-500 hover:text-gray-300'
                                    : 'text-gray-400 hover:text-gray-700'
                              }`}
                              title="Filter column"
                            >
                              <Filter className="w-3.5 h-3.5" />
                            </button>
                          )}

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
                        {renderSemanticCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Column Filter Menu */}
      {filterMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setFilterMenu(null)} />
          <div
            className={`fixed z-50 w-72 rounded-lg border shadow-xl overflow-hidden ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
            style={{ left: filterMenu.position.x, top: filterMenu.position.y }}
          >
            <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={filterSearch[filterMenu.columnId] || ''}
                  onChange={(e) =>
                    setFilterSearch((prev) => ({
                      ...prev,
                      [filterMenu.columnId]: e.target.value,
                    }))
                  }
                  placeholder="Search values..."
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => toggleSelectAllColumnValues(filterMenu.columnId)}
                className={`w-full text-left text-xs font-medium ${
                  isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {getColumnFilterValues(filterMenu.columnId).length ===
                getColumnUniqueValues(filterMenu.columnId).length
                  ? 'Clear all'
                  : 'Select all'}
              </button>
            </div>

            <div className="max-h-64 overflow-auto p-2">
              {getFilteredUniqueValues(filterMenu.columnId).length === 0 ? (
                <div className={`px-2 py-4 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No matching values
                </div>
              ) : (
                getFilteredUniqueValues(filterMenu.columnId).map((value) => {
                  const selectedValues = getColumnFilterValues(filterMenu.columnId);
                  const isChecked = selectedValues.includes(value);
                  const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;

                  return (
                    <label
                      key={`${filterMenu.columnId}-${value}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${
                        isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumnFilterValue(filterMenu.columnId, value)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate" title={displayValue}>
                        {displayValue}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <div className={`p-2 border-t flex justify-end ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => clearColumnFilter(filterMenu.columnId)}
                className={`text-xs px-3 py-1.5 rounded ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}

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

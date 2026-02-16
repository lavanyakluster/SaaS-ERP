'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  theme?: 'light' | 'dark' | 'system';
  emptyMessage?: string;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  enableGlobalFilter?: boolean;
  pageSize?: number;
  enablePagination?: boolean;
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

export function DataTable<T>({
  data,
  columns,
  theme = 'light',
  emptyMessage = 'No data available',
  className = '',
  rowClassName = '',
  onRowClick,
  defaultSortKey,
  defaultSortOrder = 'asc',
  enableGlobalFilter = true,
  pageSize = 20,
  enablePagination = true,
}: DataTableProps<T>) {
  const isDark = theme === 'dark';

  // ========================================================================
  // STATE
  // ========================================================================

  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // ========================================================================
  // FILTERING LOGIC
  // ========================================================================

  const filteredData = useMemo(() => {
    let result = [...data];

    // Global filter (search all columns)
    if (globalFilter) {
      result = result.filter((row) => {
        return columns.some((column) => {
          const value = column.accessor(row);
          return String(value)
            .toLowerCase()
            .includes(globalFilter.toLowerCase());
        });
      });
    }

    // Column-specific filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const column = columns.find((col) => col.key === key);
          if (!column) return true;
          const value = column.accessor(row);
          return String(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    return result;
  }, [data, globalFilter, columnFilters, columns]);

  // ========================================================================
  // SORTING LOGIC
  // ========================================================================

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return sortOrder === 'asc' ? -1 : 1;
      if (aString > bString) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // ========================================================================
  // PAGINATION LOGIC
  // ========================================================================

  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setColumnFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = globalFilter || Object.values(columnFilters).some((v) => v);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  const renderSortIcon = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return null;

    if (sortKey !== key) {
      return (
        <div className="inline-flex flex-col ml-1 opacity-30">
          <ChevronUp className="h-3 w-3 -mb-1" />
          <ChevronDown className="h-3 w-3" />
        </div>
      );
    }

    return sortOrder === 'asc' ? (
      <ChevronUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="inline h-4 w-4 ml-1" />
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Filter Bar */}
      {enableGlobalFilter && (
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                } transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {paginatedData.length} of {sortedData.length} results
        {sortedData.length !== data.length && ` (filtered from ${data.length} total)`}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className={`w-full ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <thead>
            {/* Column headers */}
            <tr
              className={`border-b ${
                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-semibold ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${isDark ? 'text-gray-300' : 'text-gray-700'} ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-opacity-70' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>

            {/* Column filters */}
            <tr
              className={`border-b ${
                isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              {columns.map((column) => (
                <th key={`filter-${column.key}`} className="px-4 py-2">
                  {column.filterable && (
                    <input
                      type="text"
                      placeholder={`Filter ${column.header}...`}
                      value={columnFilters[column.key] || ''}
                      onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                      className={`w-full px-2 py-1 text-xs rounded border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500'
                      } focus:outline-none focus:ring-1 focus:ring-primary-500/20`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`px-4 py-8 text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b transition-colors ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  } ${
                    onRowClick
                      ? isDark
                        ? 'hover:bg-gray-800 cursor-pointer'
                        : 'hover:bg-gray-50 cursor-pointer'
                      : ''
                  } ${getRowClassName(row, index)}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const value = column.accessor(row);
                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${
                          column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        } ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {column.render ? column.render(value, row) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800 disabled:hover:bg-transparent'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

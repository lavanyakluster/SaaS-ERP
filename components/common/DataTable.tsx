'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, X, Filter } from 'lucide-react';

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

interface FilterMenuState {
  columnKey: string;
  position: { x: number; y: number };
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
  const EMPTY_FILTER_VALUE = '__EMPTY__';

  // ========================================================================
  // STATE
  // ========================================================================

  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMenu, setFilterMenu] = useState<FilterMenuState | null>(null);
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});

  const toFilterValue = (value: unknown) =>
    value === null || value === undefined || value === '' ? EMPTY_FILTER_VALUE : String(value);

  // ========================================================================
  // FILTERING LOGIC
  // ========================================================================

  const filteredData = useMemo(() => {
    let result = [...data];

    // Global filter (filters across all columns)
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
    Object.entries(columnFilters).forEach(([key, selectedValues]) => {
      if (selectedValues.length > 0) {
        result = result.filter((row) => {
          const column = columns.find((col) => col.key === key);
          if (!column) return true;
          const value = toFilterValue(column.accessor(row));
          return selectedValues.includes(value);
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

  const getColumnUniqueValues = (key: string): string[] => {
    const column = columns.find((col) => col.key === key);
    if (!column) return [];

    const values = Array.from(
      new Set(data.map((row) => toFilterValue(column.accessor(row))))
    );

    return values.sort((a, b) => {
      if (a === EMPTY_FILTER_VALUE) return 1;
      if (b === EMPTY_FILTER_VALUE) return -1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const getFilteredUniqueValues = (key: string): string[] => {
    const searchTerm = (filterSearch[key] || '').toLowerCase().trim();
    if (!searchTerm) return getColumnUniqueValues(key);

    return getColumnUniqueValues(key).filter((value) => {
      const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;
      return displayValue.toLowerCase().includes(searchTerm);
    });
  };

  const toggleFilterMenu = (columnKey: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setFilterMenu((prev) =>
      prev?.columnKey === columnKey
        ? null
        : {
            columnKey,
            position: { x: rect.left, y: rect.bottom + 6 },
          }
    );
  };

  const toggleColumnFilterValue = (key: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: next,
      };
    });
    setCurrentPage(1);
  };

  const toggleSelectAllColumnValues = (key: string) => {
    const allValues = getColumnUniqueValues(key);
    const selectedValues = columnFilters[key] || [];
    const shouldClear = selectedValues.length === allValues.length;

    setColumnFilters((prev) => ({
      ...prev,
      [key]: shouldClear ? [] : allValues,
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: [],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setColumnFilters({});
    setFilterSearch({});
    setCurrentPage(1);
  };

  const hasActiveFilters =
    globalFilter || Object.values(columnFilters).some((values) => values.length > 0);

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

  const renderSemanticValue = (columnKey: string, value: unknown) => {
    if (typeof value === 'string') {
      const statusClass = getStatusColorClasses(value);
      if (statusClass) {
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}>
            {value}
          </span>
        );
      }
    }

    if (typeof value === 'number') {
      const id = columnKey.toLowerCase();
      if (/(amount|sales|profit|revenue|income|expense|total|balance|value|change|trend|growth)/.test(id)) {
        return (
          <span className={value >= 0 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-red-600 dark:text-red-400'}>
            {value}
          </span>
        );
      }
    }

    return value as React.ReactNode;
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
            <Filter
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type="text"
              placeholder="Filter all columns..."
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
                isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700/80' : 'border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50'
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
                    {column.filterable && (
                      <button
                        type="button"
                        onClick={(e) => toggleFilterMenu(column.key, e)}
                        className={`p-1 rounded transition-colors ${
                          (columnFilters[column.key]?.length || 0) > 0
                            ? 'text-blue-500'
                            : isDark
                              ? 'text-gray-500 hover:text-gray-300'
                              : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title="Filter column"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
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
                        ? index % 2 === 0 ? 'bg-gray-800/30 hover:bg-gray-700/40 cursor-pointer' : 'hover:bg-gray-800 cursor-pointer'
                        : index % 2 === 0 ? 'bg-slate-50/60 hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'
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
                        {column.render ? column.render(value, row) : renderSemanticValue(column.key, value)}
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
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  value={filterSearch[filterMenu.columnKey] || ''}
                  onChange={(e) =>
                    setFilterSearch((prev) => ({
                      ...prev,
                      [filterMenu.columnKey]: e.target.value,
                    }))
                  }
                  placeholder="Search values..."
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
              </div>
            </div>

            <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => toggleSelectAllColumnValues(filterMenu.columnKey)}
                className={`w-full text-left text-xs font-medium ${
                  isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {(columnFilters[filterMenu.columnKey]?.length || 0) ===
                getColumnUniqueValues(filterMenu.columnKey).length
                  ? 'Clear all'
                  : 'Select all'}
              </button>
            </div>

            <div className="max-h-64 overflow-auto p-2">
              {getFilteredUniqueValues(filterMenu.columnKey).length === 0 ? (
                <div className={`px-2 py-4 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No matching values
                </div>
              ) : (
                getFilteredUniqueValues(filterMenu.columnKey).map((value) => {
                  const selected = columnFilters[filterMenu.columnKey] || [];
                  const isChecked = selected.includes(value);
                  const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;
                  return (
                    <label
                      key={`${filterMenu.columnKey}-${value}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${
                        isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumnFilterValue(filterMenu.columnKey, value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
                onClick={() => clearColumnFilter(filterMenu.columnKey)}
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

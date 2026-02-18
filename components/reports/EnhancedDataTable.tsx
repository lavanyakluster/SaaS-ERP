'use client';

/**
 * Enhanced Data Table Component
 * Enterprise-level table with column filters, sorting, search, and more
 */

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'select' | 'date';
  filterOptions?: string[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  enableGlobalSearch?: boolean;
  enableColumnFilters?: boolean;
  enableExport?: boolean;
  onExport?: () => void;
}

export function EnhancedDataTable<T>({
  data,
  columns,
  pageSize = 20,
  enableGlobalSearch = true,
  enableColumnFilters = true,
  enableExport = true,
  onExport,
}: EnhancedDataTableProps<T>) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const EMPTY_FILTER_VALUE = '__EMPTY__';

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);

  const toFilterValue = (value: unknown) =>
    value === null || value === undefined || value === '' ? EMPTY_FILTER_VALUE : String(value);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (globalSearch && enableGlobalSearch) {
      const searchLower = globalSearch.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.accessor(row);
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    if (enableColumnFilters) {
      Object.entries(columnFilters).forEach(([key, selectedValues]) => {
        if (selectedValues.length > 0) {
          const column = columns.find((col) => col.key === key);
          if (column) {
            result = result.filter((row) => {
              const cellValue = toFilterValue(column.accessor(row));
              return selectedValues.includes(cellValue);
            });
          }
        }
      });
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      const column = columns.find((col) => col.key === sortConfig.key);
      if (column) {
        result.sort((a, b) => {
          const aValue = column.accessor(a);
          const bValue = column.accessor(b);

          if (aValue === bValue) return 0;

          const comparison = aValue > bValue ? 1 : -1;
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, columns, globalSearch, columnFilters, sortConfig, enableGlobalSearch, enableColumnFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((prev) => ({
      key: columnKey,
      direction:
        prev.key === columnKey
          ? prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    }));
  };

  const getColumnUniqueValues = (columnKey: string): string[] => {
    const column = columns.find((col) => col.key === columnKey);
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

  const getFilteredUniqueValues = (columnKey: string): string[] => {
    const searchTerm = (filterSearch[columnKey] || '').toLowerCase().trim();
    if (!searchTerm) return getColumnUniqueValues(columnKey);

    return getColumnUniqueValues(columnKey).filter((value) => {
      const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;
      return displayValue.toLowerCase().includes(searchTerm);
    });
  };

  const toggleColumnFilterValue = (columnKey: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[columnKey] || [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        ...prev,
        [columnKey]: next,
      };
    });
    setCurrentPage(1);
  };

  const toggleSelectAllColumnValues = (columnKey: string) => {
    const allValues = getColumnUniqueValues(columnKey);
    const selectedValues = columnFilters[columnKey] || [];
    const shouldClear = selectedValues.length === allValues.length;

    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: shouldClear ? [] : allValues,
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: [],
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setFilterSearch({});
    setGlobalSearch('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default CSV export
      const headers = columns.map((col) => col.header).join(',');
      const rows = filteredAndSortedData.map((row) =>
        columns.map((col) => col.accessor(row)).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  const activeFiltersCount =
    Object.values(columnFilters).filter((values) => values.length > 0).length + (globalSearch ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Global Filter */}
        {enableGlobalSearch && (
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                placeholder="Filter across all columns..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Active Filters Indicator */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
              <button
                onClick={clearAllFilters}
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Export Button */}
          {enableExport && (
            <button
              onClick={handleExport}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`p-3 ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Header with Sort */}
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className={`flex items-center gap-1.5 font-semibold transition-colors ${
                            isDark
                              ? 'text-gray-300 hover:text-white'
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <span>{column.header}</span>
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : sortConfig.direction === 'desc' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4 opacity-50" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 opacity-50" />
                          )}
                        </button>
                      ) : (
                        <span
                          className={`font-semibold ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {column.header}
                        </span>
                      )}

                      {/* Filter Icon */}
                      {column.filterable && enableColumnFilters && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveFilterColumn(
                              activeFilterColumn === column.key ? null : column.key
                            )
                          }
                          className={`p-1 rounded transition-colors ${
                            (columnFilters[column.key]?.length || 0) > 0
                              ? 'text-blue-500'
                              : isDark
                              ? 'text-gray-400 hover:text-white'
                              : 'text-gray-400 hover:text-gray-700'
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Column Filter Values */}
                    {column.filterable &&
                      enableColumnFilters &&
                      activeFilterColumn === column.key && (
                        <div className="mt-2 rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
                          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                              <Search
                                className={`absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="Search values..."
                                value={filterSearch[column.key] || ''}
                                onChange={(e) =>
                                  setFilterSearch((prev) => ({
                                    ...prev,
                                    [column.key]: e.target.value,
                                  }))
                                }
                                className={`w-full pl-8 pr-2 py-1.5 rounded border text-xs ${
                                  isDark
                                    ? 'bg-gray-800 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="px-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
                            <button
                              type="button"
                              onClick={() => toggleSelectAllColumnValues(column.key)}
                              className={`w-full text-left text-xs font-medium ${
                                isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              {(columnFilters[column.key]?.length || 0) ===
                              getColumnUniqueValues(column.key).length
                                ? 'Clear all'
                                : 'Select all'}
                            </button>
                          </div>

                          <div className="max-h-48 overflow-auto p-1.5">
                            {getFilteredUniqueValues(column.key).length === 0 ? (
                              <div className={`px-2 py-3 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No matching values
                              </div>
                            ) : (
                              getFilteredUniqueValues(column.key).map((value) => {
                                const selectedValues = columnFilters[column.key] || [];
                                const isChecked = selectedValues.includes(value);
                                const displayValue = value === EMPTY_FILTER_VALUE ? '(Empty)' : value;

                                return (
                                  <label
                                    key={`${column.key}-${value}`}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer ${
                                      isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleColumnFilterValue(column.key, value)}
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

                          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                              type="button"
                              onClick={() => clearColumnFilter(column.key)}
                              className={`text-xs px-2.5 py-1 rounded ${
                                isDark
                                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Clear
                            </button>
                          </div>
                        </div>
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
                    className={`p-8 text-center ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    No data found matching your filters
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-t ${
                      isDark
                        ? 'border-gray-700 hover:bg-gray-700/30'
                        : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    {columns.map((column) => {
                      const value = column.accessor(row);
                      return (
                        <td
                          key={column.key}
                          className={`p-3 ${
                            column.align === 'right'
                              ? 'text-right'
                              : column.align === 'center'
                              ? 'text-center'
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
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of{' '}
              {filteredAndSortedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === 1
                    ? isDark
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'border-gray-700 text-white hover:bg-gray-700'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === totalPages
                    ? isDark
                      ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'border-gray-700 text-white hover:bg-gray-700'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

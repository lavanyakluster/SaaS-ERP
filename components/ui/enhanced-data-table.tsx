'use client';

/**
 * Enhanced DataTable with Advanced Filtering & Sorting
 * Based on AG Grid/MUI DataGrid patterns
 * 
 * Features:
 * - Column header menu (3-dot icon)
 * - Multi-level filter with search
 * - Sort ascending/descending
 * - Pin columns
 * - Column visibility
 * - Expand/collapse groups
 */

import { useState, useMemo, useRef, useEffect } from 'react';
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
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings2,
  MoreVertical,
  Filter,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Check,
} from 'lucide-react';

export interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isDark?: boolean;
  height?: string;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnMenu?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  className?: string;
}

interface ColumnMenuState {
  columnId: string;
  position: { x: number; y: number };
}

interface FilterMenuState {
  columnId: string;
  position: { x: number; y: number };
}

export function EnhancedDataTable<TData>({
  data,
  columns,
  isDark = false,
  height = '600px',
  enablePagination = true,
  enableSorting = true,
  enableFiltering = true,
  enableColumnMenu = true,
  pageSize = 20,
  onRowClick,
  className = '',
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState<ColumnMenuState | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState<FilterMenuState | null>(null);
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(new Set());
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<any>>>({}); 

  const menuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setColumnMenuOpen(null);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique values for a column
  const getColumnUniqueValues = (columnId: string) => {
    const values = new Set<any>();
    data.forEach((row: any) => {
      const value = row[columnId];
      if (value !== null && value !== undefined && value !== '') {
        values.add(value);
      }
    });
    return Array.from(values).sort();
  };

  // Handle column menu click
  const handleColumnMenuClick = (columnId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setColumnMenuOpen({
      columnId,
      position: { x: rect.left, y: rect.bottom + 5 },
    });
    setFilterMenuOpen(null);
  };

  // Handle filter menu click
  const handleFilterClick = (columnId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setColumnMenuOpen(null);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setFilterMenuOpen({
      columnId,
      position: { x: rect.left, y: rect.bottom + 5 },
    });
  };

  // Handle sort
  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    setSorting([{ id: columnId, desc: direction === 'desc' }]);
    setColumnMenuOpen(null);
  };

  // Handle pin column
  const handlePinColumn = (columnId: string) => {
    const newPinned = new Set(pinnedColumns);
    if (newPinned.has(columnId)) {
      newPinned.delete(columnId);
    } else {
      newPinned.add(columnId);
    }
    setPinnedColumns(newPinned);
    setColumnMenuOpen(null);
  };

  // Handle column visibility
  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Handle filter selection
  const handleFilterSelect = (columnId: string, value: any) => {
    const current = selectedFilters[columnId] || new Set();
    const newSet = new Set(current);
    
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    
    setSelectedFilters({
      ...selectedFilters,
      [columnId]: newSet,
    });

    // Apply filter to table
    if (newSet.size > 0) {
      table.getColumn(columnId)?.setFilterValue(Array.from(newSet));
    } else {
      table.getColumn(columnId)?.setFilterValue(undefined);
    }
  };

  // Handle select all filters
  const handleSelectAllFilters = (columnId: string) => {
    const values = getColumnUniqueValues(columnId);
    const current = selectedFilters[columnId] || new Set();
    
    if (current.size === values.length) {
      // Deselect all
      setSelectedFilters({
        ...selectedFilters,
        [columnId]: new Set(),
      });
      table.getColumn(columnId)?.setFilterValue(undefined);
    } else {
      // Select all
      const newSet = new Set(values);
      setSelectedFilters({
        ...selectedFilters,
        [columnId]: newSet,
      });
      table.getColumn(columnId)?.setFilterValue(Array.from(newSet));
    }
  };

  // Filter unique values based on search
  const getFilteredUniqueValues = (columnId: string) => {
    const values = getColumnUniqueValues(columnId);
    const search = filterSearch[columnId] || '';
    
    if (!search) return values;
    
    return values.filter(v => 
      String(v).toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Table Container */}
      <div
        className={`overflow-auto rounded-lg border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{ maxHeight: height }}
      >
        <table className="w-full">
          <thead
            className={`sticky top-0 z-10 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const isSorted = sorting.find(s => s.id === columnId);
                  const isPinned = pinnedColumns.has(columnId);

                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-xs font-semibold border-b ${
                        isDark
                          ? 'text-gray-200 border-gray-700'
                          : 'text-gray-700 border-gray-200'
                      } ${isPinned ? 'sticky left-0 z-20 bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Column Header Text */}
                          <span
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => {
                              if (enableSorting) {
                                const current = isSorted;
                                if (!current) {
                                  handleSort(columnId, 'asc');
                                } else if (current.desc === false) {
                                  handleSort(columnId, 'desc');
                                } else {
                                  setSorting([]);
                                }
                              }
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>

                          {/* Sort Indicator */}
                          {isSorted && (
                            <span className="text-blue-600">
                              {isSorted.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                            </span>
                          )}
                        </div>

                        {/* Column Menu Icons */}
                        {enableColumnMenu && !header.isPlaceholder && (
                          <div className="flex items-center gap-1">
                            {/* Filter Icon */}
                            {enableFiltering && (
                              <button
                                onClick={(e) => handleFilterClick(columnId, e)}
                                className={`p-1 rounded hover:bg-gray-200 ${
                                  columnFilters.find(f => f.id === columnId)
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}
                                title="Filter"
                              >
                                <Filter className="size-3.5" />
                              </button>
                            )}

                            {/* Menu Icon */}
                            <button
                              onClick={(e) => handleColumnMenuClick(columnId, e)}
                              className="p-1 rounded hover:bg-gray-200 text-gray-400"
                              title="Column menu"
                            >
                              <MoreVertical className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`border-b ${
                  isDark
                    ? 'border-gray-700 hover:bg-gray-800'
                    : 'border-gray-200 hover:bg-gray-50'
                } ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {row.getVisibleCells().map((cell) => {
                  const isPinned = pinnedColumns.has(cell.column.id);
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-2.5 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      } ${isPinned ? 'sticky left-0 z-10 bg-white' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {table.getRowModel().rows.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Column Menu Dropdown */}
      {columnMenuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{
            left: columnMenuOpen.position.x,
            top: columnMenuOpen.position.y,
          }}
        >
          {/* Sort Options */}
          {enableSorting && (
            <>
              <button
                onClick={() => handleSort(columnMenuOpen.columnId, 'asc')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <ArrowUp className="size-4" />
                Sort Ascending
              </button>
              <button
                onClick={() => handleSort(columnMenuOpen.columnId, 'desc')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <ArrowDown className="size-4" />
                Sort Descending
              </button>
              <div className="border-t border-gray-200 my-1" />
            </>
          )}

          {/* Pin Column */}
          <button
            onClick={() => handlePinColumn(columnMenuOpen.columnId)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            {pinnedColumns.has(columnMenuOpen.columnId) ? (
              <>
                <PinOff className="size-4" />
                Unpin Column
              </>
            ) : (
              <>
                <Pin className="size-4" />
                Pin Column
              </>
            )}
          </button>

          <div className="border-t border-gray-200 my-1" />

          {/* Hide Column */}
          <button
            onClick={() => {
              handleToggleColumn(columnMenuOpen.columnId);
              setColumnMenuOpen(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <EyeOff className="size-4" />
            Hide Column
          </button>
        </div>
      )}

      {/* Filter Menu Dropdown */}
      {filterMenuOpen && (
        <div
          ref={filterMenuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-64 max-h-96 overflow-hidden flex flex-col"
          style={{
            left: filterMenuOpen.position.x,
            top: filterMenuOpen.position.y,
          }}
        >
          {/* Search Input */}
          <div className="px-3 pb-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filterSearch[filterMenuOpen.columnId] || ''}
                onChange={(e) =>
                  setFilterSearch({
                    ...filterSearch,
                    [filterMenuOpen.columnId]: e.target.value,
                  })
                }
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Select All */}
          <div className="px-3 py-2 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={
                  (selectedFilters[filterMenuOpen.columnId]?.size || 0) ===
                  getColumnUniqueValues(filterMenuOpen.columnId).length
                }
                onChange={() => handleSelectAllFilters(filterMenuOpen.columnId)}
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">(Select All)</span>
            </label>
          </div>

          {/* Filter Values */}
          <div className="overflow-y-auto flex-1">
            {getFilteredUniqueValues(filterMenuOpen.columnId).map((value, idx) => {
              const isSelected = selectedFilters[filterMenuOpen.columnId]?.has(value) || false;
              return (
                <label
                  key={idx}
                  className="flex items-center gap-2 px-5 py-1.5 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFilterSelect(filterMenuOpen.columnId, value)}
                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm truncate" title={String(value)}>
                    {String(value)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {enablePagination && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-t ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`p-2 rounded border ${
                isDark
                  ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50'
                  : 'border-gray-300 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`p-2 rounded border ${
                isDark
                  ? 'border-gray-700 hover:bg-gray-700 disabled:opacity-50'
                  : 'border-gray-300 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

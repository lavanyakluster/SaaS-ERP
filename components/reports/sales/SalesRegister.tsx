'use client';

// ✅ ENTERPRISE-LEVEL HIERARCHICAL TABLE with ALL ADVANCED FEATURES
// Features: Global Search, Column Filtering, Column Visibility, Export, Pagination, Density Control

import { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Download,
  Filter,
  Eye,
  EyeOff,
  Settings,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  X,
  FileText
} from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesRegister, useSalesRegisterDetail } from '@/lib/hooks/useSalesRegister';
import type { SalesRegisterRecord, SalesRegisterDetailRecord } from '@/lib/types/sales-register.types';

interface SalesRegisterProps {
  filters: {
    branchCode: string;
    fromDate: string;
    toDate: string;
  };
}

// Helper function to get current quarter dates
const getQuarterDates = (): { fromDate: string; toDate: string } => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const quarter = Math.floor(today.getMonth() / 3);
  const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
  return { 
    fromDate: formatDate(quarterStart), 
    toDate: formatDate(today) 
  };
};

// Group data by branch
interface BranchGroup {
  branchCode: string;
  branchName: string;
  bills: SalesRegisterRecord[];
  total: number;
}

type SortField = 'BillNo' | 'Date' | 'Code' | 'Party' | 'SalesMan' | 'RefNo' | 'RefDate' | 'Branch' | 'Net';
type SortOrder = 'asc' | 'desc' | null;

export default function SalesRegister({ filters }: SalesRegisterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches and bills
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const [loadedDetails, setLoadedDetails] = useState<Map<string, SalesRegisterDetailRecord[]>>(new Map());
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Use default values if no filters are provided from parent
  const defaultDates = getQuarterDates();
  const effectiveFilters = {
    branchCode: filters.branchCode || '000', // '000' = All Branches
    fromDate: filters.fromDate || defaultDates.fromDate,
    toDate: filters.toDate || defaultDates.toDate,
  };

  // Always fetch data with effective filters (defaults or provided)
  const hasFilters = true; // Always enabled

  // Fetch sales register master data with effective filters
  const { data: salesRegisterData, isLoading } = useSalesRegister(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> none
      setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc');
      if (sortOrder === 'desc') {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Apply sorting to data
  const sortedData = useMemo(() => {
    if (!salesRegisterData || !sortField || !sortOrder) return salesRegisterData;
    
    return [...salesRegisterData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [salesRegisterData, sortField, sortOrder]);

  // Group data by branch (using sorted data)
  const branchGroups = useMemo<BranchGroup[]>(() => {
    if (!sortedData) return [];
    
    const groups = new Map<string, BranchGroup>();
    
    sortedData.forEach(record => {
      const branchCode = record.Branch.replace(/[PVMAWS]/g, '');
      
      if (!groups.has(branchCode)) {
        groups.set(branchCode, {
          branchCode,
          branchName: record.Branch,
          bills: [],
          total: 0,
        });
      }
      
      const group = groups.get(branchCode)!;
      group.bills.push(record);
      group.total += record.Net;
    });
    
    return Array.from(groups.values()).sort((a, b) => 
      a.branchCode.localeCompare(b.branchCode)
    );
  }, [sortedData]);

  // Auto-expand all branches when data loads
  useMemo(() => {
    if (branchGroups.length > 0) {
      const allBranchCodes = new Set(branchGroups.map(g => g.branchCode));
      setExpandedBranches(allBranchCodes);
    }
  }, [branchGroups]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return branchGroups.reduce((sum, group) => sum + group.total, 0);
  }, [branchGroups]);

  // Toggle branch expansion
  const toggleBranch = (branchCode: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchCode)) {
      newExpanded.delete(branchCode);
    } else {
      newExpanded.add(branchCode);
    }
    setExpandedBranches(newExpanded);
  };

  // Toggle bill expansion and load details
  const toggleBill = async (billKey: string, shid: number, brCode: string, billDate: string) => {
    const newExpanded = new Set(expandedBills);
    
    if (newExpanded.has(billKey)) {
      newExpanded.delete(billKey);
    } else {
      newExpanded.add(billKey);
      
      // Load details if not already loaded
      if (!loadedDetails.has(billKey)) {
        try {
          // Extract year from bill date
          const year = billDate ? new Date(billDate).getFullYear().toString() : new Date().getFullYear().toString();
          
          const { getSalesRegisterDetail } = await import('@/lib/api/sales-register.api');
          const details = await getSalesRegisterDetail({ shid, brCode, year });
          setLoadedDetails(prev => new Map(prev).set(billKey, details));
        } catch (error) {
          console.error('Failed to load details:', error);
        }
      }
    }
    
    setExpandedBills(newExpanded);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB');
  };

  // Sortable column header
  const SortableHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <div 
      className={`flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors ${align === 'right' ? 'justify-end' : ''}`}
      onClick={() => handleSort(field)}
    >
      <span>{label}</span>
      {sortField === field ? (
        sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </div>
  );

  // ============================================================================
  // ✅ ENTERPRISE TABLE FEATURES STATE
  // ============================================================================

  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);
  const [density, setDensity] = useState<'compact' | 'standard' | 'comfortable'>('standard');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    BillNo: true,
    Date: true,
    Code: true,
    Party: true,
    SalesMan: true,
    RefNo: true,
    RefDate: true,
    Branch: true,
    Net: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ============================================================================
  // ✅ FILTERING & SEARCHING LOGIC
  // ============================================================================

  // Apply global search and column filters
  const filteredData = useMemo(() => {
    if (!sortedData) return sortedData;

    let filtered = sortedData;

    // Global search
    if (globalSearch.trim()) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Column-specific filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue.trim()) {
        const filterLower = filterValue.toLowerCase();
        filtered = filtered.filter(row => 
          String(row[column as keyof SalesRegisterRecord]).toLowerCase().includes(filterLower)
        );
      }
    });

    return filtered;
  }, [sortedData, globalSearch, columnFilters]);

  // Recalculate groups based on filtered data
  const filteredBranchGroups = useMemo<BranchGroup[]>(() => {
    if (!filteredData) return [];
    
    const groups = new Map<string, BranchGroup>();
    
    filteredData.forEach(record => {
      const branchCode = record.Branch.replace(/[PVMAWS]/g, '');
      
      if (!groups.has(branchCode)) {
        groups.set(branchCode, {
          branchCode,
          branchName: record.Branch,
          bills: [],
          total: 0,
        });
      }
      
      const group = groups.get(branchCode)!;
      group.bills.push(record);
      group.total += record.Net;
    });
    
    return Array.from(groups.values()).sort((a, b) => 
      a.branchCode.localeCompare(b.branchCode)
    );
  }, [filteredData]);

  // Pagination logic
  const totalItems = filteredBranchGroups.reduce((sum, group) => sum + group.bills.length, 0);
  const totalPages = Math.ceil(totalItems / pageSize);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredData) return;

    const headers = ['Bill No', 'Date', 'Code', 'Party', 'Salesman', 'Ref No', 'Ref Date', 'Branch', 'Net Amount'];
    const csvData = filteredData.map(row => [
      row.BillNo,
      formatDate(row.Date),
      row.Code,
      row.Party || '',
      row.SalesMan || '',
      row.RefNo || '',
      formatDate(row.RefDate),
      row.Branch,
      row.Net.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-register-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to Excel-compatible format
  const handleExportExcel = () => {
    if (!filteredData) return;

    const headers = ['Bill No', 'Date', 'Code', 'Party', 'Salesman', 'Ref No', 'Ref Date', 'Branch', 'Net Amount'];
    const excelData = filteredData.map(row => [
      row.BillNo,
      formatDate(row.Date),
      row.Code,
      row.Party || '',
      row.SalesMan || '',
      row.RefNo || '',
      formatDate(row.RefDate),
      row.Branch,
      row.Net.toFixed(2),
    ]);

    const tsvContent = [
      headers.join('\t'),
      ...excelData.map(row => row.join('\t'))
    ].join('\n');

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-register-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  // Density class mapping
  const densityClasses = {
    compact: 'py-1 text-xs',
    standard: 'py-2.5 text-sm',
    comfortable: 'py-4 text-base',
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading sales register...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!salesRegisterData || salesRegisterData.length === 0) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No sales register data found for the selected filters.
            </p>
          </div>
        </div>
      )}

      {/* Hierarchical Grouped Table */}
      {!isLoading && branchGroups.length > 0 && (
        <div className="space-y-4">
          {/* ============================================================================
              ✅ ENTERPRISE TOOLBAR - Search, Filter, Export, Column Visibility, Density
              ============================================================================ */}
          <div className={`rounded-lg border p-4 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Top Row: Search & Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* Global Filter */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Filter across all columns..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  />
                  {globalSearch && (
                    <button
                      onClick={() => setGlobalSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Column Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    showFilters
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {/* Column Visibility Toggle */}
                <button
                  onClick={() => setShowColumnVisibility(!showColumnVisibility)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    showColumnVisibility
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Columns
                </button>

                {/* Density Control */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const densities: Array<'compact' | 'standard' | 'comfortable'> = ['compact', 'standard', 'comfortable'];
                      const currentIndex = densities.indexOf(density);
                      setDensity(densities[(currentIndex + 1) % densities.length]);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title={`Current: ${density}`}
                  >
                    {density === 'compact' && <Minimize2 className="w-4 h-4" />}
                    {density === 'standard' && <Settings className="w-4 h-4" />}
                    {density === 'comfortable' && <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Export Dropdown */}
                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <button
                      onClick={handleExportCSV}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                        isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Filters Row (Conditional) */}
            {showFilters && (
              <div className={`pt-3 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(visibleColumns).filter(([_, visible]) => visible).map(([column]) => (
                    <div key={column}>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {column}
                      </label>
                      <input
                        type="text"
                        placeholder={`Filter ${column}...`}
                        value={columnFilters[column] || ''}
                        onChange={(e) => setColumnFilters(prev => ({ ...prev, [column]: e.target.value }))}
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Column Visibility Panel (Conditional) */}
            {showColumnVisibility && (
              <div className={`pt-3 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(visibleColumns).map(([column, visible]) => (
                    <label key={column} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumnVisibility(column)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {column}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className={`flex items-center justify-between pt-3 mt-3 border-t text-sm ${
              isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
              <div>
                Showing <span className="font-semibold text-blue-600">{filteredData?.length || 0}</span> of <span className="font-semibold">{salesRegisterData?.length || 0}</span> records
              </div>
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={`px-2 py-1 rounded border text-sm ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={999999}>All</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hierarchical Table */}
        <div className={`rounded-lg border overflow-hidden shadow-sm ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Table Header with Sortable Columns */}
          <div className={`grid gap-3 px-4 py-3 font-semibold text-sm border-b ${
            isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`} style={{ gridTemplateColumns: '140px 100px 100px 250px 180px 100px 100px 80px 120px' }}>
            <SortableHeader field="BillNo" label="Bill No." />
            <SortableHeader field="Date" label="Date" />
            <SortableHeader field="Code" label="Code" />
            <SortableHeader field="Party" label="Party" />
            <SortableHeader field="SalesMan" label="Salesman" />
            <SortableHeader field="RefNo" label="Ref No." />
            <SortableHeader field="RefDate" label="Ref Date" />
            <SortableHeader field="Branch" label="Branch" />
            <SortableHeader field="Net" label="Net Amount" align="right" />
          </div>

          {/* Table Body */}
          <div>
            {filteredBranchGroups.map((group) => (
              <div key={group.branchCode}>
                {/* Branch Header Row */}
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer font-semibold border-b ${
                    isDark
                      ? 'bg-blue-900/30 hover:bg-blue-900/40 border-gray-700 text-blue-300'
                      : 'bg-blue-50 hover:bg-blue-100 border-gray-200 text-blue-700'
                  }`}
                  onClick={() => toggleBranch(group.branchCode)}
                >
                  <div className="flex items-center gap-2">
                    {expandedBranches.has(group.branchCode) ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                    <span>Branch: {group.branchName}</span>
                  </div>
                  <div className="text-right">
                    Total: {formatCurrency(group.total)}
                  </div>
                </div>

                {/* Bills under this branch */}
                {expandedBranches.has(group.branchCode) && (
                  <div>
                    {group.bills.map((bill) => {
                      const billKey = `${bill.ID}-${bill.Branch}`;
                      const isExpanded = expandedBills.has(billKey);
                      const details = loadedDetails.get(billKey) || [];

                      return (
                        <div key={billKey}>
                          {/* Bill Row */}
                          <div
                            className={`grid gap-3 px-4 py-2.5 cursor-pointer border-b ${
                              isDark
                                ? 'hover:bg-gray-700/50 border-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                            style={{ gridTemplateColumns: '140px 100px 100px 250px 180px 100px 100px 80px 120px' }}
                            onClick={() => toggleBill(billKey, bill.ID, group.branchCode, bill.Date)}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="size-3.5 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="size-3.5 flex-shrink-0" />
                              )}
                              <span className="font-medium truncate" title={bill.BillNo}>{bill.BillNo}</span>
                            </div>
                            <div>{formatDate(bill.Date)}</div>
                            <div className="truncate" title={bill.Code}>{bill.Code}</div>
                            <div className="truncate" title={bill.Party}>
                              {bill.Party || '-'}
                            </div>
                            <div className="truncate" title={bill.SalesMan}>{bill.SalesMan || '-'}</div>
                            <div className="truncate" title={bill.RefNo}>{bill.RefNo || '-'}</div>
                            <div>{formatDate(bill.RefDate)}</div>
                            <div>{bill.Branch}</div>
                            <div className="text-right font-semibold">
                              {formatCurrency(bill.Net)}
                            </div>
                          </div>

                          {/* Detail Rows */}
                          {isExpanded && details.length > 0 && (
                            <div className={`${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
                              {/* Detail Header */}
                              <div className={`grid gap-2 px-8 py-2 text-xs font-semibold border-b ${
                                isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'
                              }`} style={{ gridTemplateColumns: '100px 100px 250px 100px 80px 80px 100px 100px' }}>
                                <div>Code</div>
                                <div>Barcode</div>
                                <div>Product</div>
                                <div className="text-right">Rate</div>
                                <div className="text-right">Qty</div>
                                <div className="text-right">Disc</div>
                                <div className="text-right">Tax</div>
                                <div className="text-right">Net</div>
                              </div>

                              {/* Detail Rows */}
                              {details.map((detail, idx) => (
                                <div
                                  key={idx}
                                  className={`grid gap-2 px-8 py-2 text-sm border-b ${
                                    isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
                                  }`}
                                  style={{ gridTemplateColumns: '100px 100px 250px 100px 80px 80px 100px 100px' }}
                                >
                                  <div className="truncate" title={detail.Code}>{detail.Code}</div>
                                  <div className="truncate" title={detail.Barcode || '-'}>{detail.Barcode || '-'}</div>
                                  <div className="truncate" title={detail.Product}>
                                    {detail.Product}
                                  </div>
                                  <div className="text-right">{formatCurrency(detail.Rate)}</div>
                                  <div className="text-right">{detail.Qty}</div>
                                  <div className="text-right">{detail.Discount}</div>
                                  <div className="text-right">{formatCurrency(detail.Tax)}</div>
                                  <div className="text-right font-semibold">
                                    {formatCurrency(detail.Net)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className={`px-4 py-4 font-bold text-lg border-t ${
            isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center">
              <span>Grand Total:</span>
              <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

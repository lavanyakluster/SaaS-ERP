'use client';

// ✅ Hierarchical Row Grouping with Enhanced Features: Branch → Bill → Details

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesReturn, useSalesReturnDetail } from '@/lib/hooks/useSalesReturn';
import type { SalesReturnRecord, SalesReturnDetailRecord } from '@/lib/types/sales-return.types';

interface SalesReturnProps {
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
  bills: SalesReturnRecord[];
  total: number;
}

type SortField = 'BillNo' | 'Date' | 'Code' | 'Party' | 'SalesMan' | 'RefNo' | 'RefDate' | 'Branch' | 'Net';
type SortOrder = 'asc' | 'desc' | null;

export default function SalesReturn({ filters }: SalesReturnProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches and bills
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const [loadedDetails, setLoadedDetails] = useState<Map<string, SalesReturnDetailRecord[]>>(new Map());
  
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

  // Fetch sales return master data with effective filters
  const { data: salesReturnData, isLoading } = useSalesReturn(
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
    if (!salesReturnData || !sortField || !sortOrder) return salesReturnData;
    
    return [...salesReturnData].sort((a, b) => {
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
  }, [salesReturnData, sortField, sortOrder]);

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
          
          const { getSalesReturnDetail } = await import('@/lib/api/sales-return.api');
          const details = await getSalesReturnDetail({ shid, brCode, year });
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

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading sales returns...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!salesReturnData || salesReturnData.length === 0) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No sales return data found for the selected filters.
            </p>
          </div>
        </div>
      )}

      {/* Hierarchical Grouped Table */}
      {!isLoading && branchGroups.length > 0 && (
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
            {branchGroups.map((group) => (
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
      )}
    </div>
  );
}

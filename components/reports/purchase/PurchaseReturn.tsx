'use client';

// ✅ Hierarchical Row Grouping with Enhanced Features: Branch → GRN

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { usePurchaseReturn } from '@/lib/hooks/usePurchaseReturn';
import type { PurchaseReturnRecord } from '@/lib/types/purchase-return.types';

interface PurchaseReturnProps {
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
  grns: PurchaseReturnRecord[];
  total: number;
}

type SortField = 'DocNo' | 'Date' | 'Code' | 'Supplier' | 'RefBillNo' | 'RefBillDate' | 'Branch' | 'Net';
type SortOrder = 'asc' | 'desc' | null;

export default function PurchaseReturn({ filters }: PurchaseReturnProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  
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

  // Fetch purchase return master data with effective filters
  const { data: purchaseReturnData, isLoading } = usePurchaseReturn(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Group data by branch
  const branchGroups = useMemo<BranchGroup[]>(() => {
    if (!purchaseReturnData) return [];
    
    const groups = new Map<string, BranchGroup>();
    
    purchaseReturnData.forEach(record => {
      const branchCode = record.Branch.replace(/[PVMAWS]/g, '');
      
      if (!groups.has(branchCode)) {
        groups.set(branchCode, {
          branchCode,
          branchName: record.Branch,
          grns: [],
          total: 0,
        });
      }
      
      const group = groups.get(branchCode)!;
      group.grns.push(record);
      group.total += record.Net;
    });
    
    return Array.from(groups.values()).sort((a, b) => 
      a.branchCode.localeCompare(b.branchCode)
    );
  }, [purchaseReturnData]);

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

  // Sort GRNs within a branch
  const sortGRNs = (grns: PurchaseReturnRecord[], field: SortField, order: SortOrder) => {
    return grns.sort((a, b) => {
      if (order === 'asc') {
        return a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
      } else if (order === 'desc') {
        return a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0;
      }
      return 0;
    });
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading purchase returns...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!purchaseReturnData || purchaseReturnData.length === 0) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No purchase return data found for the selected filters.
            </p>
          </div>
        </div>
      )}

      {/* Hierarchical Grouped Table */}
      {!isLoading && branchGroups.length > 0 && (
        <div className={`rounded-lg border overflow-hidden shadow-sm ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Table Header */}
          <div className={`grid gap-3 px-4 py-3 font-semibold text-sm border-b ${
            isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`} style={{ gridTemplateColumns: '140px 100px 100px 280px 120px 120px 80px 120px' }}>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('DocNo')}>
              Doc No.
              {sortField === 'DocNo' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('Date')}>
              Date
              {sortField === 'Date' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('Code')}>
              Code
              {sortField === 'Code' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('Supplier')}>
              Supplier
              {sortField === 'Supplier' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('RefBillNo')}>
              Ref Bill No.
              {sortField === 'RefBillNo' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('RefBillDate')}>
              Ref Bill Date
              {sortField === 'RefBillDate' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('Branch')}>
              Branch
              {sortField === 'Branch' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
            <div className="text-right flex items-center gap-1 cursor-pointer" onClick={() => handleSort('Net')}>
              Net Amount
              {sortField === 'Net' && (
                sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />
              )}
            </div>
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

                {/* GRNs under this branch */}
                {expandedBranches.has(group.branchCode) && (
                  <div>
                    {sortGRNs(group.grns, sortField || 'DocNo', sortOrder || 'asc').map((grn, idx) => {
                      return (
                        <div
                          key={`${grn.Id}-${idx}`}
                          className={`grid gap-3 px-4 py-2.5 border-b ${
                            isDark
                              ? 'hover:bg-gray-700/50 border-gray-700 text-gray-300'
                              : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                          style={{ gridTemplateColumns: '140px 100px 100px 280px 120px 120px 80px 120px' }}
                        >
                          <div className="font-medium truncate" title={grn.DocNo}>{grn.DocNo}</div>
                          <div>{formatDate(grn.Date)}</div>
                          <div className="truncate" title={grn.Code}>{grn.Code}</div>
                          <div className="truncate" title={grn.Supplier}>
                            {grn.Supplier || '-'}
                          </div>
                          <div className="truncate" title={grn.RefBillNo}>{grn.RefBillNo || '-'}</div>
                          <div>{formatDate(grn.RefBillDate)}</div>
                          <div>{grn.Branch}</div>
                          <div className="text-right font-semibold">
                            {formatCurrency(grn.Net)}
                          </div>
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
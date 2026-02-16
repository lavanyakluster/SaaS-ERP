'use client';

// ✅ Hierarchical Row Grouping with Enhanced Features: Branch → GRN → Details

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { usePurchaseRegister, usePurchaseRegisterDetail } from '@/lib/hooks/usePurchaseRegister';
import type { PurchaseRegisterRecord, PurchaseRegisterDetailItem } from '@/lib/types/purchase-register.types';

interface PurchaseRegisterProps {
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
  grns: PurchaseRegisterRecord[];
  total: number;
}

type SortField = 'Grn' | 'Date' | 'Bill No.' | 'Bill Date' | 'Supplier' | 'RefNo' | 'Branch' | 'Net';
type SortOrder = 'asc' | 'desc' | null;

export default function PurchaseRegister({ filters }: PurchaseRegisterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches and GRNs
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedGRNs, setExpandedGRNs] = useState<Set<string>>(new Set());
  const [loadedDetails, setLoadedDetails] = useState<Map<string, PurchaseRegisterDetailItem[]>>(new Map());
  
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

  // Fetch purchase register master data with effective filters
  const { data: purchaseRegisterData, isLoading } = usePurchaseRegister(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Group data by branch
  const branchGroups = useMemo<BranchGroup[]>(() => {
    if (!purchaseRegisterData) return [];
    
    const groups = new Map<string, BranchGroup>();
    
    purchaseRegisterData.forEach(record => {
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
  }, [purchaseRegisterData]);

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

  // Toggle GRN expansion and load details
  const toggleGRN = async (grnKey: string, shid: number, brCode: string, grnDate: string) => {
    const newExpanded = new Set(expandedGRNs);
    
    if (newExpanded.has(grnKey)) {
      newExpanded.delete(grnKey);
    } else {
      newExpanded.add(grnKey);
      
      // Load details if not already loaded
      if (!loadedDetails.has(grnKey)) {
        try {
          // Extract year from GRN date
          const year = grnDate ? new Date(grnDate).getFullYear().toString() : new Date().getFullYear().toString();
          
          const { getPurchaseRegisterDetail } = await import('@/lib/api/purchase-register.api');
          const details = await getPurchaseRegisterDetail({ shid, brCode, year });
          setLoadedDetails(prev => new Map(prev).set(grnKey, details));
        } catch (error) {
          console.error('Failed to load details:', error);
        }
      }
    }
    
    setExpandedGRNs(newExpanded);
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
  const sortGRNs = (grns: PurchaseRegisterRecord[]) => {
    if (!sortField) return grns;
    
    const sorted = [...grns].sort((a, b) => {
      const aValue = a[sortField as keyof PurchaseRegisterRecord];
      const bValue = b[sortField as keyof PurchaseRegisterRecord];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    
    return sorted;
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading purchase register...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && (!purchaseRegisterData || purchaseRegisterData.length === 0) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No purchase register data found for the selected filters.
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
          }`} style={{ gridTemplateColumns: '140px 100px 120px 100px 250px 100px 80px 120px' }}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Grn');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              GRN No.
              {sortField === 'Grn' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Date');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Date
              {sortField === 'Date' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Bill No.');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Bill No.
              {sortField === 'Bill No.' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Bill Date');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Bill Date
              {sortField === 'Bill Date' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Supplier');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Supplier
              {sortField === 'Supplier' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('RefNo');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Ref No.
              {sortField === 'RefNo' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Branch');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Branch
              {sortField === 'Branch' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
            </div>
            <div className="text-right flex items-center gap-2 cursor-pointer" onClick={() => {
              setSortField('Net');
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              Net Amount
              {sortField === 'Net' && (sortOrder === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
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
                    {sortGRNs(group.grns).map((grn) => {
                      const grnKey = `${grn.ID}-${grn.Branch}`;
                      const isExpanded = expandedGRNs.has(grnKey);
                      const details = loadedDetails.get(grnKey) || [];

                      return (
                        <div key={grnKey}>
                          {/* GRN Row */}
                          <div
                            className={`grid gap-3 px-4 py-2.5 cursor-pointer border-b ${
                              isDark
                                ? 'hover:bg-gray-700/50 border-gray-700 text-gray-300'
                                : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                            style={{ gridTemplateColumns: '140px 100px 120px 100px 250px 100px 80px 120px' }}
                            onClick={() => toggleGRN(grnKey, grn.ID, group.branchCode, grn.Date)}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="size-3.5 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="size-3.5 flex-shrink-0" />
                              )}
                              <span className="font-medium truncate" title={grn.Grn}>{grn.Grn}</span>
                            </div>
                            <div>{formatDate(grn.Date)}</div>
                            <div className="truncate" title={grn['Bill No.']}>{grn['Bill No.'] || '-'}</div>
                            <div>{formatDate(grn['Bill Date'])}</div>
                            <div className="truncate" title={grn.Supplier}>
                              {grn.Supplier || '-'}
                            </div>
                            <div className="truncate" title={grn.RefNo}>{grn.RefNo || '-'}</div>
                            <div>{grn.Branch}</div>
                            <div className="text-right font-semibold">
                              {formatCurrency(grn.Net)}
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
                                <div className="text-right">Amount</div>
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
                                  <div className="truncate" title={detail.RD_PC}>{detail.RD_PC}</div>
                                  <div className="truncate" title={detail.PM_MBCOD || '-'}>{detail.PM_MBCOD || '-'}</div>
                                  <div className="truncate" title={detail.PM_NM}>
                                    {detail.PM_NM}
                                  </div>
                                  <div className="text-right">{formatCurrency(detail.RD_PRT)}</div>
                                  <div className="text-right">{detail.RD_QTY}</div>
                                  <div className="text-right">{formatCurrency(detail.RD_DISAMT)}</div>
                                  <div className="text-right">{formatCurrency(detail.RD_TAXAMT)}</div>
                                  <div className="text-right font-semibold">
                                    {formatCurrency(detail.RD_AMT)}
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
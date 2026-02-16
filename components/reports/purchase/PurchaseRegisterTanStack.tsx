'use client';

/**
 * Purchase Register with TanStack Table
 * ✅ Full DataTable features: sorting, filtering, pinning, resizing
 * ✅ Hierarchical grouping: Branch → GRN → Details
 * ✅ Expandable rows
 */

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme } from '@/lib/store/theme-store';
import { usePurchaseRegister, usePurchaseRegisterDetail } from '@/lib/hooks/usePurchaseRegister';
import type { PurchaseRegisterRecord, PurchaseRegisterDetailItem } from '@/lib/types/purchase-register.types';
import { DataTable } from '@/components/ui/data-table';

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

// Extended record with grouping info
interface GroupedPurchaseRecord extends PurchaseRegisterRecord {
  _type: 'branch' | 'grn' | 'detail';
  _branchCode?: string;
  _branchName?: string;
  _branchTotal?: number;
  _isExpanded?: boolean;
  _detailData?: PurchaseRegisterDetailItem;
}

export default function PurchaseRegisterTanStack({ filters }: PurchaseRegisterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches and GRNs
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedGRNs, setExpandedGRNs] = useState<Set<string>>(new Set());
  const [loadedDetails, setLoadedDetails] = useState<Map<string, PurchaseRegisterDetailItem[]>>(new Map());

  // Use default values if no filters are provided from parent
  const defaultDates = getQuarterDates();
  const effectiveFilters = {
    branchCode: filters.branchCode || '000',
    fromDate: filters.fromDate || defaultDates.fromDate,
    toDate: filters.toDate || defaultDates.toDate,
  };

  const hasFilters = true;

  // Fetch purchase register master data
  const { data: purchaseRegisterData, isLoading } = usePurchaseRegister(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Toggle GRN expansion and load details
  const toggleGRN = async (grnKey: string, grn: PurchaseRegisterRecord) => {
    const newExpanded = new Set(expandedGRNs);
    
    if (newExpanded.has(grnKey)) {
      newExpanded.delete(grnKey);
    } else {
      newExpanded.add(grnKey);
      
      // Load details if not already loaded
      if (!loadedDetails.has(grnKey)) {
        try {
          const year = grn.Date ? new Date(grn.Date).getFullYear().toString() : new Date().getFullYear().toString();
          const branchCode = grn.Branch.replace(/[PVMAWS]/g, '');
          
          const { getPurchaseRegisterDetail } = await import('@/lib/api/purchase-register.api');
          const details = await getPurchaseRegisterDetail({ shid: grn.ID, brCode: branchCode, year });
          setLoadedDetails(prev => new Map(prev).set(grnKey, details));
        } catch (error) {
          console.error('Failed to load details:', error);
        }
      }
    }
    
    setExpandedGRNs(newExpanded);
  };

  // Flatten data with branch groups
  const flattenedData = useMemo<GroupedPurchaseRecord[]>(() => {
    if (!purchaseRegisterData) return [];

    // Group by branch
    const groups = new Map<string, { branch: string; grns: PurchaseRegisterRecord[]; total: number }>();
    
    purchaseRegisterData.forEach(record => {
      const branchCode = record.Branch.replace(/[PVMAWS]/g, '');
      
      if (!groups.has(branchCode)) {
        groups.set(branchCode, {
          branch: record.Branch,
          grns: [],
          total: 0,
        });
      }
      
      const group = groups.get(branchCode)!;
      group.grns.push(record);
      group.total += record.Net;
    });

    // Auto-expand all branches
    if (groups.size > 0 && expandedBranches.size === 0) {
      setExpandedBranches(new Set(Array.from(groups.keys())));
    }

    // Flatten into rows
    const rows: GroupedPurchaseRecord[] = [];
    
    Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([branchCode, group]) => {
        // Branch header row
        const branchRow: GroupedPurchaseRecord = {
          ...({} as PurchaseRegisterRecord),
          _type: 'branch',
          _branchCode: branchCode,
          _branchName: group.branch,
          _branchTotal: group.total,
          Branch: group.branch,
          Grn: `Branch: ${group.branch}`,
          Net: group.total,
          ID: -1,
          Date: '',
          'Bill No.': '',
          'Bill Date': '',
          Supplier: '',
          RefNo: '',
          'Prod Value': 0,
          Expense: 0,
          Dis: 0,
          Tax: 0,
          RoundOff: {},
          Remark: '',
          Party: '',
          SalesMan: '',
        };
        
        rows.push(branchRow);

        // Add GRNs if branch is expanded
        if (expandedBranches.has(branchCode)) {
          group.grns.forEach(grn => {
            const grnRow: GroupedPurchaseRecord = {
              ...grn,
              _type: 'grn',
              _branchCode: branchCode,
            };
            rows.push(grnRow);

            // Add details if GRN is expanded
            const grnKey = `${grn.ID}-${grn.Branch}`;
            if (expandedGRNs.has(grnKey)) {
              const details = loadedDetails.get(grnKey) || [];
              details.forEach((detail) => {
                const detailRow: GroupedPurchaseRecord = {
                  ...({} as PurchaseRegisterRecord),
                  _type: 'detail',
                  _branchCode: branchCode,
                  _detailData: detail,
                  Branch: grn.Branch,
                  Grn: detail.RD_PC,
                  'Bill No.': detail.PM_MBCOD || '-',
                  Supplier: detail.PM_NM,
                  Net: detail.RD_AMT,
                  ID: grn.ID,
                  Date: '',
                  'Bill Date': '',
                  RefNo: '',
                  'Prod Value': detail.RD_PRT,
                  Expense: 0,
                  Dis: detail.RD_DISAMT,
                  Tax: detail.RD_TAXAMT,
                  RoundOff: {},
                  Remark: '',
                  Party: '',
                  SalesMan: '',
                };
                rows.push(detailRow);
              });
            }
          });
        }
      });

    return rows;
  }, [purchaseRegisterData, expandedBranches, expandedGRNs, loadedDetails]);

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

  // Define columns
  const columns = useMemo<ColumnDef<GroupedPurchaseRecord>[]>(() => [
    {
      accessorKey: 'Grn',
      header: 'GRN No.',
      cell: ({ row }) => {
        const record = row.original;
        
        if (record._type === 'branch') {
          const isExpanded = expandedBranches.has(record._branchCode!);
          return (
            <div
              className={`flex items-center gap-2 font-semibold cursor-pointer ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}
              onClick={() => {
                const newExpanded = new Set(expandedBranches);
                if (isExpanded) {
                  newExpanded.delete(record._branchCode!);
                } else {
                  newExpanded.add(record._branchCode!);
                }
                setExpandedBranches(newExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              <span>Branch: {record._branchName}</span>
            </div>
          );
        }
        
        if (record._type === 'grn') {
          const grnKey = `${record.ID}-${record.Branch}`;
          const isExpanded = expandedGRNs.has(grnKey);
          return (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleGRN(grnKey, record)}
            >
              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              <span className="font-medium">{record.Grn}</span>
            </div>
          );
        }
        
        // Detail row
        return (
          <div className="pl-8 text-sm">
            {record._detailData?.RD_PC || '-'}
          </div>
        );
      },
      enablePinning: true,
    },
    {
      accessorKey: 'Date',
      header: 'Date',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') return null;
        return formatDate(row.original.Date);
      },
    },
    {
      accessorKey: 'Bill No.',
      header: 'Bill No.',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm">{row.original._detailData?.PM_MBCOD || '-'}</div>;
        }
        return row.original['Bill No.'] || '-';
      },
    },
    {
      accessorKey: 'Bill Date',
      header: 'Bill Date',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') return null;
        return formatDate(row.original['Bill Date']);
      },
    },
    {
      accessorKey: 'Supplier',
      header: 'Supplier',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm truncate" title={row.original._detailData?.PM_NM}>
            {row.original._detailData?.PM_NM || '-'}
          </div>;
        }
        return <div className="truncate" title={row.original.Supplier}>{row.original.Supplier || '-'}</div>;
      },
    },
    {
      accessorKey: 'RefNo',
      header: 'Ref No.',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') return null;
        return row.original.RefNo || '-';
      },
    },
    {
      accessorKey: 'Branch',
      header: 'Branch',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') return null;
        return row.original.Branch;
      },
    },
    {
      accessorKey: 'Net',
      header: 'Net Amount',
      cell: ({ row }) => {
        const record = row.original;
        
        if (record._type === 'branch') {
          return (
            <div className="text-right font-semibold">
              Total: {formatCurrency(record._branchTotal || 0)}
            </div>
          );
        }
        
        if (record._type === 'detail') {
          return (
            <div className="text-right font-medium text-sm">
              {formatCurrency(record._detailData?.RD_AMT || 0)}
            </div>
          );
        }
        
        return (
          <div className="text-right font-semibold">
            {formatCurrency(record.Net)}
          </div>
        );
      },
      enablePinning: true,
    },
  ], [expandedBranches, expandedGRNs, isDark, loadedDetails]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    if (!purchaseRegisterData) return 0;
    return purchaseRegisterData.reduce((sum, record) => sum + record.Net, 0);
  }, [purchaseRegisterData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Loading purchase register...
          </p>
        </div>
      </div>
    );
  }

  if (!purchaseRegisterData || purchaseRegisterData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            No purchase register data found for the selected filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TanStack DataTable with all features */}
      <DataTable
        data={flattenedData}
        columns={columns}
        isDark={isDark}
        height="700px"
        enablePagination={true}
        enableSorting={true}
        enableFiltering={true}
        enableColumnPinning={true}
        enableColumnReordering={true}
        enableColumnResizing={true}
        enableGlobalFilter={true}
        pageSize={50}
      />

      {/* Grand Total */}
      <div className={`px-4 py-4 font-bold text-lg border rounded-lg ${
        isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'
      }`}>
        <div className="flex justify-between items-center">
          <span>Grand Total:</span>
          <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Sales Register with TanStack Table
 * ✅ Full DataTable features: sorting, filtering, pinning, resizing
 * ✅ Hierarchical grouping: Branch → Bill → Details
 * ✅ Expandable rows
 */

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme } from '@/lib/store/theme-store';
import { useSalesRegister, useSalesRegisterDetail } from '@/lib/hooks/useSalesRegister';
import type { SalesRegisterRecord, SalesRegisterDetailRecord } from '@/lib/types/sales-register.types';
import { DataTable } from '@/components/ui/data-table';

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

// Extended record with grouping info
interface GroupedSalesRecord extends SalesRegisterRecord {
  _type: 'branch' | 'bill' | 'detail';
  _branchCode?: string;
  _branchName?: string;
  _branchTotal?: number;
  _isExpanded?: boolean;
  _detailData?: SalesRegisterDetailRecord;
}

export default function SalesRegisterTanStack({ filters }: SalesRegisterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for expanded branches and bills
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const [loadedDetails, setLoadedDetails] = useState<Map<string, SalesRegisterDetailRecord[]>>(new Map());

  // Use default values if no filters are provided from parent
  const defaultDates = getQuarterDates();
  const effectiveFilters = {
    branchCode: filters.branchCode || '000',
    fromDate: filters.fromDate || defaultDates.fromDate,
    toDate: filters.toDate || defaultDates.toDate,
  };

  const hasFilters = true;

  // Fetch sales register master data
  const { data: salesRegisterData, isLoading } = useSalesRegister(
    {
      fromDt: effectiveFilters.fromDate,
      toDt: effectiveFilters.toDate,
      brCode: effectiveFilters.branchCode,
    },
    hasFilters
  );

  // Toggle bill expansion and load details
  const toggleBill = async (billKey: string, bill: SalesRegisterRecord) => {
    const newExpanded = new Set(expandedBills);
    
    if (newExpanded.has(billKey)) {
      newExpanded.delete(billKey);
    } else {
      newExpanded.add(billKey);
      
      // Load details if not already loaded
      if (!loadedDetails.has(billKey)) {
        try {
          const year = bill.Date ? new Date(bill.Date).getFullYear().toString() : new Date().getFullYear().toString();
          const branchCode = bill.Branch.replace(/[PVMAWS]/g, '');
          
          const { getSalesRegisterDetail } = await import('@/lib/api/sales-register.api');
          const details = await getSalesRegisterDetail({ shid: bill.ID, brCode: branchCode, year });
          setLoadedDetails(prev => new Map(prev).set(billKey, details));
        } catch (error) {
          console.error('Failed to load details:', error);
        }
      }
    }
    
    setExpandedBills(newExpanded);
  };

  // Flatten data with branch groups
  const flattenedData = useMemo<GroupedSalesRecord[]>(() => {
    if (!salesRegisterData) return [];

    // Group by branch
    const groups = new Map<string, { branch: string; bills: SalesRegisterRecord[]; total: number }>();
    
    salesRegisterData.forEach(record => {
      const branchCode = record.Branch.replace(/[PVMAWS]/g, '');
      
      if (!groups.has(branchCode)) {
        groups.set(branchCode, {
          branch: record.Branch,
          bills: [],
          total: 0,
        });
      }
      
      const group = groups.get(branchCode)!;
      group.bills.push(record);
      group.total += record.Net;
    });

    // Auto-expand all branches
    if (groups.size > 0 && expandedBranches.size === 0) {
      setExpandedBranches(new Set(Array.from(groups.keys())));
    }

    // Flatten into rows
    const rows: GroupedSalesRecord[] = [];
    
    Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([branchCode, group]) => {
        // Branch header row
        const branchRow: GroupedSalesRecord = {
          ...({} as SalesRegisterRecord),
          _type: 'branch',
          _branchCode: branchCode,
          _branchName: group.branch,
          _branchTotal: group.total,
          Branch: group.branch,
          BillNo: `Branch: ${group.branch}`,
          Net: group.total,
          ID: -1,
          Date: '',
          Code: '',
          Party: '',
          SalesMan: '',
          RefNo: '',
          RefDate: '',
        };
        
        rows.push(branchRow);

        // Add bills if branch is expanded
        if (expandedBranches.has(branchCode)) {
          group.bills.forEach(bill => {
            const billRow: GroupedSalesRecord = {
              ...bill,
              _type: 'bill',
              _branchCode: branchCode,
            };
            rows.push(billRow);

            // Add details if bill is expanded
            const billKey = `${bill.ID}-${bill.Branch}`;
            if (expandedBills.has(billKey)) {
              const details = loadedDetails.get(billKey) || [];
              details.forEach((detail) => {
                const detailRow: GroupedSalesRecord = {
                  ...({} as SalesRegisterRecord),
                  _type: 'detail',
                  _branchCode: branchCode,
                  _detailData: detail,
                  Branch: bill.Branch,
                  BillNo: detail.Product,
                  Code: detail.Code,
                  Party: detail.Barcode || '-',
                  Net: detail.Net,
                  ID: bill.ID,
                  Date: '',
                  SalesMan: '',
                  RefNo: '',
                  RefDate: '',
                };
                rows.push(detailRow);
              });
            }
          });
        }
      });

    return rows;
  }, [salesRegisterData, expandedBranches, expandedBills, loadedDetails]);

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
  const columns = useMemo<ColumnDef<GroupedSalesRecord>[]>(() => [
    {
      accessorKey: 'BillNo',
      header: 'Bill No.',
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
        
        if (record._type === 'bill') {
          const billKey = `${record.ID}-${record.Branch}`;
          const isExpanded = expandedBills.has(billKey);
          return (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleBill(billKey, record)}
            >
              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              <span className="font-medium">{record.BillNo}</span>
            </div>
          );
        }
        
        // Detail row
        return (
          <div className="pl-8 text-sm">
            {record._detailData?.Product || '-'}
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
      accessorKey: 'Code',
      header: 'Code',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm">{row.original._detailData?.Code || '-'}</div>;
        }
        return row.original.Code;
      },
    },
    {
      accessorKey: 'Party',
      header: 'Party',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm">{row.original._detailData?.Barcode || '-'}</div>;
        }
        return row.original.Party || '-';
      },
    },
    {
      accessorKey: 'SalesMan',
      header: 'Salesman',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm text-right">{row.original._detailData?.Qty || '-'}</div>;
        }
        return row.original.SalesMan || '-';
      },
    },
    {
      accessorKey: 'RefNo',
      header: 'Ref No.',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm text-right">{formatCurrency(row.original._detailData?.Rate || 0)}</div>;
        }
        return row.original.RefNo || '-';
      },
    },
    {
      accessorKey: 'RefDate',
      header: 'Ref Date',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm text-right">{row.original._detailData?.Discount || '-'}</div>;
        }
        return formatDate(row.original.RefDate);
      },
    },
    {
      accessorKey: 'Branch',
      header: 'Branch',
      cell: ({ row }) => {
        if (row.original._type === 'branch') return null;
        if (row.original._type === 'detail') {
          return <div className="pl-8 text-sm text-right">{formatCurrency(row.original._detailData?.Tax || 0)}</div>;
        }
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
            <div className="text-right font-bold">
              {formatCurrency(record._branchTotal || 0)}
            </div>
          );
        }
        if (record._type === 'detail') {
          return (
            <div className="pl-8 text-sm text-right font-semibold">
              {formatCurrency(record._detailData?.Net || 0)}
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
  ], [isDark, expandedBranches, expandedBills]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return flattenedData
      .filter(row => row._type === 'branch')
      .reduce((sum, row) => sum + (row._branchTotal || 0), 0);
  }, [flattenedData]);

  // Custom row styling based on type
  const getRowClassName = (row: GroupedSalesRecord) => {
    if (row._type === 'branch') {
      return isDark 
        ? 'bg-blue-900/30 hover:bg-blue-900/40' 
        : 'bg-blue-50 hover:bg-blue-100';
    }
    if (row._type === 'detail') {
      return isDark 
        ? 'bg-gray-900/50 hover:bg-gray-900/70' 
        : 'bg-gray-50/50 hover:bg-gray-100/50';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading sales register...
            </p>
          </div>
        </div>
      ) : (
        <>
          <DataTable
            data={flattenedData}
            columns={columns}
            isDark={isDark}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
            enableColumnPinning={true}
            enableColumnReordering={true}
            enableColumnResizing={true}
            enableGlobalFilter={true}
            pageSize={20}
          />
          
          {/* Grand Total */}
          <div className={`px-4 py-4 rounded-lg border font-bold text-lg ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center">
              <span>Grand Total:</span>
              <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

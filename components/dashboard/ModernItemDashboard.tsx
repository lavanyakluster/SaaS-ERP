/**
 * Modern Item Dashboard Component
 * 
 * ✅ Enterprise Features:
 * - Real pharmacy API integration
 * - Apache ECharts for item visualizations
 * - TanStack Table for item analysis and expiry tables
 * - ABC Classification with custom SVG donut
 * - Professional KPI cards
 * - Multi-tenant architecture
 */

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Package, TrendingUp, ShoppingCart, AlertTriangle, Download, X, Maximize2, ChevronDown } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { usePharmacyItemDashboard } from '@/lib/hooks/usePharmacyItemDashboard';
import type { Branch } from '@/lib/api/branch.api';

interface ModernItemDashboardProps {
  isDark: boolean;
  onFullscreen?: (id: string, data: any) => void;
  dateRange?: string;
  selectedBranch?: string;
  branches?: Branch[];
  customFromDate?: string;
  customToDate?: string;
}

export function ModernItemDashboard({ 
  isDark, 
  onFullscreen,
  dateRange = 'This Quarter',
  selectedBranch = 'All Branches',
  branches = [],
  customFromDate,
  customToDate,
}: ModernItemDashboardProps) {
  const [chartView, setChartView] = useState<'revenue' | 'quantity'>('quantity');
  const [topItemsCount, setTopItemsCount] = useState(10);
  const [tableTab, setTableTab] = useState<'item-analysis' | 'short-expiry'>('item-analysis');
  const [brandSupplierTab, setBrandSupplierTab] = useState<'brand' | 'supplier'>('brand');
  const [brandChartType, setBrandChartType] = useState<'bar' | 'line' | 'area' | 'spline'>('bar');
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);
  const [selectedABCClass, setSelectedABCClass] = useState<'A' | 'B' | 'C' | null>(null);
  const [showABCModal, setShowABCModal] = useState(false);
  const [showTopItemsModal, setShowTopItemsModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChartTypeDropdown(false);
      }
    };

    if (showChartTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChartTypeDropdown]);

  // ✅ Open fullscreen modal when "View" is clicked
  const handleOpenTopItemsModal = () => {
    setShowTopItemsModal(true);
  };

  const handleCloseTopItemsModal = () => {
    setShowTopItemsModal(false);
  };

  // ✅ Helper function to format dates
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ Calculate date range based on dateRange prop
  const { fromDt, toDt } = useMemo(() => {
    const today = new Date();
    
    // If custom dates are provided, use them
    if (customFromDate && customToDate) {
      return {
        fromDt: customFromDate,
        toDt: customToDate,
      };
    }

    // Calculate based on dateRange string
    let fromDate = new Date(today);
    
    switch (dateRange) {
      case 'Today':
        break;
      case 'This Week':
        fromDate.setDate(today.getDate() - 7);
        break;
      case 'This Month':
        fromDate.setMonth(today.getMonth() - 1);
        break;
      case 'This Quarter':
        fromDate.setMonth(today.getMonth() - 3);
        break;
      case 'Year 2025':
      default:
        fromDate = new Date('2025-01-01');
        break;
    }

    return {
      fromDt: formatDate(fromDate),
      toDt: formatDate(today),
    };
  }, [dateRange, customFromDate, customToDate]);

  // ✅ Get branch code from selected branch
  const branchCode = useMemo(() => {
    if (selectedBranch === 'All Branches' || !selectedBranch) {
      if (branches && branches.length > 0) {
        const firstBranch = branches[0];
        return firstBranch.bR_COD || '016';
      }
      return '016';
    }
    
    const branch = branches.find((b) => b.bR_NM === selectedBranch);
    return branch?.bR_COD || '016';
  }, [selectedBranch, branches]);

  // ✅ Fetch pharmacy item dashboard data from API
  const { data: pharmacyData, isLoading, error } = usePharmacyItemDashboard({
    fromDt,
    toDt,
    brCode: branchCode,
  });

  const pharmacyItems = pharmacyData?.items || [];
  const expiryItems = pharmacyData?.expiryItems || [];

  // ✅ Calculate KPI metrics from API data
  const kpiMetrics = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) {
      return {
        totalRevenue: 0,
        totalSoldItems: 0,
        unitsSold: 0,
        expiredItems: 0,
      };
    }

    const totalRevenue = pharmacyItems.reduce((sum, item) => sum + (item.totalRevenue ?? 0), 0);
    const totalSoldItems = pharmacyItems.length;
    const unitsSold = pharmacyItems.reduce((sum, item) => sum + (item.totalSold ?? 0), 0);
    const expiredItems = expiryItems.filter(item => item.expiryStatus === 'Expired').length;

    return {
      totalRevenue,
      totalSoldItems,
      unitsSold,
      expiredItems,
    };
  }, [pharmacyItems, expiryItems]);

  // ✅ KPI Cards Data
  const kpiCards = [
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: kpiMetrics.totalRevenue.toFixed(2),
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      id: 'total-sold-items',
      label: 'Sold Items',
      value: kpiMetrics.totalSoldItems.toFixed(0),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      id: 'units-sold',
      label: 'Units Sold',
      value: kpiMetrics.unitsSold.toFixed(0),
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      id: 'expired-items',
      label: 'Expired',
      value: kpiMetrics.expiredItems.toFixed(0),
      icon: AlertTriangle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
  ];

  // ✅ ABC Classification Data from API
  const abcClassificationData = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    const aItems = pharmacyItems.filter(item => item.aBCClass === 'A').length;
    const bItems = pharmacyItems.filter(item => item.aBCClass === 'B').length;
    const cItems = pharmacyItems.filter(item => item.aBCClass === 'C').length;

    const total = aItems + bItems + cItems;

    return [
      { name: 'A', value: aItems, percentage: total > 0 ? ((aItems / total) * 100).toFixed(0) : '0', color: '#8b5cf6' },
      { name: 'B', value: bItems, percentage: total > 0 ? ((bItems / total) * 100).toFixed(0) : '0', color: '#06b6d4' },
      { name: 'C', value: cItems, percentage: total > 0 ? ((cItems / total) * 100).toFixed(0) : '0', color: '#10b981' },
    ];
  }, [pharmacyItems]);

  // ✅ Top Items by Revenue
  const topItemsByRevenue = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    return [...pharmacyItems]
      .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
      .slice(0, topItemsCount)
      .map(item => ({
        name: item.itemName?.substring(0, 20) || 'N/A',
        value: item.totalRevenue ?? 0,
      }));
  }, [pharmacyItems, topItemsCount]);

  // ✅ Top Items by Quantity
  const topItemsByQuantity = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    return [...pharmacyItems]
      .sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0))
      .slice(0, topItemsCount)
      .map(item => ({
        name: item.itemName?.substring(0, 20) || 'N/A',
        value: item.totalSold ?? 0,
      }));
  }, [pharmacyItems, topItemsCount]);

  // ✅ Brand Wise Revenue Data
  const brandRevenueData = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    const brandMap = new Map<string, number>();
    pharmacyItems.forEach(item => {
      const brand = item.brand?.trim() || 'Unknown';
      const current = brandMap.get(brand) || 0;
      brandMap.set(brand, current + item.totalRevenue);
    });

    return Array.from(brandMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [pharmacyItems]);

  // ✅ Supplier Wise Revenue Data
  const supplierRevenueData = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    const supplierMap = new Map<string, number>();
    pharmacyItems.forEach(item => {
      const supplier = item.supplier?.trim() || 'Unknown';
      const current = supplierMap.get(supplier) || 0;
      supplierMap.set(supplier, current + item.totalRevenue);
    });

    return Array.from(supplierMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [pharmacyItems]);

  // ✅ ECharts colors
  const chartColors = {
    textColor: isDark ? '#9ca3af' : '#6b7280',
    gridColor: isDark ? '#374151' : '#e5e7eb',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
  };

  // ✅ Top Items Chart (ECharts Horizontal Bar)
  const chartData = chartView === 'revenue' ? topItemsByRevenue : topItemsByQuantity;
  const topItemsOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
    },
    grid: {
      left: '25%',
      right: '10%',
      bottom: '6%',
      top: '3%',
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: chartData.map(d => d.name),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
      },
    },
    series: [{
      type: 'bar',
      data: chartData.map(d => d.value),
      itemStyle: {
        color: chartView === 'revenue' 
          ? {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#34d399' },
              ],
            }
          : {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#60a5fa' },
              ],
            },
        borderRadius: [0, 4, 4, 0],
      },
      barWidth: '70%',
    }],
  };

  // ✅ Brand/Supplier Chart (ECharts Vertical Bar)
  const brandSupplierData = brandSupplierTab === 'brand' ? brandRevenueData : supplierRevenueData;
  const brandSupplierOption: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: chartColors.backgroundColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      textStyle: {
        color: chartColors.textColor,
      },
    },
    grid: {
      left: '50px',
      right: '4%',
      bottom: '25%',
      top: '10%',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: brandSupplierData.map(d => d.name.substring(0, 12)),
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 9,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: chartColors.gridColor,
        },
      },
      axisLabel: {
        color: chartColors.textColor,
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: chartColors.gridColor,
          type: 'dashed',
        },
      },
    },
    series: [{
      type: brandChartType === 'bar' ? 'bar' : 'line',
      data: brandSupplierData.map(d => d.value),
      smooth: brandChartType === 'spline',
      areaStyle: (brandChartType === 'area' || brandChartType === 'spline') ? {
        color: brandSupplierTab === 'brand'
          ? {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(236, 72, 153, 0.5)' },
                { offset: 1, color: 'rgba(236, 72, 153, 0.1)' },
              ],
            }
          : {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' },
              ],
            },
      } : undefined,
      lineStyle: (brandChartType === 'line' || brandChartType === 'spline' || brandChartType === 'area') ? {
        width: 2,
        color: brandSupplierTab === 'brand' ? '#ec4899' : '#3b82f6',
      } : undefined,
      itemStyle: {
        color: brandSupplierTab === 'brand'
          ? (brandChartType === 'bar' ? {
              type: 'linear',
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ec4899' },
                { offset: 1, color: '#f472b6' },
              ],
            } : '#ec4899')
          : (brandChartType === 'bar' ? {
              type: 'linear',
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#60a5fa' },
              ],
            } : '#3b82f6'),
        borderRadius: brandChartType === 'bar' ? [4, 4, 0, 0] : undefined,
      },
      barWidth: brandChartType === 'bar' ? 28 : undefined,
      barMaxWidth: brandChartType === 'bar' ? 35 : undefined,
    }],
  };

  // ��� TanStack Table Columns - Item Analysis
  const itemAnalysisColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      cell: ({ getValue }) => (
        <div className="font-medium text-xs">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'itemCategory',
      header: 'Category',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'currentStock',
      header: 'Current Stock',
      cell: ({ getValue }) => (
        <div className="text-right text-xs">{(getValue() as number)?.toFixed(0) ?? '0'}</div>
      ),
    },
    {
      accessorKey: 'daysOfSupply',
      header: 'Days of Supply',
      cell: ({ getValue }) => (
        <div className="text-right text-xs">{(getValue() as number)?.toFixed(0) ?? '0'}</div>
      ),
    },
    {
      accessorKey: 'reorderStatus',
      header: 'Reorder Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const colors = {
          'Low Stock': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
          'Normal': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
          'Overstock': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        };
        const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
              {status || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'nearestExpiryDate',
      header: 'Expiry Date',
      cell: ({ getValue }) => {
        const date = getValue() as string;
        if (!date || date === 'N/A') return <div className="text-xs">N/A</div>;
        // Extract only the date part (YYYY-MM-DD)
        try {
          const datePart = date.split('T')[0];
          return <div className="text-xs">{datePart}</div>;
        } catch {
          return <div className="text-xs">{date}</div>;
        }
      },
    },
    {
      accessorKey: 'expiryRisk',
      header: 'Expiry Risk',
      cell: ({ getValue }) => {
        const risk = getValue() as string;
        const colors = {
          'High': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
          'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
          'Low': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        };
        const color = colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
              {risk || 'N/A'}
            </span>
          </div>
        );
      },
    },
  ];

  // ✅ TanStack Table Columns - Expiry Items
  const expiryColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      cell: ({ getValue }) => (
        <div className="font-medium text-xs">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'itemCategory',
      header: 'Category',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'brand',
      header: 'Company',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry MMYY',
      cell: ({ getValue }) => {
        const date = getValue() as string;
        if (!date || date === 'N/A') return <div className="text-xs">N/A</div>;
        // Convert to MMYY format
        try {
          const dateObj = new Date(date);
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const yy = String(dateObj.getFullYear()).slice(-2);
          return <div className="text-xs">{mm}{yy}</div>;
        } catch {
          return <div className="text-xs">{date}</div>;
        }
      },
    },
    {
      accessorKey: 'expiryStatus',
      header: 'Expiry Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const colors = {
          'Expired': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
          'Expiring Soon': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
          'Normal': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        };
        const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
              {status || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock',
      cell: ({ getValue }) => (
        <div className="text-right text-xs">{(getValue() as number)?.toFixed(0) ?? '0'}</div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
  ];

  // ✅ TanStack Table Columns - ABC Classification
  const abcClassificationColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      cell: ({ getValue }) => (
        <div className="font-medium text-xs">{getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'itemCategory',
      header: 'Category',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'totalSold',
      header: 'Total Sold',
      cell: ({ getValue }) => (
        <div className="text-right text-xs font-medium">{(getValue() as number)?.toFixed(0) ?? '0'}</div>
      ),
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Total Revenue',
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return (
          <div className="text-right text-xs font-medium">
            {value?.toFixed(2) ?? '0.00'} <span className="text-[10px] text-gray-500">SAR</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'aBCClass',
      header: 'ABC Class',
      cell: ({ getValue }) => {
        const abcClass = getValue() as string;
        const colors = {
          'A': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
          'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
          'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        };
        const color = colors[abcClass as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        return (
          <div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
              Class {abcClass || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ getValue }) => <div className="text-xs">{getValue() as string || 'N/A'}</div>,
    },
  ];

  // ✅ Export to CSV function
  const handleExportToExcel = () => {
    if (tableTab === 'item-analysis' && pharmacyItems.length === 0) {
      alert('No data to export');
      return;
    }

    if (tableTab === 'short-expiry' && expiryItems.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = '';

    if (tableTab === 'item-analysis') {
      csvContent = 'Item Name,Category,Supplier,Brand,Current Stock,Days of Supply,Reorder Status,Nearest Expiry,Expiry Risk,Total Sold,Total Revenue,ABC Class\n';
      pharmacyItems.forEach((item) => {
        csvContent += `"${item.itemName}","${item.itemCategory || 'N/A'}","${item.supplier || 'N/A'}","${item.brand}",${item.currentStock},${item.daysOfSupply},"${item.reorderStatus}","${item.nearestExpiryDate || 'N/A'}","${item.expiryRisk}",${item.totalSold},${item.totalRevenue},"${item.aBCClass}"\n`;
      });
    } else {
      csvContent = 'Item Name,Brand,Batch No,Expiry Date,Days to Expiry,Quantity,Status\n';
      expiryItems.forEach((item) => {
        csvContent += `"${item.itemName || 'N/A'}","${item.company || 'N/A'}","${item.sT_COD || 'N/A'}","${item.expiryMMYY || 'N/A'}",,${item.stockInUnits ?? 0},"${item.expiryStatus || 'N/A'}"\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // ✅ Filtered items by ABC classification
  const filteredABCItems = useMemo(() => {
    if (!selectedABCClass) return [];
    return pharmacyItems.filter(item => item.aBCClass === selectedABCClass);
  }, [pharmacyItems, selectedABCClass]);

  const handleABCClassClick = (classification: 'A' | 'B' | 'C') => {
    setSelectedABCClass(classification);
    setShowABCModal(true);
  };

  const handleCloseABCModal = () => {
    setShowABCModal(false);
    setSelectedABCClass(null);
  };

  // ✅ Export ABC Class Data to CSV
  const handleExportABCClass = () => {
    if (!selectedABCClass) return;
    
    const abcFilteredItems = pharmacyItems.filter(item => item.aBCClass === selectedABCClass);
    
    if (abcFilteredItems.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = 'Item Name,Category,Total Sold,Total Revenue,ABC Class\n';
    abcFilteredItems.forEach(item => {
      csvContent += `"${item.itemName}","${item.itemCategory || 'N/A'}",${item.totalSold},${item.totalRevenue},"${item.aBCClass}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abc-class-${selectedABCClass}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 animate-pulse ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`h-10 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
        <div className={`rounded-lg border p-6 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <p className={`ml-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading pharmacy data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className={`rounded-lg border p-6 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Failed to load data</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error.message}</p>
      </div>
    );
  }

  // ✅ Empty State
  if (!pharmacyItems || pharmacyItems.length === 0) {
    return (
      <div className={`rounded-lg border p-6 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No items found</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          
          return (
            <div
              key={kpi.id}
              className={`group relative overflow-hidden rounded-lg p-4 text-white ${kpi.bgColor} cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              style={{ animation: `slideInScale 0.5s ease-out ${index * 0.1}s both` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {onFullscreen && (
                    <button 
                      onClick={() => onFullscreen(kpi.id, { value: kpi.value, label: kpi.label })}
                      className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-0.5 group-hover:scale-105 transition-transform duration-300 origin-left">
                  {kpi.value}
                </h3>
                <p className="text-xs text-white/80 uppercase tracking-wide font-medium">
                  {kpi.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ABC Classification (Custom SVG Donut - Keep as is) */}
        <div className={`rounded-lg border p-4 transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ABC Classification
            </h3>
            {onFullscreen && (
              <button
                onClick={() => onFullscreen('abc-classification', { abcData: abcClassificationData })}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
                title="Expand widget"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              <circle cx="100" cy="100" r="85" fill="none" stroke={isDark ? '#374151' : '#f3f4f6'} strokeWidth="18" opacity="0.2" />
              
              {(() => {
                let currentAngle = 0;
                const radius = 85;
                const strokeWidth = 18;
                const total = abcClassificationData.reduce((sum, item) => sum + item.value, 0);
                
                return abcClassificationData.map((item, index) => {
                  const percentage = total > 0 ? (item.value / total) : 0;
                  const angle = percentage * 360;
                  const circumference = 2 * Math.PI * radius;
                  const dashArray = (angle / 360) * circumference;
                  const dashOffset = -((currentAngle / 360) * circumference);
                  
                  currentAngle += angle;
                  
                  return (
                    <circle
                      key={index}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${dashArray} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-500 cursor-pointer hover:opacity-80 hover:stroke-[20]"
                      onClick={() => handleABCClassClick(item.name as 'A' | 'B' | 'C')}
                      style={{ 
                        pointerEvents: 'stroke',
                        animation: `drawCircle 1s ease-out ${index * 0.2}s both`
                      }}
                    />
                  );
                });
              })()}
            </svg>
          </div>

          <div className="space-y-2">
            {abcClassificationData.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between cursor-pointer p-2 rounded transition-all duration-200 hover:scale-102 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => handleABCClassClick(item.name as 'A' | 'B' | 'C')}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full transition-transform duration-200 hover:scale-125" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Class {item.name}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue/Quantity Chart (ECharts Horizontal Bar) */}
        <div className={`lg:col-span-2 rounded-lg border p-4 transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChartView('revenue')}
                className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                  chartView === 'revenue'
                    ? 'border-green-500 text-green-500'
                    : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartView('quantity')}
                className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                  chartView === 'quantity'
                    ? 'border-blue-500 text-blue-500'
                    : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Quantity
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Top</span>
              <select
                value={topItemsCount}
                onChange={(e) => setTopItemsCount(Number(e.target.value))}
                className={`px-2 py-1 rounded border text-xs transition-all duration-200 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <ReactECharts
            option={topItemsOption}
            style={{ height: '300px' }}
            theme={isDark ? 'dark' : undefined}
          />
        </div>
      </div>

      {/* Brand/Supplier Chart (ECharts Vertical Bar) */}
      <div className={`rounded-lg border p-4 transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBrandSupplierTab('brand')}
              className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                brandSupplierTab === 'brand'
                  ? 'border-pink-500 text-pink-500'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Brand
            </button>
            <button
              onClick={() => setBrandSupplierTab('supplier')}
              className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                brandSupplierTab === 'supplier'
                  ? 'border-blue-500 text-blue-500'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Supplier
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowChartTypeDropdown(!showChartTypeDropdown)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border transition-all duration-200 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {brandChartType === 'line' && 'Line Graph'}
              {brandChartType === 'bar' && 'Bar Graph'}
              {brandChartType === 'area' && 'Area Graph'}
              {brandChartType === 'spline' && 'Spline Graph'}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                showChartTypeDropdown ? 'rotate-180' : ''
              }`} />
            </button>
            {showChartTypeDropdown && (
              <div className={`absolute right-0 mt-2 w-40 rounded-lg border shadow-lg z-50 py-1 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setBrandChartType('line');
                    setShowChartTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    brandChartType === 'line'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Line Graph
                </button>
                <button
                  onClick={() => {
                    setBrandChartType('bar');
                    setShowChartTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    brandChartType === 'bar'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Bar Graph
                </button>
                <button
                  onClick={() => {
                    setBrandChartType('area');
                    setShowChartTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    brandChartType === 'area'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Area Graph
                </button>
                <button
                  onClick={() => {
                    setBrandChartType('spline');
                    setShowChartTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    brandChartType === 'spline'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-700'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Spline Graph
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className={`text-center text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {brandSupplierTab === 'brand' ? 'Brand' : 'Supplier'} Revenue
        </h3>

        {/* Scrollable Chart Container */}
        <div 
          className={`overflow-x-auto overflow-y-hidden ${isDark ? 'scrollbar-dark' : 'scrollbar-light'}`}
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#4b5563 transparent' : '#9ca3af transparent'
          }}
        >
          <div style={{ minWidth: `${Math.max(800, brandSupplierData.length * 45)}px` }}>
            <ReactECharts
              option={brandSupplierOption}
              style={{ height: '250px', width: '100%' }}
              theme={isDark ? 'dark' : undefined}
            />
          </div>
        </div>
      </div>

      {/* Data Tables (AG Grid) */}
      <div id="item-data-table" className={`rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTableTab('item-analysis')}
              className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                tableTab === 'item-analysis'
                  ? 'border-blue-500 text-blue-500'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Item Analysis
            </button>
            <button
              onClick={() => setTableTab('short-expiry')}
              className={`pb-1 px-1 text-xs font-medium border-b-2 transition-all duration-200 hover:scale-105 ${
                tableTab === 'short-expiry'
                  ? 'border-blue-500 text-blue-500'
                  : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Short Expiry
            </button>
          </div>

          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>

        <div className="p-4">
          <DataTable
            columns={tableTab === 'item-analysis' ? itemAnalysisColumns : expiryColumns}
            data={tableTab === 'item-analysis' ? pharmacyItems : expiryItems}
            isDark={isDark}
            height="500px"
            enablePagination={true}
            enableSorting={true}
            pageSize={10}
          />
        </div>
      </div>

      {/* ABC Classification Modal */}
      {showABCModal && selectedABCClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-7xl w-full rounded-xl shadow-2xl max-h-[95vh] overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ABC Class {selectedABCClass} Items
                </h3>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {filteredABCItems.length} items in this classification
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportABCClass}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleCloseABCModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <DataTable
                columns={abcClassificationColumns}
                data={filteredABCItems}
                isDark={isDark}
                height="calc(95vh - 180px)"
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                enableColumnPinning={true}
                enableColumnReordering={true}
                enableColumnResizing={true}
                enableGlobalFilter={true}
                pageSize={20}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Items Modal */}
      {showTopItemsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-7xl w-full rounded-xl shadow-2xl max-h-[95vh] overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Top {topItemsCount} {chartView === 'revenue' ? 'Revenue' : 'Quantity'} Items
                </h3>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {chartData.length} items in this list
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseTopItemsModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <DataTable
                columns={itemAnalysisColumns}
                data={chartData.map(item => ({
                  itemName: item.name,
                  totalRevenue: chartView === 'revenue' ? item.value : 0,
                  totalSold: chartView === 'quantity' ? item.value : 0,
                }))}
                isDark={isDark}
                height="calc(95vh - 180px)"
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                enableColumnPinning={true}
                enableColumnReordering={true}
                enableColumnResizing={true}
                enableGlobalFilter={true}
                pageSize={20}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 535;
          }
        }
      `}</style>
    </div>
  );
}

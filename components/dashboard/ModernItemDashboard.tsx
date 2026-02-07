'use client';

import { useState, useMemo } from 'react';
import { Package, TrendingUp, ShoppingCart, AlertTriangle, Download, ChevronDown, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { usePharmacyItemDashboard } from '@/lib/hooks/usePharmacyItemDashboard';

interface Branch {
  branchCode?: string;
  branchName?: string;
  bR_COD?: string;
  bR_NM?: string;
}

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expiryPerPage, setExpiryPerPage] = useState(10);
  const [expiryCurrentPage, setExpiryCurrentPage] = useState(1);
  const [brandSupplierTab, setBrandSupplierTab] = useState<'brand' | 'supplier'>('brand');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'spline'>('bar');
  const [selectedABCClass, setSelectedABCClass] = useState<'A' | 'B' | 'C' | null>(null);
  const [showABCModal, setShowABCModal] = useState(false);

  // ✅ Scroll to table section when "View" is clicked
  const handleScrollToTable = () => {
    const tableElement = document.getElementById('item-data-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        // No change to fromDate
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
      // ✅ For "All Branches", use the first branch code or default
      if (branches && branches.length > 0) {
        const firstBranch = branches[0];
        return firstBranch.branchCode || firstBranch.bR_COD || '016'; // Default to '016' if not found
      }
      return '016'; // Fallback default branch code
    }
    
    const branch = branches.find(b => b.branchName === selectedBranch || b.bR_NM === selectedBranch);
    return branch?.branchCode || branch?.bR_COD || '016'; // Fallback to '016'
  }, [selectedBranch, branches]);

  // ✅ Fetch pharmacy item dashboard data from API with dynamic params
  const { data: pharmacyData, isLoading, error } = usePharmacyItemDashboard({
    fromDt,
    toDt,
    brCode: branchCode, // ✅ DYNAMIC: Now uses selected branch or first branch for "All Branches"
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

  // ✅ KPI Cards Data - Using Real API Data
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

  // ✅ Top Items by Revenue (Green bars)
  const topItemsByRevenue = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    return [...pharmacyItems]
      .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
      .slice(0, topItemsCount)
      .map(item => ({
        name: item.itemName?.substring(0, 20) || 'N/A',
        value: item.totalRevenue ?? 0,
        displayValue: (item.totalRevenue ?? 0).toFixed(1),
      }));
  }, [pharmacyItems, topItemsCount]);

  // ✅ Top Items by Quantity (Blue bars)
  const topItemsByQuantity = useMemo(() => {
    if (!pharmacyItems || pharmacyItems.length === 0) return [];

    return [...pharmacyItems]
      .sort((a, b) => (b.totalSold ?? 0) - (a.totalSold ?? 0))
      .slice(0, topItemsCount)
      .map(item => ({
        name: item.itemName?.substring(0, 20) || 'N/A',
        value: item.totalSold ?? 0,
        displayValue: (item.totalSold ?? 0).toFixed(1),
      }));
  }, [pharmacyItems, topItemsCount]);

  const chartData = chartView === 'revenue' ? topItemsByRevenue : topItemsByQuantity;
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // ✅ Pagination for Item Analysis Table
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return pharmacyItems.slice(startIndex, endIndex);
  }, [pharmacyItems, currentPage, itemsPerPage]);

  const totalItemPages = Math.ceil(pharmacyItems.length / itemsPerPage);

  // ✅ Pagination for Short Expiry List Table
  const paginatedExpiryItems = useMemo(() => {
    const startIndex = (expiryCurrentPage - 1) * expiryPerPage;
    const endIndex = startIndex + expiryPerPage;
    return expiryItems.slice(startIndex, endIndex);
  }, [expiryItems, expiryCurrentPage, expiryPerPage]);

  const totalExpiryPages = Math.ceil(expiryItems.length / expiryPerPage);

  // ✅ Export to CSV function
  const handleExportToExcel = () => {
    const isItemAnalysis = tableTab === 'item-analysis';
    const dataToExport = isItemAnalysis ? pharmacyItems : expiryItems;
    
    if (!dataToExport || dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    let csvContent = '';
    
    if (isItemAnalysis) {
      // Header row for item analysis
      csvContent = 'Item Name,Category,Supplier,Brand,Current Stock,Days of Supply,Reorder Status,Nearest Expiry,Expiry Risk,Total Sold,Total Revenue,ABC Class\n';
      
      // Data rows
      pharmacyItems.forEach(item => {
        csvContent += `"${item.itemName}","${item.itemCategory || 'N/A'}","${item.supplier || 'N/A'}","${item.brand}",${item.currentStock},${item.daysOfSupply},"${item.reorderStatus}","${item.nearestExpiryDate || 'N/A'}","${item.expiryRisk}",${item.totalSold},${item.totalRevenue},"${item.aBCClass}"\n`;
      });
    } else {
      // Header row for expiry items
      csvContent = 'Item Name,Category,Company,Expiry,Status,Stock,Supplier\n';
      
      // Data rows
      expiryItems.forEach(item => {
        csvContent += `"${item.itemName || item.sT_COD}","${item.cT_NM || 'N/A'}","${item.company || 'N/A'}","${item.expiryMMYY}","${item.expiryStatus}",${item.stockInUnits || 0},"${item.supplier || 'N/A'}"\n`;
      });
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Exported to CSV successfully');
  };

  // ✅ Brand Wise Revenue Data from API
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

  // ✅ Supplier Wise Revenue Data from API
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

  const brandSupplierData = brandSupplierTab === 'brand' ? brandRevenueData : supplierRevenueData;
  const maxRevenueValue = Math.max(...brandSupplierData.map(d => d.value), 1);

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

    // Create CSV content
    let csvContent = 'Item Name,Category,Total Sold,Total Revenue,ABC Class\n';
    
    // Data rows
    abcFilteredItems.forEach(item => {
      csvContent += `"${item.itemName}","${item.itemCategory || 'N/A'}",${item.totalSold},${item.totalRevenue},"${item.aBCClass}"\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abc-class-${selectedABCClass}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Exported ABC Class data to CSV successfully');
  };

  const getABCColor = (classification: string) => {
    switch (classification) {
      case 'A': return '#8b5cf6';
      case 'B': return '#06b6d4';
      case 'C': return '#10b981';
      default: return '#6b7280';
    }
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
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative Circles with Animation */}
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
        })}</div>

      {/* Main Content Grid - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ABC Classification - Compact */}
        <div className={`rounded-lg border p-4 transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ABC Classification
          </h3>

          {/* Compact Donut Chart */}
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

          {/* Compact Legend */}
          <div className="space-y-2">
            {abcClassificationData.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between cursor-pointer p-2 rounded transition-all duration-200 hover:scale-102 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => handleABCClassClick(item.name as 'A' | 'B' | 'C')}
                style={{ animation: `slideInLeft 0.4s ease-out ${index * 0.1}s both` }}
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

        {/* Revenue/Quantity Chart - Compact */}
        <div className={`lg:col-span-2 rounded-lg border p-4 transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Compact Header with Tabs */}
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
                className={`px-2 py-1 rounded border text-xs transition-all duration-200 hover:border-purple-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <button 
                onClick={handleScrollToTable}
                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded text-xs font-medium hover:from-purple-600 hover:to-purple-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                View
              </button>
            </div>
          </div>

          {/* Compact Horizontal Bar Chart */}
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] truncate max-w-[150px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.name}
                  </span>
                  <span className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.displayValue}
                  </span>
                </div>
                <div className="relative">
                  <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 group-hover:opacity-90 ${
                        chartView === 'revenue' ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                      }`}
                      style={{ 
                        width: `${(item.value / maxValue) * 100}%`,
                        animation: `expandBar 0.8s ease-out ${index * 0.05}s both`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brand/Supplier Chart - Compact */}
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

          <div className="relative">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'area' | 'spline')}
              className={`pl-3 pr-8 py-1 rounded border text-xs appearance-none transition-all duration-200 hover:border-purple-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="spline">Spline</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>
        </div>

        <h3 className={`text-center text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {brandSupplierTab === 'brand' ? 'Brand' : 'Supplier'} Revenue
        </h3>

        <div className="relative pl-8">
          <div className={`absolute left-0 top-0 h-[160px] flex flex-col justify-between text-[9px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{Math.round(maxRevenueValue)}</span>
            <span>{Math.round(maxRevenueValue * 0.5)}</span>
            <span>0</span>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
            <div className="flex items-end gap-1 h-40" style={{ minWidth: `${brandSupplierData.length * 35}px` }}>
              {brandSupplierData.map((item, index) => {
                const heightPercentage = (item.value / maxRevenueValue) * 100;
                const barColor = brandSupplierTab === 'brand' ? '#ec4899' : '#3b82f6';
                
                return (
                  <div key={index} className="group flex flex-col items-center" style={{ minWidth: '35px' }}>
                    <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                      <div
                        className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer relative"
                        style={{
                          height: `${heightPercentage}%`,
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          animation: `expandBarVertical 0.8s ease-out ${(index % 20) * 0.05}s both`,
                          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
                        }}
                        title={`${item.name}: ${item.value.toFixed(2)}`}
                      >
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {item.value.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-[8px] text-center mt-1 transform -rotate-45 origin-top-left whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.name.substring(0, 12)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full ${brandSupplierTab === 'brand' ? 'bg-pink-500' : 'bg-blue-500'}`} />
          <span className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Revenue</span>
        </div>
      </div>

      {/* Data Tables - Compact */}
      <div id="item-data-table" className={`rounded-lg border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>

        {/* Item Analysis Table */}
        {tableTab === 'item-analysis' && (
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
            <table className="w-full">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Item
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Category
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Supplier
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Brand
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Stock
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Days
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Expiry
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedItems.map((item, index) => {
                  let reorderBadgeClass = '';
                  if (item.reorderStatus === 'Critical Reorder Now' || item.reorderStatus === 'Out of Stock') {
                    reorderBadgeClass = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
                  } else if (item.reorderStatus === 'Low Consider Reorder') {
                    reorderBadgeClass = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
                  } else {
                    reorderBadgeClass = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
                  }

                  return (
                    <tr 
                      key={index} 
                      className={`transition-all duration-200 hover:scale-[1.01] ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                      style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.itemName.substring(0, 30)}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {item.itemCategory || 'N/A'}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {item.supplier || 'N/A'}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {item.brand}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {(item.currentStock ?? 0).toFixed(0)}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {(item.daysOfSupply ?? 0).toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${reorderBadgeClass} transition-all duration-200 hover:scale-105`}>
                          {item.reorderStatus.substring(0, 15)}
                        </span>
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        {item.nearestExpiryDate || 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 transition-all duration-200 hover:scale-105">
                          {item.expiryRisk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Compact Pagination */}
            <div className={`flex items-center justify-between px-3 py-2 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rows:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded border text-xs transition-all duration-200 hover:border-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, pharmacyItems.length)} of {pharmacyItems.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded transition-all duration-200 hover:bg-purple-500 hover:text-white active:scale-95 ${
                      currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-110'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalItemPages, prev + 1))}
                    disabled={currentPage === totalItemPages}
                    className={`p-1 rounded transition-all duration-200 hover:bg-purple-500 hover:text-white active:scale-95 ${
                      currentPage === totalItemPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-110'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Short Expiry List Table */}
        {tableTab === 'short-expiry' && (
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
            <table className="w-full">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Item
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Category
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Company
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Expiry
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Stock
                  </th>
                  <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Supplier
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedExpiryItems.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`transition-all duration-200 hover:scale-[1.01] ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                    style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                  >
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {(item.itemName || item.sT_COD).substring(0, 30)}
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.cT_NM || 'N/A'}
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.company || 'N/A'}
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.expiryMMYY}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 transition-all duration-200 hover:scale-105">
                        {item.expiryStatus}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.stockInUnits || 0}
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.supplier || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Compact Pagination */}
            <div className={`flex items-center justify-between px-3 py-2 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rows:</span>
                <select
                  value={expiryPerPage}
                  onChange={(e) => {
                    setExpiryPerPage(Number(e.target.value));
                    setExpiryCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded border text-xs transition-all duration-200 hover:border-purple-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(expiryCurrentPage - 1) * expiryPerPage + 1}–{Math.min(expiryCurrentPage * expiryPerPage, expiryItems.length)} of {expiryItems.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setExpiryCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={expiryCurrentPage === 1}
                    className={`p-1 rounded transition-all duration-200 hover:bg-purple-500 hover:text-white active:scale-95 ${
                      expiryCurrentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-110'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpiryCurrentPage(prev => Math.min(totalExpiryPages, prev + 1))}
                    disabled={expiryCurrentPage === totalExpiryPages}
                    className={`p-1 rounded transition-all duration-200 hover:bg-purple-500 hover:text-white active:scale-95 ${
                      expiryCurrentPage === totalExpiryPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-110'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Animations */}
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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 1000;
          }
        }

        @keyframes expandBar {
          from {
            width: 0;
          }
        }

        @keyframes expandBarVertical {
          from {
            height: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Custom scrollbar for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }

        .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
          background-color: #a855f7;
          border-radius: 3px;
        }

        .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb:hover {
          background-color: #9333ea;
        }

        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background-color: #e5e7eb;
        }

        .dark .scrollbar-track-gray-700::-webkit-scrollbar-track {
          background-color: #374151;
        }
      `}</style>

      {/* ABC Classification Modal - Enhanced */}
      {showABCModal && selectedABCClass && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCloseABCModal}
        >
          <div 
            className={`rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-scaleIn ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ABC Classification - Class {selectedABCClass}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportABCClass}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-medium rounded hover:from-teal-600 hover:to-teal-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <button
                  onClick={handleCloseABCModal}
                  className={`p-1.5 rounded transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 ${isDark ? 'hover:bg-red-600' : ''}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <table className="w-full">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}>
                  <tr>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Item
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Category
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Sold
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Revenue
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Avg Price
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Margin
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Stock
                    </th>
                    <th className={`px-3 py-2 text-left text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredABCItems.map((item, index) => {
                    const avgUnitPrice = item.totalSold > 0 ? item.totalRevenue / item.totalSold : 0;
                    const isEvenRow = index % 2 === 0;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`transition-all duration-200 hover:scale-[1.005] ${isEvenRow ? (isDark ? 'bg-gray-800' : 'bg-white') : (isDark ? 'bg-gray-750' : 'bg-cyan-50')} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-cyan-100'}`}
                      >
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {item.itemName?.substring(0, 40) || 'N/A'}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {item.itemCategory || 'N/A'}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {(item.totalSold ?? 0).toFixed(0)}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {(item.totalRevenue ?? 0).toFixed(2)}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {avgUnitPrice.toFixed(2)}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {(item.grossMargin ?? 0).toFixed(2)}
                        </td>
                        <td className={`px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {(item.currentStock ?? 0).toFixed(0)}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[10px] transition-transform duration-200 hover:scale-110"
                            style={{ backgroundColor: getABCColor(item.aBCClass) }}
                          >
                            {item.aBCClass}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredABCItems.length === 0 && (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items in class {selectedABCClass}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between px-4 py-2 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: {filteredABCItems.length} items
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

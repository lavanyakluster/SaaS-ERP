'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  DollarSign, CreditCard, ShoppingCart, TrendingUp, Receipt, Target, 
  BarChart3, Package, CheckCircle, AlertCircle, Users 
} from 'lucide-react';
import { useTheme } from '@/lib/store/theme-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { 
  useBranches, 
  useProfitLossWithTotals, 
  useDateRange, 
  useBranchCode,
  useAutoOrganizationSwitch
} from '@/lib/hooks';

// ⚡ PERFORMANCE: Import lightweight components synchronously
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

// Types
import type { DashboardType, Widget } from '@/components/dashboard/types';

// Hooks
import { useMetrics } from './hooks/useMetrics';
import { useWidgets } from './hooks/useWidgets';
import { useWidgetActions } from './hooks/useWidgetActions';

// ⚡ PERFORMANCE: Lazy load heavy components with SSR disabled
const DashboardCustomizer = dynamic(
  () => import('@/components/dashboard/DashboardCustomizer'),
  { ssr: false }
);

const MetricsGrid = dynamic(
  () => import('@/components/dashboard/MetricsGrid').then(mod => ({ default: mod.MetricsGrid })),
  { ssr: false, loading: () => <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

const WidgetsGrid = dynamic(
  () => import('@/components/dashboard/WidgetsGrid').then(mod => ({ default: mod.WidgetsGrid })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
);

const WidgetFullscreenModal = dynamic(
  () => import('@/components/dashboard/WidgetFullscreenModal'),
  { ssr: false }
);

// ⚡ PERFORMANCE: Lazy load specialized dashboards (only load when needed)
const ModernItemDashboard = dynamic(
  () => import('@/components/dashboard/ModernItemDashboard').then(mod => ({ default: mod.ModernItemDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

const ModernSalesKPIDashboard = dynamic(
  () => import('@/components/dashboard/ModernSalesKPIDashboard').then(mod => ({ default: mod.ModernSalesKPIDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

const ModernSalesDashboard = dynamic(
  () => import('@/components/dashboard/ModernSalesDashboard').then(mod => ({ default: mod.ModernSalesDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

const EnhancedSalesDashboard = dynamic(
  () => import('@/components/dashboard/EnhancedSalesDashboard').then(mod => ({ default: mod.EnhancedSalesDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

const ModernAccountDashboard = dynamic(
  () => import('@/components/dashboard/ModernAccountDashboard').then(mod => ({ default: mod.ModernAccountDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { selectedOrganization } = useAuthStore();
  
  // ✅ CRITICAL: Auto-switch organization after login and fetch years
  useAutoOrganizationSwitch();

  // ✅ CRITICAL: Get auth status to prevent API calls during logout
  const status = useAuthStore(state => state.status);
  const isLoggingOut = useAuthStore(state => state.isLoggingOut);
  const tokens = useAuthStore(state => state.tokens);
  const selectedYear = useAuthStore(state => state.selectedYear);
  const selectedBranchCode = useAuthStore(state => state.selectedBranch);
  
  // Debug logging for auth state (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Dashboard Auth State:', {
      status,
      isLoggingOut,
      hasTokens: !!tokens,
      isAuthenticated: status === 'authenticated' && !isLoggingOut,
      selectedOrganization: selectedOrganization?.id,
    });
  }

  // Organization details - use correct property names
  const firm = selectedOrganization?.displayName || selectedOrganization?.name || '';
  const year = selectedYear || new Date().getFullYear().toString();

  // Dashboard state
  const [activeDashboard, setActiveDashboard] = useState<DashboardType>('overview');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [dateRange, setDateRange] = useState('This Quarter');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [fullscreenWidget, setFullscreenWidget] = useState<Widget | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [isCumulative, setIsCumulative] = useState(false); // ✅ Account dashboard cumulative state

  // Fetch branches
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const branches = branchesData || [];

  // Get date range and branch code
  const { getDateRange } = useDateRange();
  
  // Use custom dates if Custom Range is selected, otherwise use preset range
  const { fromDt, toDt } = dateRange === 'Custom Range' && customFromDate && customToDate
    ? { fromDt: customFromDate, toDt: customToDate }
    : getDateRange(dateRange);
  
  const branchCode = useBranchCode(selectedBranch, branches);

  // Handle custom date range change
  const handleCustomDateChange = (fromDate: string, toDate: string) => {
    setCustomFromDate(fromDate);
    setCustomToDate(toDate);
  };

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Dashboard API Parameters:', {
      selectedBranch,
      branchCode,
      fromDt,
      toDt,
      dateRange,
    });
  }

  // Fetch profit/loss data for overview dashboard
  // ⚡ OPTIMIZATION: Only fetch when overview dashboard is active AND branches are loaded
  const { 
    totals, 
    chartData,
    isLoading: isProfitLossLoading,
    error: profitLossError 
  } = useProfitLossWithTotals({
    fromDt,
    toDt,
    brCode: branchCode,
  }, activeDashboard === 'overview' && !branchesLoading);

  // Get metrics for current dashboard
  const metrics = useMetrics(activeDashboard, totals, isProfitLossLoading, profitLossError);

  // Get widgets for current dashboard
  const {
    activeWidgets,
    widgetChartTypes,
    widgetSizes,
    dashboardWidgets,
    allWidgets,
    setWidgetChartTypes,
    setWidgetSizes,
    setDashboardWidgets,
  } = useWidgets(activeDashboard, chartData);

  // Widget actions
  const {
    handleWidgetRemove,
    handleWidgetChartTypeChange,
    handleWidgetSizeChange,
    handleWidgetDuplicate,
    handleWidgetFullscreen,
  } = useWidgetActions({
    activeDashboard,
    allWidgets,
    setDashboardWidgets,
    setWidgetChartTypes,
    setWidgetSizes,
    setFullscreenWidget,
  });

  // Action handlers
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Trigger actual refresh by invalidating React Query cache
    setTimeout(() => {
      window.location.reload();
    }, 500);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const handleExport = useCallback(() => {
    console.log('📥 Exporting dashboard data...');
    
    // Create CSV content
    const csvRows = [];
    
    // Add header
    csvRows.push(['Dashboard Export', `Generated: ${new Date().toLocaleString()}`]);
    csvRows.push([]); // Empty row
    csvRows.push(['Organization', firm]);
    csvRows.push(['Year', year]);
    csvRows.push(['Branch', selectedBranch]);
    csvRows.push(['Date Range', dateRange]);
    csvRows.push([]); // Empty row
    
    // Add metrics data
    if (metrics && metrics.length > 0) {
      csvRows.push(['Metrics']);
      csvRows.push(['Label', 'Value', 'Change']);
      metrics.forEach(metric => {
        csvRows.push([
          metric.label,
          metric.value,
          metric.change || 'N/A'
        ]);
      });
    }
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Dashboard data exported successfully');
  }, [metrics, firm, year, selectedBranch, dateRange]);

  const handleSaveCustomization = useCallback((widgetIds: string[]) => {
    setDashboardWidgets(prev => ({
      ...prev,
      [activeDashboard]: widgetIds,
    }));
  }, [activeDashboard]);

  // Render specialized dashboards
  if (activeDashboard === 'sales') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <DashboardHeader
          firm={firm}
          year={year}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          branches={branches}
          branchesLoading={branchesLoading}
          isDark={isDark}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onCustomDateChange={handleCustomDateChange}
          activeDashboard={activeDashboard}
          onDashboardChange={setActiveDashboard}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6 space-y-6">
          {/* Enhanced Sales Dashboard with Tabs */}
          <EnhancedSalesDashboard 
            isDark={isDark}
            dateRange={dateRange}
            selectedBranch={selectedBranch}
            branches={branches}
            fromDt={fromDt}
            toDt={toDt}
          />

          {/* Sales Growth & Rep Sales Widgets */}
          <ModernSalesDashboard 
            isDark={isDark}
            onFullscreen={handleWidgetFullscreen}
            dateRange={dateRange}
            selectedBranch={selectedBranch}
            branches={branches}
          />
        </div>
      </div>
    );
  }

  if (activeDashboard === 'item') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <DashboardHeader
          firm={firm}
          year={year}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          branches={branches}
          branchesLoading={branchesLoading}
          isDark={isDark}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onCustomDateChange={handleCustomDateChange}
          activeDashboard={activeDashboard}
          onDashboardChange={setActiveDashboard}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6">
          <ModernItemDashboard 
            isDark={isDark} 
            dateRange={dateRange}
            selectedBranch={selectedBranch}
            branches={branches}
            customFromDate={customFromDate}
            customToDate={customToDate}
          />
        </div>
      </div>
    );
  }

  if (activeDashboard === 'salekpi') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <DashboardHeader
          firm={firm}
          year={year}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          branches={branches}
          branchesLoading={branchesLoading}
          isDark={isDark}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onCustomDateChange={handleCustomDateChange}
          activeDashboard={activeDashboard}
          onDashboardChange={setActiveDashboard}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6">
          <ModernSalesKPIDashboard />
        </div>
      </div>
    );
  }

  if (activeDashboard === 'account') {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <DashboardHeader
          firm={firm}
          year={year}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          branches={branches}
          branchesLoading={branchesLoading}
          isDark={isDark}
          customFromDate={customFromDate}
          customToDate={customToDate}
          onCustomDateChange={handleCustomDateChange}
          activeDashboard={activeDashboard}
          onDashboardChange={setActiveDashboard}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isCumulative={isCumulative}
          onCumulativeChange={setIsCumulative}
        />
        <div className="px-6 py-4">
          <ModernAccountDashboard 
            isDark={isDark}
            dateRange={dateRange}
            selectedBranch={branchCode}
            branches={branches}
            selectedYear={year}
            isCumulative={isCumulative}
            fromDt={fromDt}
            toDt={toDt}
          />
        </div>
      </div>
    );
  }

  // Overview and Account dashboards
  const isLoading = branchesLoading || isProfitLossLoading;

  // ⚡ PERFORMANCE: Show skeleton on initial load
  if (branchesLoading && !branches.length) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="px-6 py-6">
          <DashboardSkeleton isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <DashboardHeader
        firm={firm}
        year={year}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        branches={branches}
        branchesLoading={branchesLoading}
        isDark={isDark}
        customFromDate={customFromDate}
        customToDate={customToDate}
        onCustomDateChange={handleCustomDateChange}
        activeDashboard={activeDashboard}
        onDashboardChange={setActiveDashboard}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="px-6 py-6">
        {/* Metrics Grid */}
        <MetricsGrid metrics={metrics} isLoading={isLoading} />

        {/* Widgets Grid */}
        <WidgetsGrid
          widgets={activeWidgets}
          onRemove={handleWidgetRemove}
          onChartTypeChange={handleWidgetChartTypeChange}
          onSizeChange={handleWidgetSizeChange}
          onDuplicate={handleWidgetDuplicate}
          onFullscreen={handleWidgetFullscreen}
          onAddWidget={() => setShowCustomizer(true)}
          isLoading={isLoading}
        />
      </div>

      {/* Customizer Modal */}
      {showCustomizer && (
        <DashboardCustomizer
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          allWidgets={allWidgets}
          selectedWidgets={dashboardWidgets[activeDashboard]}
          onSave={handleSaveCustomization}
        />
      )}

      {/* Fullscreen Widget Modal */}
      {fullscreenWidget && (
        <WidgetFullscreenModal
          widget={fullscreenWidget}
          onClose={() => setFullscreenWidget(null)}
        />
      )}
    </div>
  );
}
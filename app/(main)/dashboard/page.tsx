'use client';

import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
import { useManualCumulation } from '@/lib/hooks/useCumulation'; // ✅ NEW: Cumulation hook
import { PROFIT_LOSS_KEYS } from '@/lib/hooks/useProfitLoss';
import { salesDashboardKeys } from '@/lib/hooks/useSalesDashboard';
import { loyaltyDashboardKeys } from '@/lib/hooks/useLoyaltyDashboard';
import { salesTargetKeys } from '@/lib/hooks/useSalesTarget';

// ⚡ PERFORMANCE: Import lightweight components synchronously
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { OverviewWidgets } from '@/components/dashboard/OverviewWidgets';
import { GradientMetricsGrid } from '@/components/dashboard/GradientMetricCard';

// Types
import type { DashboardType, Widget } from '@/components/dashboard/types';

// Hooks
import { useWidgets } from './hooks/useWidgets';
import { useWidgetActions } from './hooks/useWidgetActions';

// ⚡ PERFORMANCE: Lazy load heavy components with SSR disabled
const DashboardCustomizer = dynamic(
  () => import('@/components/dashboard/DashboardCustomizer'),
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

const ModernAccountDashboard = dynamic(
  () => import('@/components/dashboard/ModernAccountDashboard').then(mod => ({ default: mod.ModernAccountDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

// Loyalty Dashboard
const LoyaltyDashboard = dynamic(
  () => import('@/components/dashboard/LoyaltyDashboard').then(mod => ({ default: mod.LoyaltyDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

// Sales Target Analysis Dashboard
const SalesTargetDashboard = dynamic(
  () => import('@/components/dashboard/SalesTargetDashboard').then(mod => ({ default: mod.SalesTargetDashboard })),
  { 
    ssr: false,
    loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
  }
);

const DASHBOARD_TABS: DashboardType[] = [
  'overview',
  'sales',
  'account',
  'item',
  'sales-kpi',
  'loyalty',
  'sales-target',
];

const isDashboardType = (value: string | null): value is DashboardType =>
  !!value && DASHBOARD_TABS.includes(value as DashboardType);

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
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
  const queryTab = searchParams.get('tab');
  const [activeDashboard, setActiveDashboard] = useState<DashboardType>(
    isDashboardType(queryTab) ? queryTab : 'overview'
  );
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [dateRange, setDateRange] = useState('This Quarter');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [fullscreenWidget, setFullscreenWidget] = useState<Widget | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [isCumulative, setIsCumulative] = useState(false); // ? Account dashboard cumulative state

  useEffect(() => {
    const nextDashboard = isDashboardType(queryTab) ? queryTab : 'overview';
    if (nextDashboard !== activeDashboard) {
      setActiveDashboard(nextDashboard);
    }
  }, [queryTab, activeDashboard]);

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

  // ✅ CRITICAL: Manual cumulation hook - MUST be called at top level
  const { mutate: performCumulation, isPending: isCumulating } = useManualCumulation();

  // ✅ NEW: Handle cumulation button click - MUST be at top level
  const handleCumulate = useCallback(() => {
    performCumulation({
      fromDt,
      toDt,
      brCode: branchCode,
      year,
    });
  }, [performCumulation, fromDt, toDt, branchCode, year]);

  // Action handlers
  const handleDashboardChange = useCallback((dashboard: DashboardType) => {
    setActiveDashboard(dashboard);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (dashboard === 'overview') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', dashboard);
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [router, pathname, searchParams]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      switch (activeDashboard) {
        case 'overview':
          await queryClient.invalidateQueries({ queryKey: PROFIT_LOSS_KEYS.all });
          break;
        case 'sales':
          await queryClient.invalidateQueries({ queryKey: salesDashboardKeys.all });
          break;
        case 'account':
          await queryClient.invalidateQueries({ queryKey: ['accounts'] });
          break;
        case 'item':
          await queryClient.invalidateQueries({ queryKey: ['pharmacy-item-dashboard'] });
          break;
        case 'sales-kpi':
          await queryClient.invalidateQueries({ queryKey: ['salesKpi'] });
          break;
        case 'loyalty':
          await queryClient.invalidateQueries({ queryKey: loyaltyDashboardKeys.all });
          break;
        case 'sales-target':
          await queryClient.invalidateQueries({ queryKey: salesTargetKeys.all });
          break;
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [activeDashboard, queryClient]);

  const handleExport = useCallback(() => {}, []);
  
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
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6 space-y-6">
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
          onDashboardChange={handleDashboardChange}
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

  if (activeDashboard === 'sales-kpi') {
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
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6">
          <ModernSalesKPIDashboard isDark={isDark} />
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
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isCumulative={isCumulative}
          onCumulativeChange={setIsCumulative}
          onCumulate={handleCumulate} // ✅ NEW: Cumulation handler
          isCumulating={isCumulating} // ✅ NEW: Cumulation loading state
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

  // Loyalty Dashboard
  if (activeDashboard === 'loyalty') {
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
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="px-6 py-6">
          <LoyaltyDashboard 
            dateFrom={fromDt}
            dateTo={toDt}
          />
        </div>
      </div>
    );
  }

  // Sales Target Analysis Dashboard
  if (activeDashboard === 'sales-target') {
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
          onDashboardChange={handleDashboardChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <SalesTargetDashboard />
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
        onDashboardChange={handleDashboardChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="px-6 py-6">
        {/* Gradient Metric Cards */}
        {!isLoading && totals && (
          <GradientMetricsGrid
            income={totals.totalIncome}
            expense={totals.totalExpense}
            profit={totals.totalProfit}
            profitMargin={totals.profitMargin}
            isDark={isDark}
            isLoading={isProfitLossLoading}
          />
        )}

        {/* Loading State for Metrics */}
        {isLoading && (
          <GradientMetricsGrid
            income={0}
            expense={0}
            profit={0}
            profitMargin={0}
            isDark={isDark}
            isLoading={true}
          />
        )}

        {/* Overview Widgets */}
        {!isLoading && chartData && chartData.length > 0 && (
          <OverviewWidgets 
            data={chartData}
            isDark={isDark}
            year={Number.parseInt(year, 10) || new Date().getFullYear()}
            dateRange={dateRange}
            onFullscreen={() => {}} // Enable fullscreen icon
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading dashboard data...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!chartData || chartData.length === 0) && (
          <div className="mt-6 text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No data available for the selected period.
            </p>
          </div>
        )}
      </div>

      {/* Customizer Modal */}
      {showCustomizer && (
        <DashboardCustomizer
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          availableWidgets={allWidgets}
          activeWidgets={dashboardWidgets[activeDashboard]}
          onSave={handleSaveCustomization}
          isDark={isDark}
        />
      )}
    </div>
  );
}



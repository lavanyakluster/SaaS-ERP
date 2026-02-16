/**
 * Dashboard Type Definitions
 */

import type { Status } from './common';
import type { VoucherType } from './voucher';

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
  revenueGrowth: number;
  expensesGrowth: number;
  profitGrowth: number;
  customersGrowth: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit?: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

export interface Transaction {
  id: string;
  type: VoucherType;
  customer: string;
  amount: number;
  status: Status;
  date: string;
  voucherNo?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueData: RevenueData[];
  categoryData: CategoryData[];
  recentTransactions: Transaction[];
}

export type DashboardView = 'overview' | 'sales' | 'purchase';

export interface DashboardFilters {
  branchId: string;
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  dateFrom?: string;
  dateTo?: string;
}

// ============================================
// CHART TYPES
// ============================================

/**
 * Generic chart data point with extensible properties
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * Chart tooltip payload item (Recharts)
 */
export interface ChartTooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: ChartDataPoint;
  fill?: string;
  stroke?: string;
}

/**
 * Chart tooltip props (Recharts)
 */
export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

/**
 * Chart data key configuration
 */
export interface ChartDataKey {
  key: string;
  label: string;
  color: string;
}

/**
 * Chart type options
 */
export type ChartType = 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';

/**
 * Chart size options
 */
export type ChartSize = 'small' | 'medium' | 'large' | 'full';

// ============================================
// WIDGET TYPES
// ============================================

/**
 * Widget data for fullscreen modal
 */
export interface WidgetData {
  id: string;
  title: string;
  subtitle?: string;
  chartType: ChartType;
  data: ChartDataPoint[];
  dataKeys: ChartDataKey[];
  size?: ChartSize;
}

/**
 * Widget fullscreen callback
 */
export type OnFullscreenCallback = (id: string, data?: WidgetData) => void;

/**
 * Chart type change callback
 */
export type OnChartTypeChangeCallback = (id: string, chartType: ChartType) => void;

// ============================================
// INVENTORY TYPES
// ============================================

/**
 * Inventory status
 */
export type InventoryStatus = 'Low' | 'Normal' | 'High' | 'Critical' | 'Optimal';

/**
 * Inventory table row
 */
export interface InventoryTableRow {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  value: number;
  status: InventoryStatus;
  lastUpdated?: string;
}

/**
 * ABC classification data
 */
export interface ABCClassificationItem {
  name: string;
  value: number;
  color: string;
  percentage?: number;
  description?: string;
}

/**
 * Reorder level data
 */
export interface ReorderLevelItem {
  name: string;
  value: number;
  status?: InventoryStatus;
}

/**
 * Stock movement data
 */
export interface StockMovementItem {
  date: string;
  movement: number;
  type?: 'in' | 'out' | 'adjustment';
  reason?: string;
}

// ============================================
// SALES TYPES
// ============================================

/**
 * Sales KPI metric
 */
export interface SalesKPIMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
}

/**
 * Sales analysis data
 */
export interface SalesAnalysisData {
  period: string;
  sales: number;
  target?: number;
  growth?: number;
}

/**
 * Branch analysis data
 */
export interface BranchAnalysisData {
  name: string;
  sales: number;
  revenue: number;
  profit: number;
  growth: number;
  target?: number;
}

// ============================================
// TABLE VIEW TYPES
// ============================================

/**
 * Table view options
 */
export type TableView = 'all' | 'low' | 'normal' | 'high' | 'critical';

/**
 * Table sort options
 */
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Table filter options
 */
export interface TableFilter {
  category?: string;
  status?: InventoryStatus;
  search?: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Form error
 */
export interface FormError {
  field: string;
  message: string;
}

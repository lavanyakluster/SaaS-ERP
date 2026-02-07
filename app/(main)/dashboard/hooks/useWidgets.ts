import { useState, useMemo } from 'react';
import type { DashboardType, Widget, WidgetSize } from '@/components/dashboard/types';

interface ChartDataItem {
  month: string;
  profit: number;
  income: number;
  expense: number;
}

export const useWidgets = (activeDashboard: DashboardType, chartData?: ChartDataItem[]) => {
  // Widget configurations
  const [widgetChartTypes, setWidgetChartTypes] = useState<
    Record<string, 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table'>
  >({
    'revenue-trend': 'column',
    'expense-breakdown': 'pie',
    'profit-margin': 'column',
  });

  const [dashboardWidgets, setDashboardWidgets] = useState<Record<DashboardType, string[]>>({
    overview: ['revenue-trend', 'top-profit', 'expense-breakdown', 'income-distribution'],
    sales: ['sales-trend', 'top-products', 'sales-by-region'],
    account: ['account-balance', 'receivables', 'payables', 'cash-flow'],
    item: ['inventory-levels', 'top-items', 'item-movement'],
    salekpi: ['kpi-revenue', 'kpi-conversion', 'kpi-targets'],
  });

  const [widgetSizes, setWidgetSizes] = useState<Record<string, WidgetSize>>({
    'revenue-trend': 'medium',
    'expense-breakdown': 'medium',
    'profit-margin': 'medium',
  });

  // All available widgets
  const allWidgets: Widget[] = useMemo(() => {
    // Use real API data for overview widgets
    if (activeDashboard === 'overview' && chartData && chartData.length > 0) {
      return [
        {
          id: 'revenue-trend',
          title: 'Report: Year 2026',
          subtitle: `${chartData.length} Month${chartData.length > 1 ? 's' : ''}`,
          chartType: widgetChartTypes['revenue-trend'],
          category: 'Overview',
          size: widgetSizes['revenue-trend'],
          data: chartData.map((item) => ({
            name: item.month,
            profit: item.profit,
            income: item.income,
            expense: item.expense,
          })),
          dataKeys: [
            { key: 'profit', label: 'Profit', color: '#3b82f6' },
            { key: 'income', label: 'Income', color: '#10b981' },
            { key: 'expense', label: 'Expense', color: '#f59e0b' },
          ],
        },
        {
          id: 'top-profit',
          title: 'Top Profit : Year 2026',
          subtitle: `${chartData.length} Month${chartData.length > 1 ? 's' : ''}`,
          chartType: widgetChartTypes['top-profit'] || 'column',
          category: 'Overview',
          size: widgetSizes['top-profit'] || 'medium',
          data: chartData.map((item) => ({
            name: item.month,
            profit: item.profit,
          })),
          dataKeys: [{ key: 'profit', label: 'Profit', color: '#ec4899' }],
        },
        {
          id: 'expense-breakdown',
          title: 'Expense : Year 2026',
          subtitle: `${chartData.length} Month${chartData.length > 1 ? 's' : ''}`,
          chartType: widgetChartTypes['expense-breakdown'],
          category: 'Overview',
          size: widgetSizes['expense-breakdown'],
          data: chartData.map((item) => ({
            name: item.month,
            expense: item.expense,
          })),
          dataKeys: [{ key: 'expense', label: 'Expense', color: '#8b5cf6' }],
        },
        {
          id: 'income-distribution',
          title: 'Income : 2026',
          subtitle: `${chartData.length} Month${chartData.length > 1 ? 's' : ''}`,
          chartType: widgetChartTypes['income-distribution'] || 'column',
          category: 'Overview',
          size: widgetSizes['income-distribution'] || 'medium',
          data: chartData.map((item) => ({
            name: item.month,
            income: item.income,
          })),
          dataKeys: [{ key: 'income', label: 'Income', color: '#c026d3' }],
        },
      ];
    }

    // No data available - return empty widgets with "No Data" message
    return [
      {
        id: 'revenue-trend',
        title: 'Revenue',
        subtitle: 'No Data',
        chartType: widgetChartTypes['revenue-trend'],
        category: 'Overview',
        size: widgetSizes['revenue-trend'],
        data: [],
        dataKeys: [{ key: 'revenue', label: 'Revenue', color: '#3b82f6' }],
      },
      {
        id: 'expense-breakdown',
        title: 'Expenses',
        subtitle: 'No Data',
        chartType: widgetChartTypes['expense-breakdown'],
        category: 'Overview',
        size: widgetSizes['expense-breakdown'],
        data: [],
        dataKeys: [
          { key: 'value', label: 'Amount', color: '#3b82f6' },
          { key: 'value', label: 'Amount', color: '#10b981' },
          { key: 'value', label: 'Amount', color: '#f59e0b' },
          { key: 'value', label: 'Amount', color: '#ef4444' },
          { key: 'value', label: 'Amount', color: '#8b5cf6' },
        ],
      },
      {
        id: 'profit-margin',
        title: 'Profit & Loss',
        subtitle: 'No Data',
        chartType: widgetChartTypes['profit-margin'],
        category: 'Overview',
        size: widgetSizes['profit-margin'],
        data: [],
        dataKeys: [
          { key: 'income', label: 'Income', color: '#10b981' },
          { key: 'expense', label: 'Expense', color: '#ef4444' },
        ],
      },
    ];
  }, [widgetChartTypes, widgetSizes, activeDashboard, chartData]);

  const activeWidgets = useMemo(() => {
    const widgetIds = dashboardWidgets[activeDashboard];
    return allWidgets.filter((w) => widgetIds.includes(w.id));
  }, [activeDashboard, dashboardWidgets, allWidgets]);

  return {
    activeWidgets,
    widgetChartTypes,
    widgetSizes,
    dashboardWidgets,
    allWidgets,
    setWidgetChartTypes,
    setWidgetSizes,
    setDashboardWidgets,
  };
};
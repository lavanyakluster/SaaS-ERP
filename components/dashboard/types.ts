export type DashboardType = 'overview' | 'sales' | 'account' | 'item' | 'salekpi';
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface Widget {
  id: string;
  title: string;
  subtitle?: string;
  chartType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  category: string;
  size: WidgetSize;
}
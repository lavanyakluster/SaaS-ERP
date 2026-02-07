'use client';

import type { WidgetSize } from './types';
import { ResizableChartWidget } from './ResizableChartWidget';

export interface WidgetData {
  id: string;
  title: string;
  subtitle?: string;
  chartType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table';
  data: any[];
  dataKeys: { key: string; label: string; color: string }[];
  category: string;
  size: WidgetSize;
}

interface WidgetsGridProps {
  widgets: WidgetData[];
  onRemove: (widgetId: string) => void;
  onChartTypeChange: (widgetId: string, newType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table') => void;
  onSizeChange: (widgetId: string, newSize: WidgetSize) => void;
  onDuplicate: (widgetId: string) => void;
  onFullscreen: (widgetId: string) => void;
  onAddWidget: () => void;
  isLoading?: boolean;
  isDark: boolean;
}

export function WidgetsGrid({
  widgets,
  onRemove,
  onChartTypeChange,
  onSizeChange,
  onDuplicate,
  onFullscreen,
  onAddWidget,
  isLoading = false,
  isDark,
}: WidgetsGridProps) {
  const getWidgetSizeClass = (size: WidgetSize) => {
    switch (size) {
      case 'small':
        return 'lg:col-span-1 h-[300px]';
      case 'medium':
        return 'lg:col-span-1 h-[400px]';
      case 'large':
        return 'lg:col-span-1 h-[500px]';
      case 'full':
        return 'lg:col-span-1 h-[400px]';
      default:
        return 'lg:col-span-1 h-[400px]';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[400px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {widgets.map((widget) => (
        <div key={widget.id} className={getWidgetSizeClass(widget.size)}>
          <ResizableChartWidget
            id={widget.id}
            title={widget.title}
            subtitle={widget.subtitle}
            chartType={widget.chartType}
            data={widget.data}
            dataKeys={widget.dataKeys}
            isDark={isDark}
            size={widget.size}
            onRemove={onRemove}
            onChangeChartType={onChartTypeChange}
            onChangeSize={onSizeChange}
            onDuplicate={onDuplicate}
            onFullscreen={onFullscreen}
          />
        </div>
      ))}
    </div>
  );
}

import { useCallback } from 'react';
import type { DashboardType, Widget, WidgetSize } from '@/components/dashboard/types';

interface UseWidgetActionsProps {
  activeDashboard: DashboardType;
  allWidgets: Widget[];
  setDashboardWidgets: React.Dispatch<React.SetStateAction<Record<DashboardType, string[]>>>;
  setWidgetChartTypes: React.Dispatch<
    React.SetStateAction<Record<string, 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table'>>
  >;
  setWidgetSizes: React.Dispatch<React.SetStateAction<Record<string, WidgetSize>>>;
  setFullscreenWidget: React.Dispatch<React.SetStateAction<Widget | null>>;
}

export const useWidgetActions = ({
  activeDashboard,
  allWidgets,
  setDashboardWidgets,
  setWidgetChartTypes,
  setWidgetSizes,
  setFullscreenWidget,
}: UseWidgetActionsProps) => {
  const handleWidgetRemove = useCallback(
    (widgetId: string) => {
      setDashboardWidgets((prev) => ({
        ...prev,
        [activeDashboard]: prev[activeDashboard].filter((id) => id !== widgetId),
      }));
    },
    [activeDashboard, setDashboardWidgets]
  );

  const handleWidgetChartTypeChange = useCallback(
    (widgetId: string, newType: 'column' | 'bar' | 'line' | 'donut' | 'pie' | 'table') => {
      setWidgetChartTypes((prev) => ({
        ...prev,
        [widgetId]: newType,
      }));
    },
    [setWidgetChartTypes]
  );

  const handleWidgetSizeChange = useCallback(
    (widgetId: string, newSize: WidgetSize) => {
      setWidgetSizes((prev) => ({
        ...prev,
        [widgetId]: newSize,
      }));
    },
    [setWidgetSizes]
  );

  const handleWidgetDuplicate = useCallback(
    (widgetId: string) => {
      const widget = allWidgets.find((w) => w.id === widgetId);
      if (!widget) return;

      const newId = `${widgetId}-copy-${Date.now()}`;

      setDashboardWidgets((prev) => ({
        ...prev,
        [activeDashboard]: [...prev[activeDashboard], newId],
      }));

      setWidgetChartTypes((prev) => ({
        ...prev,
        [newId]: prev[widgetId],
      }));

      setWidgetSizes((prev) => ({
        ...prev,
        [newId]: prev[widgetId],
      }));
    },
    [activeDashboard, allWidgets, setDashboardWidgets, setWidgetChartTypes, setWidgetSizes]
  );

  const handleWidgetFullscreen = useCallback(
    (widgetId: string) => {
      const widget = allWidgets.find((w) => w.id === widgetId);
      if (!widget) return;
      setFullscreenWidget(widget);
    },
    [allWidgets, setFullscreenWidget]
  );

  return {
    handleWidgetRemove,
    handleWidgetChartTypeChange,
    handleWidgetSizeChange,
    handleWidgetDuplicate,
    handleWidgetFullscreen,
  };
};

/**
 * Hook for managing date range conversions
 */

export const useDateRange = () => {
  const getDateRange = (range: string): { fromDt: string; toDt: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (range) {
      case 'Today':
        return { fromDt: formatDate(today), toDt: formatDate(today) };
      case 'This Week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { fromDt: formatDate(weekStart), toDt: formatDate(today) };
      }
      case 'This Month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { fromDt: formatDate(monthStart), toDt: formatDate(today) };
      }
      case 'This Quarter': {
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        return { fromDt: formatDate(quarterStart), toDt: formatDate(today) };
      }
      case 'Year 2025':
      default:
        return { fromDt: '2025-01-01', toDt: '2025-12-31' };
    }
  };

  return { getDateRange };
};

'use client';

import { DateRangeFilter } from './DateRangeFilter';

interface DateRangeFilterWrapperProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  customFromDate?: string;
  customToDate?: string;
  onCustomDateApply: (fromDate: string, toDate: string) => void;
  isDark?: boolean;
}

export function DateRangeFilterWrapper({
  dateRange,
  onDateRangeChange,
  customFromDate,
  customToDate,
  onCustomDateApply,
  isDark = false,
}: DateRangeFilterWrapperProps) {
  const handleDateRangeApply = (fromDate: string, toDate: string) => {
    onCustomDateApply(fromDate, toDate);
    onDateRangeChange('Custom Range');
  };

  return (
    <DateRangeFilter
      onApply={handleDateRangeApply}
      isDark={isDark}
    />
  );
}

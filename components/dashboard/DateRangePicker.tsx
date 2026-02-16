/**
 * Date Range Picker Component
 * 
 * ✅ Enterprise Features:
 * - Dual month calendar view
 * - Left sidebar with quick presets
 * - Visual date range selection
 * - Start/End date highlighting
 * - Compare to previous period option
 * - Dark/light theme support
 * - Month/year navigation
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onApply: (startDate: string, endDate: string) => void;
  isDark?: boolean;
}

export function DateRangePicker({ startDate, endDate, onApply, isDark = false }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [compareToPrevious, setCompareToPrevious] = useState(false);

  // Initialize dates when picker opens
  const handleOpen = () => {
    if (startDate) {
      setTempStartDate(new Date(startDate));
    } else {
      setTempStartDate(null);
    }
    if (endDate) {
      setTempEndDate(new Date(endDate));
    } else {
      setTempEndDate(null);
    }
    setIsOpen(true);
  };

  // Right month is always one month ahead of left month
  const rightMonth = useMemo(() => {
    const date = new Date(leftMonth);
    date.setMonth(date.getMonth() + 1);
    return date;
  }, [leftMonth]);

  // Generate calendar days for a specific month
  const generateCalendarDays = (baseMonth: Date) => {
    const year = baseMonth.getFullYear();
    const month = baseMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Add all days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const leftCalendarDays = useMemo(() => generateCalendarDays(leftMonth), [leftMonth]);
  const rightCalendarDays = useMemo(() => generateCalendarDays(rightMonth), [rightMonth]);

  const formatDateDisplay = () => {
    // Use the props values for display, or temp values when picker is open
    const displayStart = tempStartDate || (startDate ? new Date(startDate) : null);
    const displayEnd = tempEndDate || (endDate ? new Date(endDate) : null);
    
    if (displayStart && displayEnd) {
      // If same date, show single date
      if (displayStart.toDateString() === displayEnd.toDateString()) {
        return displayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return `${displayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${displayEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (displayStart) {
      return `${displayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ...`;
    }
    return 'Select Date Range';
  };

  const handleDayClick = (day: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(day);
      setTempEndDate(null);
      setSelectedPreset('custom');
    } else {
      // Complete the range
      const finalStart = day < tempStartDate ? day : tempStartDate;
      const finalEnd = day < tempStartDate ? tempStartDate : day;
      
      setTempStartDate(finalStart);
      setTempEndDate(finalEnd);
      
      // Auto-apply when range is complete
      requestAnimationFrame(() => {
        const start = finalStart.toISOString().split('T')[0];
        const end = finalEnd.toISOString().split('T')[0];
        onApply(start, end);
        setIsOpen(false);
      });
    }
  };

  const isDateInRange = (day: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    const dayTime = day.getTime();
    return dayTime > tempStartDate.getTime() && dayTime < tempEndDate.getTime();
  };

  const isDateRangeStart = (day: Date) => {
    if (!tempStartDate) return false;
    return day.toDateString() === tempStartDate.toDateString();
  };

  const isDateRangeEnd = (day: Date) => {
    if (!tempEndDate) return false;
    return day.toDateString() === tempEndDate.toDateString();
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start: Date;
    let end: Date = new Date(today);

    switch (preset) {
      case 'today':
        start = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        break;
      case 'thismonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastmonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        setSelectedPreset('custom');
        return;
      default:
        return;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    setSelectedPreset(preset);
    
    // Auto-apply preset
    requestAnimationFrame(() => {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      onApply(startStr, endStr);
      setIsOpen(false);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setLeftMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = (month: Date, days: Array<{ date: Date; isCurrentMonth: boolean }>) => {
    const monthYear = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
      <div className="flex-1">
        {/* Month Header */}
        <div className="text-center mb-3">
          <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {monthYear}
          </h4>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div
              key={`${day}-${idx}`}
              className={`text-center text-xs font-medium py-1 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayInfo, index) => {
            const { date, isCurrentMonth } = dayInfo;
            const isRangeStart = isDateRangeStart(date);
            const isRangeEnd = isDateRangeEnd(date);
            const isInRange = isDateInRange(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => isCurrentMonth && handleDayClick(date)}
                disabled={!isCurrentMonth}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-md transition-all relative
                  ${!isCurrentMonth 
                    ? isDark ? 'text-gray-600 cursor-default' : 'text-gray-400 cursor-default'
                    : isRangeStart || isRangeEnd
                      ? 'bg-blue-600 text-white font-semibold shadow-sm z-10'
                      : isInRange
                        ? isDark
                          ? 'bg-blue-500/20 text-blue-200'
                          : 'bg-blue-50 text-blue-700'
                        : isToday
                          ? isDark
                            ? 'text-blue-400 font-semibold ring-1 ring-blue-400'
                            : 'text-blue-600 font-semibold ring-1 ring-blue-600'
                          : isDark
                            ? 'text-gray-200 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isCurrentMonth ? 'cursor-pointer' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const presets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thismonth' },
    { label: 'Last Month', value: 'lastmonth' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={`pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-md min-w-[280px] flex items-center justify-between ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Calendar className="absolute left-3 w-4 h-4" />
        <span className="truncate">{formatDateDisplay()}</span>
      </button>

      {/* Date Range Picker Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 top-12 rounded-xl border shadow-2xl z-50 overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex">
              {/* Presets Sidebar */}
              <div className={`w-36 border-r flex flex-col ${
                isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className="flex-1 py-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePreset(preset.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                        selectedPreset === preset.value
                          ? 'bg-blue-600 text-white font-medium'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700/50'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar Area */}
              <div className="p-5">
                {/* Header with Navigation and Compare Checkbox */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className={`p-1 rounded-md transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compare"
                      checked={compareToPrevious}
                      onChange={(e) => setCompareToPrevious(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="compare"
                      className={`text-sm cursor-pointer ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Compare to previous period
                    </label>
                  </div>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className={`p-1 rounded-md transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dual Calendars */}
                <div className="flex gap-10">
                  {renderCalendar(leftMonth, leftCalendarDays)}
                  {renderCalendar(rightMonth, rightCalendarDays)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface BranchReportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  branchData: {
    branch: string;
    todaySales: number;
    yesterdaySales: number;
    forecastNextDay: number;
    dayChange: number;
    thisMonthSales: number;
    lastMonthSales: number;
    forecastNextMonth: number;
    monthChange: number;
    thisYearSales: number;
    lastYearSales: number;
    forecastNextYear: number;
    yearChange: number;
  } | null;
  isDark?: boolean;
}

export function BranchReportWidget({ isOpen, onClose, branchData, isDark }: BranchReportWidgetProps) {
  const [showDetails, setShowDetails] = useState(true); // Start with details view
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState([false, false, false]);
  const [animateFlags, setAnimateFlags] = useState(false);

  // Auto-toggle between details and chart every 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setShowDetails((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle modal visibility with staggered card animations
  useEffect(() => {
    if (isOpen) {
      setShowDetails(true); // Start with data view
      setTimeout(() => setIsVisible(true), 10);
      
      // Stagger card animations
      setTimeout(() => setAnimateCards([true, false, false]), 150);
      setTimeout(() => setAnimateCards([true, true, false]), 250);
      setTimeout(() => setAnimateCards([true, true, true]), 350);
      setTimeout(() => setAnimateFlags(true), 500);
    } else {
      setIsVisible(false);
      setAnimateCards([false, false, false]);
      setAnimateFlags(false);
    }
  }, [isOpen]);

  // Close handler with animation
  const handleClose = () => {
    setAnimateFlags(false);
    setAnimateCards([false, false, false]);
    setIsVisible(false);
    setTimeout(() => onClose(), 400);
  };

  if (!isOpen || !branchData) return null;

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Determine flags based on change percentage
  const monthFlag = (branchData.monthChange ?? 0) < 10 ? 'Red' : 'Green';
  const yearFlag = (branchData.yearChange ?? 0) < 5 ? 'Red' : 'Green';

  // Simple Circular Chart with animation
  const CircularChart = ({ percentage, label, color }: { percentage: number | undefined | null; label: string; color: string }) => {
    const safePercentage = percentage ?? 0;
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (Math.abs(safePercentage) / 100) * circumference;

    const colorMap: Record<string, string> = {
      purple: '#9333ea',
      pink: '#ec4899',
      cyan: '#06b6d4',
    };

    return (
      <div className="relative inline-flex items-center justify-center animate-in fade-in zoom-in duration-700">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity="0.3"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold mb-1 transition-all duration-500`} style={{ color: colorMap[color] }}>
            {label}
          </span>
          <span className="text-2xl font-bold text-gray-700 transition-all duration-500">
            {safePercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  // Data Row Component with animation
  const DataRow = ({ label, value, isHighlight = false, delay = 0 }: { label: string; value: string; isHighlight?: boolean; delay?: number }) => (
    <div 
      className="flex items-center justify-between py-2 transition-all duration-500 hover:bg-gray-50 rounded-lg px-2 -mx-2"
      style={{ 
        animation: `slideInRight 0.4s ease-out ${delay}ms both`,
      }}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold transition-colors duration-300 ${isHighlight ? 'text-gray-900' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );

  // Change Badge Component with animation
  const ChangeBadge = ({ percentage, delay = 0 }: { percentage: number | undefined | null; delay?: number }) => {
    const safePercentage = percentage ?? 0;
    const isProfit = safePercentage >= 0;
    return (
      <div 
        className="flex items-center justify-between py-2"
        style={{ 
          animation: `slideInRight 0.4s ease-out ${delay}ms both, pulse 2s ease-in-out infinite`,
        }}
      >
        <span className="text-sm text-gray-500">% Change</span>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${
          isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          <span>{safePercentage.toFixed(2)}% {isProfit ? 'Profit' : 'Loss'}</span>
          {isProfit ? (
            <TrendingUp className="w-4 h-4 animate-bounce" />
          ) : (
            <TrendingDown className="w-4 h-4 animate-bounce" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-6xl bg-gray-50 rounded-2xl shadow-2xl transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Icon */}
          <div className="bg-white px-8 py-5 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Branch Report</h2>
              <p className="text-sm text-gray-500 mt-1">Detailed sales analysis and forecasting</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95 group"
            >
              <X className="w-6 h-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
            </button>
          </div>

          {/* Body - Compact */}
          <div className="p-6">
            {/* Three Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Day Wise Summary */}
              <div 
                className={`bg-white rounded-xl shadow-sm p-5 min-h-[340px] relative overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  animateCards[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                  Day Wise Summary
                </h3>
                
                {/* Chart View */}
                <div
                  className={`absolute left-5 right-5 top-16 flex items-center justify-center transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-0 scale-75 rotate-180 pointer-events-none'
                      : 'opacity-100 scale-100 rotate-0'
                  }`}
                >
                  <CircularChart percentage={branchData.dayChange} label="Sales" color="purple" />
                </div>

                {/* Details View */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <DataRow label="Branch" value={branchData.branch} isHighlight delay={0} />
                    <DataRow label="Today's Sales" value={formatNumber(branchData.todaySales)} delay={50} />
                    <DataRow label="Yesterday's Sales" value={formatNumber(branchData.yesterdaySales)} delay={100} />
                    <DataRow label="Forecast Next Day" value={formatNumber(branchData.forecastNextDay)} delay={150} />
                    <div className="pt-2">
                      <ChangeBadge percentage={branchData.dayChange} delay={200} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Month Wise Summary */}
              <div 
                className={`bg-white rounded-xl shadow-sm p-5 min-h-[340px] relative overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  animateCards[1] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></div>
                  Month Wise Summary
                </h3>
                
                {/* Chart View */}
                <div
                  className={`absolute left-5 right-5 top-16 flex items-center justify-center transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-0 scale-75 rotate-180 pointer-events-none'
                      : 'opacity-100 scale-100 rotate-0'
                  }`}
                >
                  <CircularChart percentage={branchData.monthChange} label="Sales" color="pink" />
                </div>

                {/* Details View */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <DataRow label="Branch" value={branchData.branch} isHighlight delay={0} />
                    <DataRow label="This Month Sales" value={formatNumber(branchData.thisMonthSales)} delay={50} />
                    <DataRow label="Last Month Sales" value={formatNumber(branchData.lastMonthSales)} delay={100} />
                    <DataRow label="Forecast Next Month" value={formatNumber(branchData.forecastNextMonth)} delay={150} />
                    <div className="pt-2">
                      <ChangeBadge percentage={branchData.monthChange} delay={200} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Year Wise Summary */}
              <div 
                className={`bg-white rounded-xl shadow-sm p-5 min-h-[340px] relative overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  animateCards[2] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
                  Year Wise Summary
                </h3>
                
                {/* Chart View */}
                <div
                  className={`absolute left-5 right-5 top-16 flex items-center justify-center transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-0 scale-75 rotate-180 pointer-events-none'
                      : 'opacity-100 scale-100 rotate-0'
                  }`}
                >
                  <CircularChart percentage={branchData.yearChange} label="Sales" color="cyan" />
                </div>

                {/* Details View */}
                <div
                  className={`transition-all duration-700 ease-out ${
                    showDetails
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                >
                  <div className="space-y-1">
                    <DataRow label="Branch" value={branchData.branch} isHighlight delay={0} />
                    <DataRow label="This Year Sales" value={formatNumber(branchData.thisYearSales)} delay={50} />
                    <DataRow label="Last Year Sales" value={formatNumber(branchData.lastYearSales)} delay={100} />
                    <DataRow label="Forecast Next Year" value={formatNumber(branchData.forecastNextYear)} delay={150} />
                    <div className="pt-2">
                      <ChangeBadge percentage={branchData.yearChange} delay={200} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flags Card - Compact */}
            <div 
              className={`bg-white rounded-xl shadow-sm p-5 max-w-sm transition-all duration-500 hover:shadow-lg ${
                animateFlags ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ animation: animateFlags ? 'slideInUp 0.5s ease-out' : 'none' }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-3">Performance Flags</h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100 hover:scale-105">
                  <span className="text-xs font-medium text-gray-600 block mb-2">Month</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 ${
                    monthFlag === 'Red' 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                      : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  }`}>
                    {monthFlag}
                  </span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100 hover:scale-105">
                  <span className="text-xs font-medium text-gray-600 block mb-2">Year</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-110 ${
                    yearFlag === 'Red' 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                      : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  }`}>
                    {yearFlag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Eye } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  isDark: boolean;
  status?: 'good' | 'warning' | 'critical';
}

export function MetricCard({ title, value, change, trend, icon: Icon, isDark, status = 'good' }: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = trend === 'up';
  
  const statusColor = status === 'good' ? 'text-emerald-500' : status === 'warning' ? 'text-amber-500' : 'text-red-500';
  const statusBg = status === 'good' ? 'bg-emerald-500/10' : status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10';
  const statusGlow = status === 'good' ? 'from-emerald-500/20' : status === 'warning' ? 'from-amber-500/20' : 'from-red-500/20';

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border transition-all duration-500 cursor-pointer group ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } p-5 ${
        isHovered 
          ? 'shadow-2xl scale-105 -translate-y-2' 
          : 'shadow-sm hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${statusGlow} to-blue-500/5 rounded-full blur-3xl transition-all duration-700 ${
        isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
      }`} />
      
      {/* Shine Effect on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ${
        isHovered ? 'translate-x-full' : ''
      }`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {/* Icon with pulse animation */}
          <div className={`p-3 rounded-xl ${statusBg} transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'
          }`}>
            <Icon className={`w-6 h-6 ${statusColor} transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`} />
          </div>
          
          {/* Change Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-300 ${
            isPositive 
              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            {isPositive ? (
              <ArrowUpRight className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isHovered ? 'animate-bounce' : ''}`} />
            ) : (
              <ArrowDownRight className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${isHovered ? 'animate-bounce' : ''}`} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <h3 className={`text-3xl font-bold transition-all duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          } ${isHovered ? 'scale-110 translate-x-1' : 'scale-100'}`}>
            {value}
          </h3>
        </div>

        {/* ✅ REMOVED: Live Indicator - No longer needed */}

        {/* Progress Bar */}
        <div className={`mt-3 h-1 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isPositive ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ 
              width: isHovered ? `${Math.abs(change) * 3}%` : '0%',
              maxWidth: '100%'
            }}
          />
        </div>
      </div>

      {/* Border Glow on Hover */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
        isHovered ? `ring-2 ${isPositive ? 'ring-emerald-500/50' : 'ring-red-500/50'}` : ''
      }`} />
    </div>
  );
}
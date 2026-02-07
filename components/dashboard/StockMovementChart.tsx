'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface StockMovementChartProps {
  data: Array<{ date: string; movement: number }>;
  isDark: boolean;
}

export function StockMovementChart({ data, isDark }: StockMovementChartProps) {
  const [selectedCategories, setSelectedCategories] = useState({
    category1: true,
    category2: false,
    category3: false,
    category4: false,
  });

  const categories = [
    { id: 'category1', label: 'All Movement', color: '#ef4444' },
    { id: 'category2', label: 'Category A', color: '#3b82f6' },
    { id: 'category3', label: 'Category B', color: '#10b981' },
    { id: 'category4', label: 'Category C', color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      {/* Legend with checkboxes */}
      <div className="flex items-center gap-6 flex-wrap">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories[cat.id as keyof typeof selectedCategories]}
              onChange={() =>
                setSelectedCategories((prev) => ({
                  ...prev,
                  [cat.id]: !prev[cat.id as keyof typeof prev],
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span
                className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {cat.label}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMovement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#374151' : '#e5e7eb'}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
            }}
            labelStyle={{ color: isDark ? '#d1d5db' : '#374151' }}
          />
          {selectedCategories.category1 && (
            <Area
              type="monotone"
              dataKey="movement"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMovement)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

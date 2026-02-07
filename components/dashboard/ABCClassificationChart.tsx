'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ABCClassificationChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  isDark: boolean;
}

export function ABCClassificationChart({ data, isDark }: ABCClassificationChartProps) {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span
                className={`text-xs ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {item.name}
              </span>
            </div>
            <span
              className={`text-xs font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ReorderLevelChartProps {
  data: Array<{ name: string; value: number }>;
  isDark: boolean;
}

export function ReorderLevelChart({ data, isDark }: ReorderLevelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? '#374151' : '#e5e7eb'}
          horizontal={true}
          vertical={false}
        />
        <XAxis type="number" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}
          width={150}
        />
        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

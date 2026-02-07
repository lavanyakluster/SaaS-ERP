'use client';

interface SparklineChartProps {
  data: number[];
  color: string;
  height: number;
  isDark: boolean;
}

export function SparklineChart({ data, color, height, isDark }: SparklineChartProps) {
  const width = 100; // Use percentage width
  const padding = 2;
  
  const max = Math.max(...data.map(Math.abs));
  const min = Math.min(...data);
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (100 - padding * 2) + padding;
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
        {/* Grid Lines */}
        {[0, 0.5, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (height - padding * 2) * ratio}
            x2={100 - padding}
            y2={padding + (height - padding * 2) * ratio}
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Sparkline */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Data Points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * (100 - padding * 2) + padding;
          const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
    </div>
  );
}

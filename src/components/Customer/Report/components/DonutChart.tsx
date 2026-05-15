"use client";

import { useId } from "react";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
}

// Pure SVG donut chart — react-charts v3 beta ไม่มี pie/donut native
// ใช้ stroke-dasharray บน <circle> แต่ละชิ้น stack ต่อกัน
export const DonutChart = ({
  data,
  size = 200,
  thickness = 28,
  centerLabel,
  centerValue,
}: DonutChartProps) => {
  const titleId = useId();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return null;
  }

  let cumulative = 0;
  const segments = data.map((d) => {
    const length = (d.value / total) * circumference;
    const offset = -cumulative;
    cumulative += length;
    return {
      ...d,
      length,
      gap: circumference - length,
      offset,
    };
  });

  return (
    <div className="relative inline-flex">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>Donut chart</title>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={`${seg.label}-${i}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${seg.length} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabel && (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          )}
          {centerValue && (
            <span className="text-lg font-bold leading-tight">{centerValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";

interface GaugeChartProps {
  label: string;
  value: number;
  size?: number;
  color: string;
}

// SVG circular gauge (0-100). Color รับเป็น CSS var() string จาก utils
export const GaugeChart: React.FC<GaugeChartProps> = ({
  label,
  value,
  size = 80,
  color,
}) => {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const center = size / 2;
  const fontSize = size <= 64 ? "1rem" : "1.5rem";

  return (
    <div className="flex h-full flex-col items-center justify-center p-3 md:p-4">
      <div className="relative mb-1 inline-flex">
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="var(--muted)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ fontSize }}
        >
          {value}
        </div>
      </div>
      <p className="text-sm font-semibold md:text-base">{label}</p>
    </div>
  );
};

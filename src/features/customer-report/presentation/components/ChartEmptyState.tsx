"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartEmptyStateProps {
  message?: string;
  height?: string;
  className?: string;
}

// Placeholder when chart history < 2 records — shows faded mock curve + message
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = "ยังไม่มีข้อมูลเพียงพอสำหรับแสดงแนวโน้ม",
  height = "100%",
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-card",
        className,
      )}
      style={{ height }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg
          width="80%"
          height="60%"
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="25" x2="200" y2="25" stroke="var(--info)" strokeWidth="1" />
          <line x1="0" y1="50" x2="200" y2="50" stroke="var(--info)" strokeWidth="1" />
          <line x1="0" y1="75" x2="200" y2="75" stroke="var(--info)" strokeWidth="1" />
          <path
            d="M0 80 Q50 60 80 70 T120 40 T160 50 T200 20"
            stroke="var(--info)"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      <TrendingUp className="mb-2 size-12 text-muted-foreground" />
      <p className="px-4 text-center text-sm text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        ต้องมีข้อมูลอย่างน้อย 2 รายการ
      </p>
    </div>
  );
};

export default ChartEmptyState;

"use client";

import React from "react";
import type { Datum } from "react-charts";
import { cn } from "@/lib/utils";
import type { TimeSeriesDatum, ChartSeries } from "./Chart";

interface CustomTooltipProps {
  focusedDatum: Datum<TimeSeriesDatum> | null;
  formatValue?: (value: number, seriesId: string) => string;
}

const defaultFormat = (value: number, seriesId: string) => {
  if (seriesId.toLowerCase().includes("position")) {
    return value ? `#${value}` : "-";
  }
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

// react-charts tooltip — แสดงทุก series ใน tooltipGroup เดียวกัน
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  focusedDatum,
  formatValue,
}) => {
  if (!focusedDatum) return null;

  const formatter = formatValue ?? defaultFormat;
  const date = focusedDatum.primaryValue;
  const dateLabel =
    date instanceof Date
      ? date.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : String(date ?? "");

  const datums = focusedDatum.tooltipGroup ?? [focusedDatum];
  const entries = datums.map((d) => {
    const series = d.originalSeries as ChartSeries;
    return {
      label: d.seriesLabel ?? series.label,
      value: typeof d.secondaryValue === "number" ? d.secondaryValue : 0,
      color: series.color,
    };
  });

  return (
    <div
      className={cn(
        "pointer-events-none min-w-32 rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md",
      )}
    >
      <div className="mb-1 border-b border-border pb-1 text-xs font-bold">
        {dateLabel}
      </div>
      {entries.map((entry, index) => (
        <div
          key={`${entry.label}-${index}`}
          className={cn(
            "flex items-center justify-between gap-3",
            index > 0 && "mt-0.5",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.label}</span>
          </div>
          <span className="text-xs font-semibold">
            {formatter(entry.value, entry.label)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomTooltip;

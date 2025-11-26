// src/components/Customer/Report/components/CustomTooltip.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { CHART_COLORS } from "../lib/chartConfig";
import { formatChartDate } from "../lib/historyCalculations";

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
  payload?: { dateLabel?: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  formatValue?: (value: number, dataKey: string) => string;
}

/**
 * Custom tooltip component for Recharts
 * Displays date in Thai format and color-coded values
 */
export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatValue,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Format the date label
  const dateLabel: string = label
    ? formatChartDate(String(label))
    : payload[0]?.payload?.dateLabel ?? "";

  // Default value formatter
  const defaultFormatValue = (value: number, dataKey: string): string => {
    // Format position differently (lower is better)
    if (dataKey === "position") {
      return value ? `#${value}` : "-";
    }
    // Large numbers with K suffix
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatter = formatValue || defaultFormatValue;

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e2e8f0",
        minWidth: "140px",
      }}
    >
      {/* Date header */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "#374151",
          marginBottom: "8px",
          paddingBottom: "6px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {dateLabel}
      </Typography>

      {/* Values */}
      {payload.map((entry: TooltipPayloadEntry, index: number) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            marginTop: index > 0 ? "4px" : 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Color dot */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: entry.color || CHART_COLORS.primary,
              }}
            />
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              {entry.name}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {formatter(entry.value, entry.dataKey)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CustomTooltip;

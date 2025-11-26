// src/components/Customer/Report/components/ChartEmptyState.tsx
"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { ShowChart } from "@mui/icons-material";

interface ChartEmptyStateProps {
  message?: string;
  height?: string;
}

/**
 * Empty state placeholder for charts when there's insufficient data (< 2 records)
 * Shows a faded chart icon with a message to indicate where the chart will appear
 */
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = "ยังไม่มีข้อมูลเพียงพอสำหรับแสดงแนวโน้ม",
  height = "100%",
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 2,
        border: "1px dashed #e2e8f0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Faded chart placeholder background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.1,
        }}
      >
        {/* Mock chart lines */}
        <svg
          width="80%"
          height="60%"
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="25"
            x2="200"
            y2="25"
            stroke="#667eea"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="50"
            x2="200"
            y2="50"
            stroke="#667eea"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="75"
            x2="200"
            y2="75"
            stroke="#667eea"
            strokeWidth="1"
          />
          {/* Mock trend line */}
          <path
            d="M0 80 Q50 60 80 70 T120 40 T160 50 T200 20"
            stroke="#667eea"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </Box>

      {/* Icon and message */}
      <ShowChart
        sx={{
          fontSize: 48,
          color: "#94a3b8",
          mb: 1,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: "#64748b",
          textAlign: "center",
          px: 2,
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "#94a3b8",
          mt: 0.5,
        }}
      >
        ต้องมีข้อมูลอย่างน้อย 2 รายการ
      </Typography>
    </Box>
  );
};

export default ChartEmptyState;

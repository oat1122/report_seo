// src/components/Customer/Report/components/MetricChangeIndicator.tsx
import React from "react";
import { Paper, Box, Typography, Chip } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  FiberNew,
} from "@mui/icons-material";
import { TrafficChangeData } from "../lib/historyCalculations";

interface MetricChangeIndicatorProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  changeData: TrafficChangeData;
  color?: string;
}

export const MetricChangeIndicator: React.FC<MetricChangeIndicatorProps> = ({
  icon,
  label,
  value,
  changeData,
  color,
}) => {
  const { percentage, trend, hasHistory } = changeData;

  // Get colors and icons based on trend
  const getTrendStyle = () => {
    switch (trend) {
      case "up":
        return {
          color: "#059669",
          bgcolor: "#d1fae5",
          icon: <TrendingUp sx={{ fontSize: 16 }} />,
        };
      case "down":
        return {
          color: "#dc2626",
          bgcolor: "#fee2e2",
          icon: <TrendingDown sx={{ fontSize: 16 }} />,
        };
      case "new":
        return {
          color: "#1e40af",
          bgcolor: "#dbeafe",
          icon: <FiberNew sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          color: "#64748b",
          bgcolor: "#f1f5f9",
          icon: <TrendingFlat sx={{ fontSize: 16 }} />,
        };
    }
  };

  const trendStyle = getTrendStyle();

  // Format percentage display
  const getPercentageDisplay = () => {
    if (trend === "new") {
      return "New";
    }
    if (!hasHistory) {
      return "No data";
    }
    const absPercentage = Math.abs(percentage);
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${absPercentage.toFixed(1)}%`;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        textAlign: "center",
        borderRadius: 3,
        height: "100%",
        position: "relative",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Icon */}
      <Box sx={{ color: color || "text.secondary", mb: 1 }}>{icon}</Box>

      {/* Main Value */}
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>

      {/* Label */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {/* Change Indicator */}
      {hasHistory && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            mt: 1,
          }}
        >
          <Chip
            icon={trendStyle.icon}
            label={getPercentageDisplay()}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: trendStyle.bgcolor,
              color: trendStyle.color,
              "& .MuiChip-icon": {
                color: trendStyle.color,
              },
            }}
          />
        </Box>
      )}

      {/* New Badge for new metrics */}
      {trend === "new" && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <Chip
            label="NEW"
            size="small"
            sx={{
              height: 18,
              fontSize: "0.6rem",
              bgcolor: "#3b82f6",
              color: "#fff",
              fontWeight: 700,
            }}
          />
        </Box>
      )}

      {/* Overflow indicator for extreme growth */}
      {percentage > 100 && trend === "up" && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            animation: "bounce 1s ease-in-out infinite",
            "@keyframes bounce": {
              "0%, 100%": {
                transform: "translateY(0)",
              },
              "50%": {
                transform: "translateY(-4px)",
              },
            },
          }}
        >
          <Typography sx={{ fontSize: 20 }}>🚀</Typography>
        </Box>
      )}
    </Paper>
  );
};

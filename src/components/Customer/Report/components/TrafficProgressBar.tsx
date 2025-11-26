// src/components/Customer/Report/components/TrafficProgressBar.tsx
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  FiberNew,
  TrendingFlat,
} from "@mui/icons-material";
import { TrafficChangeData } from "../lib/historyCalculations";

interface TrafficProgressBarProps {
  changeData: TrafficChangeData;
}

// Shimmer keyframes animation
const shimmerAnimation = `
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;

export const TrafficProgressBar: React.FC<TrafficProgressBarProps> = ({
  changeData,
}) => {
  const { percentage, trend, hasHistory, currentValue } = changeData;

  // Determine colors based on trend
  const getColors = () => {
    if (trend === "new") {
      return {
        base: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
        text: "#3b82f6",
      };
    }
    if (trend === "up") {
      return {
        base: "linear-gradient(90deg, #31fb4c 0%, #00d4aa 100%)",
        text: "#059669",
      };
    }
    if (trend === "down") {
      return {
        base: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
        text: "#dc2626",
      };
    }
    return {
      base: "linear-gradient(90deg, #94a3b8 0%, #64748b 100%)",
      text: "#64748b",
    };
  };

  const colors = getColors();
  const absPercentage = Math.abs(percentage);
  const basePercentage = Math.min(absPercentage, 100);
  const overflowPercentage = Math.max(absPercentage - 100, 0);

  // Get icon based on trend
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp sx={{ fontSize: 14 }} />;
      case "down":
        return <TrendingDown sx={{ fontSize: 14 }} />;
      case "new":
        return <FiberNew sx={{ fontSize: 14 }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 14 }} />;
    }
  };

  // Display text for the change
  const getDisplayText = () => {
    if (trend === "new") {
      return "New";
    }
    if (!hasHistory) {
      return "-";
    }
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${absPercentage.toFixed(0)}%`;
  };

  return (
    <Box>
      {/* Inject shimmer animation styles */}
      <style>{shimmerAnimation}</style>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {currentValue.toLocaleString()}
        </Typography>

        {trend === "new" ? (
          <Chip
            label="New"
            size="small"
            icon={<FiberNew />}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: "#dbeafe",
              color: "#1e40af",
              fontWeight: 600,
              "& .MuiChip-icon": {
                fontSize: 14,
                color: "#1e40af",
              },
            }}
          />
        ) : (
          <Typography
            variant="caption"
            color={colors.text}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontWeight: 600,
            }}
          >
            {getTrendIcon()}
            {getDisplayText()}
          </Typography>
        )}
      </Box>

      {/* Progress Bar Container */}
      <Box
        sx={{
          position: "relative",
          height: 8,
          borderRadius: 4,
          bgcolor: "#E2E8F0",
          overflow: "visible",
        }}
      >
        {/* Base Bar (0-100%) */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${basePercentage}%`,
            borderRadius: 4,
            background: colors.base,
            transition: "width 0.6s ease-in-out",
            zIndex: 1,
          }}
        />

        {/* Overflow Bar (>100%) - Gold with Shimmer */}
        {overflowPercentage > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "100%",
              borderRadius: 4,
              background:
                "linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
              opacity: 0.7, // Subtle shimmer
              zIndex: 2,
              transition: "opacity 0.3s ease-in-out",
              "&:hover": {
                opacity: 0.85,
              },
            }}
          />
        )}

        {/* Overflow Indicator - Extends beyond bar for visual impact */}
        {overflowPercentage > 0 && (
          <Box
            sx={{
              position: "absolute",
              right: -4,
              top: -2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #FFD700 0%, #FFA500 70%, #FF8C00 100%)",
              boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
              zIndex: 3,
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.2)",
                  opacity: 0.8,
                },
              },
            }}
          />
        )}
      </Box>

      {/* Overflow percentage text (if > 100%) */}
      {overflowPercentage > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: "#FF8C00",
            fontWeight: 700,
            fontSize: "0.65rem",
            mt: 0.5,
            display: "block",
            textAlign: "right",
          }}
        >
          🏆 {absPercentage.toFixed(0)}% Growth!
        </Typography>
      )}
    </Box>
  );
};

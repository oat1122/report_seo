// src/components/Customer/Report/components/PeriodSelector.tsx
"use client";

import React from "react";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { PERIOD_OPTIONS, PeriodOption } from "../lib/chartConfig";

interface PeriodSelectorProps {
  value: PeriodOption;
  onChange: (period: PeriodOption) => void;
  size?: "small" | "medium";
}

/**
 * Toggle button group for selecting chart period (7D, 30D, 90D)
 * Uses MUI ToggleButtonGroup with consistent styling
 */
export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  size = "small",
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: PeriodOption | null
  ) => {
    // Don't allow deselecting (null)
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size={size}
        aria-label="period selection"
        sx={{
          "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "none",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
            "&.Mui-selected": {
              backgroundColor: "#667eea",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#5a67d8",
              },
            },
          },
          "& .MuiToggleButton-root:first-of-type": {
            borderRadius: "6px 0 0 6px",
          },
          "& .MuiToggleButton-root:last-of-type": {
            borderRadius: "0 6px 6px 0",
          },
        }}
      >
        {PERIOD_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default PeriodSelector;

"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PERIOD_OPTIONS, PeriodOption } from "../lib/chartConfig";

interface PeriodSelectorProps {
  value: PeriodOption;
  onChange: (period: PeriodOption) => void;
  size?: "sm" | "default";
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  size = "sm",
}) => {
  return (
    <ToggleGroup
      type="single"
      value={String(value)}
      onValueChange={(v) => v && onChange(Number(v) as PeriodOption)}
      size={size}
      variant="outline"
      aria-label="period selection"
    >
      {PERIOD_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={String(option.value)}
          className="data-[state=on]:bg-info data-[state=on]:text-info-foreground data-[state=on]:hover:bg-info/90"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default PeriodSelector;

"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrafficChangeData } from "../lib/historyCalculations";

interface MetricChangeIndicatorProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  changeData: TrafficChangeData;
  // hex string — backward-compat for OverallMetricsCard (Phase 6 will replace with iconClassName)
  color?: string;
  iconClassName?: string;
}

type Trend = TrafficChangeData["trend"];

const trendConfig: Record<
  Trend,
  { Icon: typeof TrendingUp; className: string }
> = {
  up: { Icon: TrendingUp, className: "bg-success/10 text-success" },
  down: { Icon: TrendingDown, className: "bg-destructive/10 text-destructive" },
  new: { Icon: Sparkles, className: "bg-info/10 text-info" },
  neutral: { Icon: Minus, className: "bg-muted text-muted-foreground" },
};

export const MetricChangeIndicator: React.FC<MetricChangeIndicatorProps> = ({
  icon,
  label,
  value,
  changeData,
  color,
  iconClassName,
}) => {
  const { percentage, trend, hasHistory } = changeData;
  const { Icon, className } = trendConfig[trend];

  const percentageText = (() => {
    if (trend === "new") return "New";
    if (!hasHistory) return "No data";
    const abs = Math.abs(percentage).toFixed(1);
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${abs}%`;
  })();

  return (
    <div className="relative h-full rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn("mb-1 text-muted-foreground", iconClassName)}
        style={color ? { color } : undefined}
      >
        {icon}
      </div>

      <p className="text-lg font-bold">{value}</p>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>

      {hasHistory && (
        <div className="mt-1 flex items-center justify-center">
          <Badge
            className={cn(
              "gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              className,
            )}
          >
            <Icon className="size-3" />
            {percentageText}
          </Badge>
        </div>
      )}

      {trend === "new" && (
        <Badge className="absolute top-2 right-2 bg-info text-info-foreground text-[0.6rem] font-bold">
          NEW
        </Badge>
      )}
    </div>
  );
};

"use client";

import { useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { buildChartConfig } from "../lib/buildChartConfig";
import {
  groupKeywordsByKd,
  type KdLevelString,
} from "../lib/historyCalculations";

interface KdItem {
  kd: KdLevelString | string;
}

interface KdDistributionDonutProps {
  keywords: KdItem[];
  title?: string;
  description?: string;
}

const KD_COLORS: Record<KdLevelString, string> = {
  HARD: "var(--destructive)",
  MEDIUM: "var(--warning)",
  EASY: "var(--success)",
};

const KD_LABELS: Record<KdLevelString, string> = {
  HARD: "ยาก",
  MEDIUM: "ปานกลาง",
  EASY: "ง่าย",
};

const chartConfig = buildChartConfig([
  { key: "HARD", label: KD_LABELS.HARD, color: KD_COLORS.HARD },
  { key: "MEDIUM", label: KD_LABELS.MEDIUM, color: KD_COLORS.MEDIUM },
  { key: "EASY", label: KD_LABELS.EASY, color: KD_COLORS.EASY },
]);

export const KdDistributionDonut = ({
  keywords,
  title = "KD Distribution",
  description = "ความยากของ keyword ปัจจุบัน",
}: KdDistributionDonutProps) => {
  const dist = useMemo(() => groupKeywordsByKd(keywords), [keywords]);
  const data = useMemo(
    () =>
      (["EASY", "MEDIUM", "HARD"] as KdLevelString[])
        .map((level) => ({
          name: level,
          label: KD_LABELS[level],
          value: dist[level],
          color: KD_COLORS[level],
        }))
        .filter((d) => d.value > 0),
    [dist],
  );

  return (
    <div className="h-full rounded-2xl border border-border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div>
        {dist.total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            ยังไม่มี keyword
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[200px]"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name, item) => {
                      const payload = item.payload as { label: string };
                      const total = dist.total || 1;
                      const pct = ((Number(value) / total) * 100).toFixed(0);
                      return [`${value} (${pct}%)`, payload.label];
                    }}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      !("cx" in viewBox) ||
                      viewBox.cx == null ||
                      viewBox.cy == null
                    )
                      return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          dy="-0.4em"
                          className="fill-muted-foreground text-xs"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy="1.4em"
                          className="fill-foreground text-lg font-bold"
                        >
                          {dist.total}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
};

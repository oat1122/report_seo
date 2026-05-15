"use client";

import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { buildChartConfig } from "../lib/buildChartConfig";
import { computeAuthorityRadar } from "../lib/historyCalculations";
import { useHistoryContext } from "../contexts/HistoryContext";
import { useReportFilters } from "../contexts/ReportFiltersContext";
import { ChartEmptyState } from "../components/ChartEmptyState";
import type { OverallMetricsForm } from "@/types/metrics";

interface DomainAuthorityRadarProps {
  metrics: OverallMetricsForm | null | undefined;
}

const chartConfig = buildChartConfig([
  { key: "current", label: "ปัจจุบัน", color: "var(--info)" },
  { key: "previous", label: "ก่อนหน้า", color: "var(--muted-foreground)" },
]);

// Radar 5 axes — Ahrefs-style domain health snapshot
export const DomainAuthorityRadar = ({ metrics }: DomainAuthorityRadarProps) => {
  const { metricsHistory } = useHistoryContext();
  const { period } = useReportFilters();

  const data = useMemo(() => {
    if (!metrics) return [];
    return computeAuthorityRadar(metrics, metricsHistory, period);
  }, [metrics, metricsHistory, period]);

  const hasPrevious = data.some((d) => d.previous !== null);

  if (!metrics || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Domain Authority</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartEmptyState message="ยังไม่มีข้อมูล Domain Metrics" height="280px" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Domain Authority</CardTitle>
        <p className="text-xs text-muted-foreground">
          5 มิติ — ปัจจุบัน vs {period} วันก่อน
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[360px]"
        >
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const payload = item.payload as {
                      axis: string;
                      rawCurrent: number;
                      rawPrevious: number | null;
                    };
                    const isCurrent = name === "current";
                    const raw = isCurrent ? payload.rawCurrent : payload.rawPrevious;
                    const label = isCurrent ? "ปัจจุบัน" : "ก่อนหน้า";
                    return [
                      `${payload.axis}: ${raw ?? "—"} (score ${Number(value).toFixed(0)}/100)`,
                      label,
                    ];
                  }}
                />
              }
            />
            {hasPrevious && (
              <Radar
                name="previous"
                dataKey="previous"
                stroke="var(--color-previous)"
                strokeDasharray="4 4"
                fill="var(--color-previous)"
                fillOpacity={0.05}
                strokeWidth={1.5}
              />
            )}
            <Radar
              name="current"
              dataKey="current"
              stroke="var(--color-current)"
              fill="var(--color-current)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

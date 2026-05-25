"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useHistoryContext } from "./contexts/HistoryContext";
import { useReportFilters } from "./contexts/ReportFiltersContext";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { MiniSparkline } from "./components/MiniSparkline";
import { AnomalyDot } from "./components/AnomalyDot";
import {
  DOMAIN_METRICS_SERIES,
  MetricSeriesConfig,
} from "./lib/chartConfig";
import { buildChartConfig } from "./lib/buildChartConfig";
import {
  computeAnomalies,
  deduplicateByDay,
  downsampleWide,
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from "./lib/historyCalculations";
import type { OverallMetricsHistory } from "@/types/history";

interface TrendChartsSectionProps {
  title?: string;
}

const formatVolumeValue = (val: number | null | undefined): string => {
  if (val == null) return "";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
};

const fmtDateTick = (ms: number) =>
  new Date(ms).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
  });

const fmtDateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const pickMetricValue = (
  record: OverallMetricsHistory,
  key: string,
): number => Number(record[key as keyof OverallMetricsHistory] ?? 0);

interface WideRow {
  dateMs: number;
  [key: string]: number | boolean;
}

export const TrendChartsSection: React.FC<TrendChartsSectionProps> = ({
  title = "แนวโน้ม Domain Metrics",
}) => {
  const { metricsHistory, isLoading } = useHistoryContext();
  const { period } = useReportFilters();

  const [visibleSeries, setVisibleSeries] = React.useState<Set<string>>(() => {
    const defaults = new Set<string>();
    DOMAIN_METRICS_SERIES.forEach((s) => {
      if (s.defaultVisible) defaults.add(s.dataKey);
    });
    return defaults;
  });

  const filteredHistory = useMemo(() => {
    const byPeriod = filterHistoryByPeriod(metricsHistory, period);
    const deduped = deduplicateByDay(byPeriod);
    if (deduped.length < 3 && metricsHistory.length >= 3) {
      const all = [...metricsHistory].sort(
        (a, b) =>
          new Date(a.dateRecorded).getTime() -
          new Date(b.dateRecorded).getTime(),
      );
      return deduplicateByDay(all);
    }
    return deduped;
  }, [metricsHistory, period]);

  const hasData = hasEnoughDataForChart(filteredHistory.length);

  // Wide-format rows: 1 row ต่อ timestamp + column per series + anomaly flag
  const chartData = useMemo<WideRow[]>(() => {
    const visible = DOMAIN_METRICS_SERIES.filter((s) =>
      visibleSeries.has(s.dataKey),
    );
    const valuesByKey: Record<string, number[]> = {};
    visible.forEach((s) => {
      valuesByKey[s.dataKey] = filteredHistory.map((r) =>
        pickMetricValue(r, s.dataKey),
      );
    });
    const anomalyByKey: Record<string, boolean[]> = {};
    visible.forEach((s) => {
      anomalyByKey[s.dataKey] = computeAnomalies(valuesByKey[s.dataKey]);
    });

    const rows: WideRow[] = filteredHistory.map((r, idx) => {
      const row: WideRow = { dateMs: new Date(r.dateRecorded).getTime() };
      visible.forEach((s) => {
        row[s.dataKey] = valuesByKey[s.dataKey][idx];
        row[`${s.dataKey}__anomaly`] = anomalyByKey[s.dataKey][idx];
      });
      return row;
    });
    return downsampleWide(rows, 60);
  }, [filteredHistory, visibleSeries]);

  const visibleConfigs = useMemo(
    () =>
      DOMAIN_METRICS_SERIES.filter((s) => visibleSeries.has(s.dataKey)),
    [visibleSeries],
  );

  const chartConfig = useMemo(
    () =>
      buildChartConfig(
        visibleConfigs.map((s) => ({
          key: s.dataKey,
          label: s.name,
          color: s.color,
        })),
      ),
    [visibleConfigs],
  );

  const { hasScoreAxis, hasVolumeAxis } = useMemo(() => {
    let hasScore = false;
    let hasVolume = false;
    visibleConfigs.forEach((s) => {
      if (s.axisType === "score") hasScore = true;
      if (s.axisType === "volume") hasVolume = true;
    });
    return { hasScoreAxis: hasScore, hasVolumeAxis: hasVolume };
  }, [visibleConfigs]);

  // Mini-sparkline strip: metrics ที่ off chart
  const offSeries = useMemo(() => {
    return DOMAIN_METRICS_SERIES.filter(
      (s) => !visibleSeries.has(s.dataKey),
    ).map((s) => {
      const values = filteredHistory.map((r) => pickMetricValue(r, s.dataKey));
      const latest = values.length > 0 ? values[values.length - 1] : 0;
      return { config: s, values, latest };
    });
  }, [filteredHistory, visibleSeries]);

  const flatLineMessage = useMemo(() => {
    if (filteredHistory.length < 2 || visibleConfigs.length === 0) return null;
    const allFlat = visibleConfigs.every((s) => {
      const values = filteredHistory.map((r) => pickMetricValue(r, s.dataKey));
      const first = values[0];
      return values.every((v) => v === first);
    });
    return allFlat
      ? `ไม่มีการเปลี่ยนแปลงในช่วง ${period} วันที่ผ่านมา`
      : null;
  }, [filteredHistory, visibleConfigs, period]);

  const toggleSeries = (dataKey: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        if (next.size > 1) next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border p-6">
        <Loader2 className="size-4 animate-spin text-info" />
        <span>กำลังโหลดข้อมูลแนวโน้ม...</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      {/* Mini-sparkline strip — กดเพื่อ toggle metric ขึ้น chart */}
      {offSeries.length > 0 && hasData && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {offSeries.map(({ config, values, latest }) => (
            <button
              key={config.dataKey}
              type="button"
              onClick={() => toggleSeries(config.dataKey)}
              className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-2 text-left transition-colors hover:bg-muted"
              aria-label={`เพิ่ม ${config.name} ในกราฟ`}
            >
              <span className="text-[0.7rem] font-medium text-muted-foreground">
                {config.name}
              </span>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-bold tabular-nums">
                  {config.axisType === "volume"
                    ? formatVolumeValue(latest)
                    : latest}
                  {config.unit ?? ""}
                </span>
                <MiniSparkline
                  data={values}
                  color={config.color}
                  width={56}
                  height={20}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active series chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {visibleConfigs.map((series: MetricSeriesConfig) => (
          <button
            key={series.dataKey}
            type="button"
            onClick={() => toggleSeries(series.dataKey)}
            className="rounded-full px-3 py-1 text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: series.color }}
            aria-label={`ซ่อน ${series.name}`}
          >
            {series.name} ×
          </button>
        ))}
      </div>

      {/* Axis legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {hasScoreAxis && (
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-success/70" />
            <span className="font-medium text-muted-foreground">
              Score (0-100) — แกนซ้าย
            </span>
          </div>
        )}
        {hasVolumeAxis && (
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-secondary/70" />
            <span className="font-medium text-muted-foreground">
              Volume — แกนขวา
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <ChartEmptyState height="320px" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="dateMs"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={fmtDateTick}
              stroke="var(--muted-foreground)"
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            {hasScoreAxis && (
              <YAxis
                yAxisId="score"
                orientation="left"
                domain={[0, 100]}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
            )}
            {hasVolumeAxis && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                domain={[0, "auto"]}
                tickFormatter={formatVolumeValue}
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 11 }}
              />
            )}
            <ChartTooltip
              cursor={{
                stroke: "var(--muted-foreground)",
                strokeDasharray: "3 3",
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) => {
                    const ms = payload?.[0]?.payload?.dateMs;
                    return typeof ms === "number" ? fmtDateLabel(ms) : "";
                  }}
                  formatter={(value, name) => {
                    const config = visibleConfigs.find(
                      (s) => s.dataKey === name,
                    );
                    const formatted =
                      config?.axisType === "volume"
                        ? formatVolumeValue(Number(value))
                        : Number(value).toLocaleString();
                    return [`${formatted}${config?.unit ?? ""}`, config?.name];
                  }}
                />
              }
            />
            {visibleConfigs.map((s) => (
              <Line
                key={s.dataKey}
                yAxisId={s.axisType}
                type="monotone"
                dataKey={s.dataKey}
                stroke={`var(--color-${s.dataKey})`}
                strokeWidth={2}
                dot={<AnomalyDot dataKey={s.dataKey} />}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      )}

      {flatLineMessage && hasData && (
        <p className="mt-2 text-center text-xs italic text-muted-foreground">
          📊 {flatLineMessage}
        </p>
      )}

      <p className="mt-3 text-right text-xs text-muted-foreground">
        ข้อมูลจาก Database:{" "}
        <Badge variant="outline">{filteredHistory.length} รายการ</Badge>
      </p>
    </div>
  );
};

export default TrendChartsSection;

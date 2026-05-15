"use client";

import React, { useState, useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useHistoryContext } from "./contexts/HistoryContext";
import { PeriodSelector } from "./components/PeriodSelector";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { CustomTooltip } from "./components/CustomTooltip";
import {
  TimeSeriesChart,
  type ChartSeries,
  type TimeSeriesDatum,
} from "./components/Chart";
import {
  DEFAULT_PERIOD,
  PeriodOption,
  DOMAIN_METRICS_SERIES,
  MetricSeriesConfig,
} from "./lib/chartConfig";
import {
  filterHistoryByPeriod,
  hasEnoughDataForChart,
} from "./lib/historyCalculations";
import { cn } from "@/lib/utils";

interface TrendChartsSectionProps {
  title?: string;
}

const formatVolumeValue = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
};

export const TrendChartsSection: React.FC<TrendChartsSectionProps> = ({
  title = "แนวโน้ม Domain Metrics",
}) => {
  const { metricsHistory, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);

  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    DOMAIN_METRICS_SERIES.forEach((s) => {
      if (s.defaultVisible) defaults.add(s.dataKey);
    });
    return defaults;
  });

  // Filter history by period (ascending by date)
  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(metricsHistory, period),
    [metricsHistory, period],
  );

  const hasData = hasEnoughDataForChart(filteredHistory.length);

  // Build react-charts series from filtered history, only for visible metrics
  const chartSeries = useMemo<ChartSeries[]>(() => {
    return DOMAIN_METRICS_SERIES.filter((s) =>
      visibleSeries.has(s.dataKey),
    ).map((s) => ({
      label: s.name,
      color: s.color,
      secondaryAxisId: s.axisType,
      data: filteredHistory.map((record) => ({
        date: new Date(record.dateRecorded),
        value: Number(record[s.dataKey as keyof typeof record] ?? 0),
      })),
    }));
  }, [filteredHistory, visibleSeries]);

  const { hasScoreAxis, hasVolumeAxis } = useMemo(() => {
    let hasScore = false;
    let hasVolume = false;
    DOMAIN_METRICS_SERIES.forEach((s) => {
      if (visibleSeries.has(s.dataKey)) {
        if (s.axisType === "score") hasScore = true;
        if (s.axisType === "volume") hasVolume = true;
      }
    });
    return { hasScoreAxis: hasScore, hasVolumeAxis: hasVolume };
  }, [visibleSeries]);

  const secondaryAxes = useMemo<AxisOptions<TimeSeriesDatum>[]>(() => {
    const axes: AxisOptions<TimeSeriesDatum>[] = [];
    if (hasScoreAxis) {
      axes.push({
        id: "score",
        position: "left",
        scaleType: "linear",
        getValue: (d) => d.value,
        min: 0,
        max: 100,
        elementType: "line",
      });
    }
    if (hasVolumeAxis) {
      axes.push({
        id: "volume",
        position: "right",
        scaleType: "linear",
        getValue: (d) => d.value,
        min: 0,
        elementType: "line",
        formatters: { scale: formatVolumeValue },
      });
    }
    return axes;
  }, [hasScoreAxis, hasVolumeAxis]);

  // Flat-line detection
  const flatLineMessage = useMemo(() => {
    if (filteredHistory.length < 2) return null;
    const visibleList = DOMAIN_METRICS_SERIES.filter((s) =>
      visibleSeries.has(s.dataKey),
    );
    const allFlat = visibleList.every((s) => {
      const values = filteredHistory
        .map((r) => Number(r[s.dataKey as keyof typeof r] ?? 0))
        .filter((v): v is number => typeof v === "number");
      if (values.length < 2) return true;
      const first = values[0];
      return values.every((v) => v === first);
    });
    if (allFlat && visibleList.length > 0) {
      return `ไม่มีการเปลี่ยนแปลงในช่วง ${period} วันที่ผ่านมา`;
    }
    return null;
  }, [filteredHistory, visibleSeries, period]);

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
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Series toggle chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {DOMAIN_METRICS_SERIES.map((series: MetricSeriesConfig) => {
          const isVisible = visibleSeries.has(series.dataKey);
          return (
            <button
              key={series.dataKey}
              type="button"
              onClick={() => toggleSeries(series.dataKey)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                isVisible
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              style={isVisible ? { backgroundColor: series.color } : undefined}
            >
              {series.name}
            </button>
          );
        })}
      </div>

      {/* Axis legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {hasScoreAxis && (
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-success/70" />
            <span className="font-medium text-success">
              Score (0-100) — แกนซ้าย
            </span>
          </div>
        )}
        {hasVolumeAxis && (
          <div className="flex items-center gap-1">
            <span className="size-3 rounded-sm bg-secondary/70" />
            <span className="font-medium text-success">
              Volume — แกนขวา
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <ChartEmptyState height="320px" />
      ) : (
        <TimeSeriesChart
          series={chartSeries}
          secondaryAxes={secondaryAxes}
          height={400}
          tooltipRender={({ focusedDatum }) => (
            <CustomTooltip focusedDatum={focusedDatum} />
          )}
        />
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

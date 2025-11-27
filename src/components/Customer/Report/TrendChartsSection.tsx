// src/components/Customer/Report/TrendChartsSection.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHistoryContext } from "./contexts/HistoryContext";
import { PeriodSelector } from "./components/PeriodSelector";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { CustomTooltip } from "./components/CustomTooltip";
import {
  CHART_COLORS,
  DOMAIN_METRICS_CHART_PROPS,
  CHART_LAYOUT,
  DEFAULT_PERIOD,
  PeriodOption,
  DOMAIN_METRICS_SERIES,
  MetricSeriesConfig,
} from "./lib/chartConfig";
import {
  transformMetricsForRecharts,
  hasEnoughDataForChart,
  formatChartDate,
  MetricsChartDataPoint,
} from "./lib/historyCalculations";

interface TrendChartsSectionProps {
  title?: string;
}

// Color for Score axis (left) - uses healthScore color for visibility
const SCORE_AXIS_COLOR = CHART_COLORS.healthScore;
// Color for Volume axis (right) - uses traffic color for visibility
const VOLUME_AXIS_COLOR = CHART_COLORS.traffic;

/**
 * Container component for Domain Metrics trend chart
 * Displays a single combined line chart with toggle-able series
 * Users can show/hide different metrics using the legend chips
 *
 * Dual-axis design:
 * - Left axis (Score): 0-100 scale for domainRating, healthScore, spamScore
 * - Right axis (Volume): Dynamic scale for organicTraffic, organicKeywords, backlinks, refDomains
 */
export const TrendChartsSection: React.FC<TrendChartsSectionProps> = ({
  title = "แนวโน้ม Domain Metrics",
}) => {
  const { metricsHistory, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);

  // Initialize visible series from default config
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    DOMAIN_METRICS_SERIES.forEach((s) => {
      if (s.defaultVisible) defaults.add(s.dataKey);
    });
    return defaults;
  });

  // Transform data for charts
  const chartData = useMemo(() => {
    return transformMetricsForRecharts(metricsHistory, period);
  }, [metricsHistory, period]);

  const hasData = hasEnoughDataForChart(chartData.length);

  // Check for visible series by axis type
  const { hasScoreAxis, hasVolumeAxis } = useMemo(() => {
    let hasScore = false;
    let hasVolume = false;

    DOMAIN_METRICS_SERIES.forEach((series) => {
      if (visibleSeries.has(series.dataKey)) {
        if (series.axisType === "score") hasScore = true;
        if (series.axisType === "volume") hasVolume = true;
      }
    });

    return { hasScoreAxis: hasScore, hasVolumeAxis: hasVolume };
  }, [visibleSeries]);

  // Detect flat-line (no variance) in visible series
  const flatLineMessage = useMemo(() => {
    if (chartData.length < 2) return null;

    const visibleSeriesList = DOMAIN_METRICS_SERIES.filter((s) =>
      visibleSeries.has(s.dataKey)
    );

    // Check each visible series for variance
    const allFlat = visibleSeriesList.every((series) => {
      const values = chartData
        .map((point) => point[series.dataKey as keyof MetricsChartDataPoint])
        .filter((v): v is number => typeof v === "number");

      if (values.length < 2) return true;

      const firstValue = values[0];
      return values.every((v) => v === firstValue);
    });

    if (allFlat && visibleSeriesList.length > 0) {
      return `ไม่มีการเปลี่ยนแปลงในช่วง ${period} วันที่ผ่านมา`;
    }
    return null;
  }, [chartData, visibleSeries, period]);

  // Toggle series visibility
  const toggleSeries = (dataKey: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        // Prevent hiding all series
        if (next.size > 1) {
          next.delete(dataKey);
        }
      } else {
        next.add(dataKey);
      }
      return next;
    });
  };

  // Format large numbers for volume axis (K, M)
  const formatVolumeValue = (val: number): string => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  if (isLoading) {
    return (
      <Paper
        sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
        elevation={0}
      >
        <Typography>กำลังโหลดข้อมูลแนวโน้ม...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
      elevation={0}
    >
      {/* Header with title and period selector */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <PeriodSelector value={period} onChange={setPeriod} />
      </Box>

      {/* Series Toggle Chips with axis type indicators */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 3,
        }}
      >
        {DOMAIN_METRICS_SERIES.map((series: MetricSeriesConfig) => {
          const isVisible = visibleSeries.has(series.dataKey);
          return (
            <Chip
              key={series.dataKey}
              label={series.name}
              onClick={() => toggleSeries(series.dataKey)}
              sx={{
                backgroundColor: isVisible ? series.color : "#e2e8f0",
                color: isVisible ? "#ffffff" : "#64748b",
                fontWeight: 600,
                fontSize: "0.75rem",
                "&:hover": {
                  backgroundColor: isVisible ? series.color : "#cbd5e1",
                  opacity: isVisible ? 0.9 : 1,
                },
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              size="small"
            />
          );
        })}
      </Box>

      {/* Axis Legend Indicator */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {hasScoreAxis && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                backgroundColor: SCORE_AXIS_COLOR,
                opacity: 0.7,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: SCORE_AXIS_COLOR, fontWeight: 500 }}
            >
              Score (0-100) - แกนซ้าย
            </Typography>
          </Box>
        )}
        {hasVolumeAxis && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                backgroundColor: VOLUME_AXIS_COLOR,
                opacity: 0.7,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: VOLUME_AXIS_COLOR, fontWeight: 500 }}
            >
              Volume - แกนขวา
            </Typography>
          </Box>
        )}
      </Box>

      {!hasData ? (
        <Box sx={{ height: 400 }}>
          <ChartEmptyState />
        </Box>
      ) : (
        <Box className={CHART_LAYOUT.containerHeight}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} {...DOMAIN_METRICS_CHART_PROPS}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={CHART_COLORS.grid}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                tickFormatter={(val) => formatChartDate(val)}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={{ stroke: CHART_COLORS.grid }}
              />
              {/* Left Y-axis: Score metrics (0-100) - color-coded */}
              <YAxis
                yAxisId="score"
                orientation="left"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: SCORE_AXIS_COLOR }}
                axisLine={{ stroke: SCORE_AXIS_COLOR, strokeOpacity: 0.5 }}
                tickLine={{ stroke: SCORE_AXIS_COLOR, strokeOpacity: 0.5 }}
                width={45}
                hide={!hasScoreAxis}
              />
              {/* Right Y-axis: Volume metrics (dynamic) - color-coded */}
              <YAxis
                yAxisId="volume"
                orientation="right"
                tick={{ fontSize: 11, fill: VOLUME_AXIS_COLOR }}
                axisLine={{ stroke: VOLUME_AXIS_COLOR, strokeOpacity: 0.5 }}
                tickLine={{ stroke: VOLUME_AXIS_COLOR, strokeOpacity: 0.5 }}
                tickFormatter={formatVolumeValue}
                width={55}
                hide={!hasVolumeAxis}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
              />

              {/* Render visible series dynamically based on axisType */}
              {DOMAIN_METRICS_SERIES.map((series) => {
                if (!visibleSeries.has(series.dataKey)) return null;
                return (
                  <Line
                    key={series.dataKey}
                    yAxisId={series.axisType}
                    type="monotone"
                    dataKey={series.dataKey}
                    name={series.name}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: series.color }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Flat-line detection message */}
      {flatLineMessage && hasData && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1,
            color: CHART_COLORS.text,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          📊 {flatLineMessage}
        </Typography>
      )}

      {/* Data source info */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          color: CHART_COLORS.text,
          textAlign: "right",
        }}
      >
        ข้อมูลจาก Database: {chartData.length} รายการ
      </Typography>
    </Paper>
  );
};

export default TrendChartsSection;

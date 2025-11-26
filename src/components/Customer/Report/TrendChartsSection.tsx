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
  Legend,
} from "recharts";
import { useHistoryContext } from "./contexts/HistoryContext";
import { PeriodSelector } from "./components/PeriodSelector";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { CustomTooltip } from "./components/CustomTooltip";
import {
  CHART_COLORS,
  COMMON_CHART_PROPS,
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
} from "./lib/historyCalculations";

interface TrendChartsSectionProps {
  title?: string;
}

/**
 * Container component for Domain Metrics trend chart
 * Displays a single combined line chart with toggle-able series
 * Users can show/hide different metrics using the legend chips
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

      {/* Series Toggle Chips */}
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

      {!hasData ? (
        <Box sx={{ height: 400 }}>
          <ChartEmptyState />
        </Box>
      ) : (
        <Box className={CHART_LAYOUT.containerHeight}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} {...COMMON_CHART_PROPS}>
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
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={{ stroke: CHART_COLORS.grid }}
                width={50}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tickLine={{ stroke: CHART_COLORS.grid }}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
              />

              {/* Render visible series dynamically */}
              {DOMAIN_METRICS_SERIES.map((series, index) => {
                if (!visibleSeries.has(series.dataKey)) return null;
                return (
                  <Line
                    key={series.dataKey}
                    yAxisId={index < 3 ? "left" : "right"}
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

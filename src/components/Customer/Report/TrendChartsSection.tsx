// src/components/Customer/Report/TrendChartsSection.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
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
  COMMON_CHART_PROPS,
  CHART_LAYOUT,
  DEFAULT_PERIOD,
  PeriodOption,
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
 * Container component for Domain Metrics trend charts
 * Displays 3 synchronized line charts:
 * 1. Health & Rating (Domain Rating, Health Score)
 * 2. Traffic & Keywords (Organic Traffic, Organic Keywords)
 * 3. Authority (Backlinks, Ref. Domains)
 */
export const TrendChartsSection: React.FC<TrendChartsSectionProps> = ({
  title = "แนวโน้มประวัติข้อมูล",
}) => {
  const { metricsHistory, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);

  // Transform data for charts
  const chartData = useMemo(() => {
    return transformMetricsForRecharts(metricsHistory, period);
  }, [metricsHistory, period]);

  const hasData = hasEnoughDataForChart(chartData.length);

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
      {/* Header with period selector */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <PeriodSelector value={period} onChange={setPeriod} />
      </Box>

      {!hasData ? (
        <Box sx={{ height: 400 }}>
          <ChartEmptyState />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Chart 1: Health & Rating */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              Health & Rating
            </Typography>
            <Box className={CHART_LAYOUT.containerHeight}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} {...COMMON_CHART_PROPS}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={CHART_COLORS.grid}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="domainRating"
                    name="Domain Rating"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    name="Health Score"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Chart 2: Traffic & Keywords */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              Traffic & Keywords
            </Typography>
            <Box className={CHART_LAYOUT.containerHeight}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} {...COMMON_CHART_PROPS}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={CHART_COLORS.grid}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="organicTraffic"
                    name="Organic Traffic"
                    stroke={CHART_COLORS.traffic}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="organicKeywords"
                    name="Organic Keywords"
                    stroke={CHART_COLORS.keywords}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Chart 3: Backlinks & Ref. Domains (with X-axis) */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              Backlinks & Ref. Domains
            </Typography>
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
                    tick={{ fontSize: 12, fill: CHART_COLORS.text }}
                    tickFormatter={(val) => formatChartDate(val)}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={{ stroke: CHART_COLORS.grid }}
                  />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="backlinks"
                    name="Backlinks"
                    stroke={CHART_COLORS.backlinks}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="refDomains"
                    name="Ref. Domains"
                    stroke={CHART_COLORS.refDomains}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TrendChartsSection;

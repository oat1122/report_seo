// src/components/Customer/Report/KeywordTrendChart.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  transformKeywordForRecharts,
  getUniqueKeywords,
  hasEnoughDataForChart,
  formatChartDate,
} from "./lib/historyCalculations";

interface KeywordTrendChartProps {
  title?: string;
}

/**
 * Keyword trend chart component
 * Shows Position and Traffic trends for a selected keyword
 * Includes dropdown to select which keyword to display
 */
export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
  title = "แนวโน้ม Keyword",
}) => {
  const { keywordHistory, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");

  // Get list of available keywords
  const keywords = useMemo(() => {
    return getUniqueKeywords(keywordHistory);
  }, [keywordHistory]);

  // Auto-select first keyword if not selected
  React.useEffect(() => {
    if (keywords.length > 0 && !selectedKeyword) {
      setSelectedKeyword(keywords[0]);
    }
  }, [keywords, selectedKeyword]);

  // Transform data for selected keyword
  const chartData = useMemo(() => {
    if (!selectedKeyword) return [];
    return transformKeywordForRecharts(keywordHistory, selectedKeyword, period);
  }, [keywordHistory, selectedKeyword, period]);

  const hasData = hasEnoughDataForChart(chartData.length);

  const handleKeywordChange = (event: SelectChangeEvent<string>) => {
    setSelectedKeyword(event.target.value);
  };

  // Custom formatter for position (inverted - lower is better)
  const formatPosition = (value: number): string => {
    return value ? `#${value}` : "-";
  };

  if (isLoading) {
    return (
      <Paper
        sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
        elevation={0}
      >
        <Typography>กำลังโหลดข้อมูล Keyword...</Typography>
      </Paper>
    );
  }

  // No keywords available
  if (keywords.length === 0) {
    return (
      <Paper
        sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
        elevation={0}
      >
        <Typography variant="h5" fontWeight={700} mb={2}>
          {title}
        </Typography>
        <Box sx={{ height: 300 }}>
          <ChartEmptyState message="ยังไม่มีประวัติ Keyword" />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}
      elevation={0}
    >
      {/* Header with keyword selector and period selector */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="keyword-select-label">Keyword</InputLabel>
            <Select
              labelId="keyword-select-label"
              value={selectedKeyword}
              label="Keyword"
              onChange={handleKeywordChange}
              sx={{
                "& .MuiSelect-select": {
                  fontSize: "0.875rem",
                },
              }}
            >
              {keywords.map((kw) => (
                <MenuItem key={kw} value={kw}>
                  {kw}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <PeriodSelector value={period} onChange={setPeriod} />
      </Box>

      {!hasData ? (
        <Box sx={{ height: 300 }}>
          <ChartEmptyState message={`ยังไม่มีข้อมูลเพียงพอสำหรับ "${selectedKeyword}"`} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Chart 1: Position Trend */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              Position Trend (อันดับ)
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
                  {/* Inverted Y-axis for position (1 at top, higher numbers at bottom) */}
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    reversed
                    hide
                  />
                  {/* Reference line at position 10 (first page threshold) */}
                  <ReferenceLine
                    y={10}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    label={{
                      value: "Top 10",
                      position: "right",
                      fontSize: 10,
                      fill: "#059669",
                    }}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        formatValue={(val, key) =>
                          key === "position" ? formatPosition(val) : val.toString()
                        }
                      />
                    }
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    name="Position"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Chart 2: Traffic Trend */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              Traffic Trend
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
                  <YAxis hide />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="traffic"
                    name="Traffic"
                    stroke={CHART_COLORS.traffic}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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

export default KeywordTrendChart;

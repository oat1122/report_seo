// src/components/Customer/Report/KeywordTrendChart.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip as MuiTooltip,
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
  MAX_SELECTED_KEYWORDS,
  POSITION_Y_AXIS_TICKS,
  getKeywordColor,
} from "./lib/chartConfig";
import {
  formatChartDate,
  transformMultiKeywordForRecharts,
  createKeywordDataKey,
} from "./lib/historyCalculations";

interface KeywordTrendChartProps {
  title?: string;
}

/**
 * Keyword trend chart component with multi-select capability
 * Shows Position and Traffic trends for up to 5 selected keywords
 * Uses Chip toggle pattern for keyword selection
 */
export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
  title = "แนวโน้ม Keyword",
}) => {
  const { keywordHistory, currentKeywords, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set()
  );

  // Get list of available keywords from currentKeywords (sorted by traffic)
  const sortedKeywords = useMemo(() => {
    // currentKeywords มาจาก API เรียงตาม traffic แล้ว
    return currentKeywords.map((k) => k.keyword);
  }, [currentKeywords]);

  // Create color map for all keywords (consistent colors)
  const keywordColorMap = useMemo(() => {
    const map = new Map<string, string>();
    sortedKeywords.forEach((keyword, index) => {
      map.set(keyword, getKeywordColor(index));
    });
    return map;
  }, [sortedKeywords]);

  // Auto-select first 3 keywords on load
  React.useEffect(() => {
    if (sortedKeywords.length > 0 && selectedKeywords.size === 0) {
      const initial = new Set(sortedKeywords.slice(0, 3));
      setSelectedKeywords(initial);
    }
  }, [sortedKeywords, selectedKeywords.size]);

  // Transform data for selected keywords (include current data)
  const chartData = useMemo(() => {
    if (selectedKeywords.size === 0) return [];
    return transformMultiKeywordForRecharts(
      keywordHistory,
      Array.from(selectedKeywords),
      period,
      currentKeywords // ส่ง currentKeywords เพื่อใช้เป็น data point ล่าสุด
    );
  }, [keywordHistory, selectedKeywords, period, currentKeywords]);

  const hasData = chartData.length >= 1; // แสดงกราฟเมื่อมีข้อมูลอย่างน้อย 1 จุด

  // Toggle keyword selection with max limit
  const toggleKeyword = useCallback((keyword: string) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) {
        // Allow deselecting if more than 1 selected
        if (next.size > 1) {
          next.delete(keyword);
        }
      } else {
        // Only add if under limit
        if (next.size < MAX_SELECTED_KEYWORDS) {
          next.add(keyword);
        }
      }
      return next;
    });
  }, []);

  // Custom formatter for position (inverted - lower is better)
  const formatPosition = (value: number): string => {
    return value ? `#${value}` : "-";
  };

  // Get Y-axis ticks that fall within the data range
  const getPositionTicks = useMemo(() => {
    if (chartData.length === 0) return [1, 10, 50, 100];

    // Find min and max positions across all selected keywords
    let minPos = Infinity;
    let maxPos = -Infinity;

    selectedKeywords.forEach((keyword) => {
      const dataKey = createKeywordDataKey(keyword, "position");
      chartData.forEach((point) => {
        const val = point[dataKey];
        if (typeof val === "number" && val !== null) {
          minPos = Math.min(minPos, val);
          maxPos = Math.max(maxPos, val);
        }
      });
    });

    if (minPos === Infinity) return [1, 10, 50, 100];

    // Filter ticks to show only relevant ones
    return POSITION_Y_AXIS_TICKS.filter(
      (tick) => tick >= minPos - 5 && tick <= maxPos + 10
    );
  }, [chartData, selectedKeywords]);

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
  if (sortedKeywords.length === 0) {
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

      {/* Horizontal Scrollable Keyword Chips */}
      <Box
        sx={{
          position: "relative",
          mb: 3,
          // Gradient fade on right edge
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "40px",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.9))",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            scrollbarWidth: "thin",
            pb: 1,
            pr: 5, // Padding for fade area
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "3px",
            },
          }}
        >
          {sortedKeywords.map((keyword) => {
            const isSelected = selectedKeywords.has(keyword);
            const color = keywordColorMap.get(keyword) || CHART_COLORS.primary;
            const isMaxReached =
              selectedKeywords.size >= MAX_SELECTED_KEYWORDS && !isSelected;

            return (
              <MuiTooltip
                key={keyword}
                title={
                  isMaxReached
                    ? `สูงสุด ${MAX_SELECTED_KEYWORDS} คำ กรุณายกเลิกคำอื่นก่อน`
                    : ""
                }
                arrow
              >
                <Chip
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* Color dot indicator */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: isSelected ? color : "#cbd5e1",
                          flexShrink: 0,
                        }}
                      />
                      <span>{keyword}</span>
                    </Box>
                  }
                  onClick={() => toggleKeyword(keyword)}
                  sx={{
                    backgroundColor: isSelected ? `${color}15` : "#f1f5f9",
                    border: `1.5px solid ${isSelected ? color : "#e2e8f0"}`,
                    color: isSelected ? color : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    cursor: isMaxReached ? "not-allowed" : "pointer",
                    opacity: isMaxReached ? 0.5 : 1,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? `${color}25`
                        : isMaxReached
                        ? "#f1f5f9"
                        : "#e2e8f0",
                    },
                  }}
                  size="small"
                />
              </MuiTooltip>
            );
          })}
        </Box>
      </Box>

      {/* Selection count indicator */}
      <Typography
        variant="caption"
        sx={{ color: CHART_COLORS.text, mb: 2, display: "block" }}
      >
        เลือก {selectedKeywords.size}/{MAX_SELECTED_KEYWORDS} คำ
      </Typography>

      {!hasData ? (
        <Box sx={{ height: 300 }}>
          <ChartEmptyState message="ยังไม่มีข้อมูลเพียงพอสำหรับ Keywords ที่เลือก" />
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
                    domain={["dataMin - 1", "dataMax + 1"]}
                    reversed
                    tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                    ticks={getPositionTicks}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={{ stroke: CHART_COLORS.grid }}
                    width={35}
                    tickFormatter={(val) => `#${val}`}
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
                          key?.includes("position")
                            ? formatPosition(val)
                            : val.toLocaleString()
                        }
                      />
                    }
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  {/* Render line for each selected keyword */}
                  {Array.from(selectedKeywords).map((keyword) => {
                    const color =
                      keywordColorMap.get(keyword) || CHART_COLORS.primary;
                    const dataKey = createKeywordDataKey(keyword, "position");
                    return (
                      <Line
                        key={dataKey}
                        type="monotone"
                        dataKey={dataKey}
                        name={keyword}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                        connectNulls
                      />
                    );
                  })}
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
                  <YAxis
                    tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={{ stroke: CHART_COLORS.grid }}
                    width={50}
                    tickFormatter={(val) => val.toLocaleString()}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        formatValue={(val) => val.toLocaleString()}
                      />
                    }
                    cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 2 }}
                  />
                  {/* Render line for each selected keyword */}
                  {Array.from(selectedKeywords).map((keyword) => {
                    const color =
                      keywordColorMap.get(keyword) || CHART_COLORS.primary;
                    const dataKey = createKeywordDataKey(keyword, "traffic");
                    return (
                      <Line
                        key={dataKey}
                        type="monotone"
                        dataKey={dataKey}
                        name={keyword}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
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

export default KeywordTrendChart;

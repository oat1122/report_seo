// src/components/Customer/Report/KeywordTrendChart.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Autocomplete,
  TextField,
  Checkbox,
} from "@mui/material";
import {
  CheckBoxOutlineBlank,
  CheckBox as CheckBoxIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useHistoryContext } from "./contexts/HistoryContext";
import { PeriodSelector } from "./components/PeriodSelector";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { CustomTooltip } from "./components/CustomTooltip";
import {
  CHART_COLORS,
  KEYWORD_CHART_PROPS,
  CHART_LAYOUT,
  DEFAULT_PERIOD,
  PeriodOption,
  MAX_SELECTED_KEYWORDS,
  POSITION_CLIP_THRESHOLD,
  getKeywordColor,
} from "./lib/chartConfig";
import {
  formatChartDate,
  transformMultiKeywordForRecharts,
  createKeywordDataKey,
} from "./lib/historyCalculations";

// Interface for keyword option in Autocomplete
interface KeywordOption {
  keyword: string;
  traffic: number;
  color: string;
}

// Interface for donut chart data
interface DonutDataItem {
  keyword: string;
  traffic: number;
  color: string;
  percentage: number;
  [key: string]: string | number; // Index signature for recharts compatibility
}

interface KeywordTrendChartProps {
  title?: string;
}

/**
 * Custom dot component for position line that shows real value when clipped
 * When position > POSITION_CLIP_THRESHOLD, displays a label with the actual value
 */
interface ClippedPositionDotProps {
  cx?: number;
  cy?: number;
  payload?: Record<string, unknown>;
  dataKey?: string;
  stroke?: string;
  realDataKey: string;
}

const ClippedPositionDot: React.FC<ClippedPositionDotProps> = ({
  cx,
  cy,
  payload,
  stroke,
  realDataKey,
}) => {
  if (cx === undefined || cy === undefined || !payload) return null;

  const realPosition = payload[realDataKey] as number | null;

  // Only show custom dot if position is clipped (exceeds threshold)
  if (!realPosition || realPosition <= POSITION_CLIP_THRESHOLD) {
    return null; // Use default dot behavior (none in our case)
  }

  // Render a small badge showing the real position at the clipped point
  return (
    <g>
      {/* Background pill */}
      <rect
        x={cx - 14}
        y={cy - 8}
        width={28}
        height={16}
        rx={8}
        fill={stroke || CHART_COLORS.primary}
        opacity={0.9}
      />
      {/* Position text */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill="#ffffff"
      >
        #{realPosition}
      </text>
    </g>
  );
};

/**
 * Keyword trend chart component with multi-select capability
 * Shows Position and Traffic trends for up to 5 selected keywords
 * Uses searchable Autocomplete dropdown with checkboxes for keyword selection
 * Combined dual-axis chart: Position (solid line) + Traffic (dashed line)
 */
export const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({
  title = "แนวโน้ม Keyword",
}) => {
  const { keywordHistory, currentKeywords, isLoading } = useHistoryContext();
  const [period, setPeriod] = useState<PeriodOption>(DEFAULT_PERIOD);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Build keyword options with traffic and color (sorted by traffic desc)
  const keywordOptions: KeywordOption[] = useMemo(() => {
    return currentKeywords.map((k, index) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      color: getKeywordColor(index),
    }));
  }, [currentKeywords]);

  // Create color map for all keywords (consistent colors based on sorted order)
  const keywordColorMap = useMemo(() => {
    const map = new Map<string, string>();
    keywordOptions.forEach((opt) => {
      map.set(opt.keyword, opt.color);
    });
    return map;
  }, [keywordOptions]);

  // Auto-select first 3 keywords on load (sorted by traffic)
  React.useEffect(() => {
    if (keywordOptions.length > 0 && selectedKeywords.length === 0) {
      const initial = keywordOptions.slice(0, 3).map((k) => k.keyword);
      setSelectedKeywords(initial);
    }
  }, [keywordOptions, selectedKeywords.length]);

  // Transform data for selected keywords (include current data)
  const chartData = useMemo(() => {
    if (selectedKeywords.length === 0) return [];
    return transformMultiKeywordForRecharts(
      keywordHistory,
      selectedKeywords,
      period,
      currentKeywords
    );
  }, [keywordHistory, selectedKeywords, period, currentKeywords]);

  const hasData = chartData.length >= 1;

  // Handle keyword selection change from Autocomplete
  const handleKeywordChange = useCallback(
    (_event: React.SyntheticEvent, newValue: KeywordOption[]) => {
      // Minimum 1 keyword must always be selected
      if (newValue.length === 0) return;
      setSelectedKeywords(newValue.map((k) => k.keyword));
    },
    []
  );

  // Get selected keyword options for Autocomplete value
  const selectedOptions = useMemo(() => {
    return keywordOptions.filter((opt) =>
      selectedKeywords.includes(opt.keyword)
    );
  }, [keywordOptions, selectedKeywords]);

  // Prepare data for Donut Chart
  const donutData: DonutDataItem[] = useMemo(() => {
    const selectedData = keywordOptions.filter((opt) =>
      selectedKeywords.includes(opt.keyword)
    );
    const total = selectedData.reduce((sum, k) => sum + k.traffic, 0);

    return selectedData.map((k) => ({
      keyword: k.keyword,
      traffic: k.traffic,
      color: k.color,
      percentage: total > 0 ? (k.traffic / total) * 100 : 0,
    }));
  }, [keywordOptions, selectedKeywords]);

  // Total traffic for center label
  const totalTraffic = useMemo(() => {
    return donutData.reduce((sum, d) => sum + d.traffic, 0);
  }, [donutData]);

  // Custom formatter for position (inverted - lower is better)
  const formatPosition = (value: number): string => {
    return value ? `#${value}` : "-";
  };

  // Fixed Y-axis ticks for Position (clipped at threshold)
  // Uses fixed domain [1, POSITION_CLIP_THRESHOLD] for consistent view
  const positionTicks = useMemo(() => {
    // Show key thresholds: 1, 5, 10, and the clip threshold (20)
    return [1, 5, 10, POSITION_CLIP_THRESHOLD];
  }, []);

  // Check if any position exceeds the clip threshold (for showing indicator)
  const hasClippedPositions = useMemo(() => {
    if (chartData.length === 0) return false;

    return selectedKeywords.some((keyword) => {
      const dataKey = createKeywordDataKey(keyword, "position");
      return chartData.some((point) => {
        const val = point[dataKey];
        return typeof val === "number" && val > POSITION_CLIP_THRESHOLD;
      });
    });
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
  if (keywordOptions.length === 0) {
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
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <PeriodSelector value={period} onChange={setPeriod} />
      </Box>

      {/* Searchable Keyword Dropdown with Checkboxes */}
      <Box sx={{ mb: 3, maxWidth: { xs: "100%", md: "60%", lg: "50%" } }}>
        <Autocomplete
          multiple
          id="keyword-selector"
          options={keywordOptions}
          disableCloseOnSelect
          getOptionLabel={(option) => option.keyword}
          getOptionDisabled={(option) =>
            // Disable if max reached and option is not already selected
            selectedKeywords.length >= MAX_SELECTED_KEYWORDS &&
            !selectedKeywords.includes(option.keyword)
          }
          value={selectedOptions}
          onChange={handleKeywordChange}
          isOptionEqualToValue={(option, value) =>
            option.keyword === value.keyword
          }
          renderOption={(props, option, { selected }) => {
            const { key, ...restProps } = props;
            return (
              <li key={key} {...restProps}>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {/* Color dot indicator */}
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: option.color,
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    flex: 1,
                    fontWeight: selected ? 600 : 400,
                    color: selected ? option.color : "inherit",
                  }}
                >
                  {option.keyword}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: CHART_COLORS.text, ml: "auto" }}
                >
                  {option.traffic.toLocaleString()} traffic
                </Typography>
              </li>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: option.color,
                        }}
                      />
                      <span>{option.keyword}</span>
                    </Box>
                  }
                  {...tagProps}
                  size="small"
                  sx={{
                    backgroundColor: `${option.color}15`,
                    border: `1.5px solid ${option.color}`,
                    color: option.color,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    "& .MuiChip-deleteIcon": {
                      color: option.color,
                      "&:hover": {
                        color: option.color,
                        opacity: 0.7,
                      },
                    },
                  }}
                  // Prevent delete if only 1 keyword left
                  onDelete={
                    selectedKeywords.length > 1 ? tagProps.onDelete : undefined
                  }
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={`เลือก Keywords (สูงสุด ${MAX_SELECTED_KEYWORDS} คำ)`}
              placeholder="ค้นหา keyword..."
              size="small"
            />
          )}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        {/* Selection count */}
        <Typography
          variant="caption"
          sx={{ color: CHART_COLORS.text, mt: 1, display: "block" }}
        >
          เลือก {selectedKeywords.length}/{MAX_SELECTED_KEYWORDS} คำ
        </Typography>
      </Box>

      {!hasData ? (
        <Box sx={{ height: 300 }}>
          <ChartEmptyState message="ยังไม่มีข้อมูลเพียงพอสำหรับ Keywords ที่เลือก" />
        </Box>
      ) : (
        /* Charts Container: Line Chart + Donut Chart */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Left: Line Chart */}
          <Box className={CHART_LAYOUT.cardBase}>
            {/* Legend indicator */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography className={CHART_LAYOUT.header} sx={{ mb: 0 }}>
                Position & Traffic Trend
              </Typography>
              <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 3,
                      backgroundColor: CHART_COLORS.primary,
                      borderRadius: 1,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: CHART_COLORS.text }}
                  >
                    Position (อันดับ)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 0,
                      borderTop: `2px dashed ${CHART_COLORS.primary}`,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: CHART_COLORS.text }}
                  >
                    Traffic
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} {...KEYWORD_CHART_PROPS}>
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
                  {/* Left Y-axis: Position (inverted - #1 at top, clipped at threshold) */}
                  <YAxis
                    yAxisId="position"
                    orientation="left"
                    domain={[1, POSITION_CLIP_THRESHOLD]}
                    reversed
                    tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                    ticks={positionTicks}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={{ stroke: CHART_COLORS.grid }}
                    width={40}
                    tickFormatter={(val) => `#${val}`}
                    label={{
                      value: "Position",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 11,
                      fill: CHART_COLORS.text,
                      offset: 10,
                    }}
                  />
                  {/* Right Y-axis: Traffic (normal) */}
                  <YAxis
                    yAxisId="traffic"
                    orientation="right"
                    tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={{ stroke: CHART_COLORS.grid }}
                    width={60}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val
                    }
                    label={{
                      value: "Traffic",
                      angle: 90,
                      position: "insideRight",
                      fontSize: 11,
                      fill: CHART_COLORS.text,
                      offset: 10,
                    }}
                  />
                  {/* Reference line at position 10 (first page threshold) */}
                  <ReferenceLine
                    yAxisId="position"
                    y={10}
                    stroke="#059669"
                    strokeDasharray="3 3"
                    label={{
                      value: "Top 10",
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "#059669",
                      offset: 5,
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

                  {/* Render lines for each selected keyword */}
                  {selectedKeywords.map((keyword) => {
                    const color =
                      keywordColorMap.get(keyword) || CHART_COLORS.primary;
                    const positionDataKey = createKeywordDataKey(
                      keyword,
                      "position"
                    );
                    // Real position data key for showing actual values when clipped
                    const positionRealDataKey = `${keyword.replace(
                      /\s+/g,
                      "_"
                    )}_position_real`;
                    const trafficDataKey = createKeywordDataKey(
                      keyword,
                      "traffic"
                    );

                    return (
                      <React.Fragment key={keyword}>
                        {/* Position Line (HERO - solid, thick) with clipped dot indicator */}
                        <Line
                          yAxisId="position"
                          type="monotone"
                          dataKey={positionDataKey}
                          name={`${keyword} (Position)`}
                          stroke={color}
                          strokeWidth={3}
                          dot={
                            <ClippedPositionDot
                              realDataKey={positionRealDataKey}
                              stroke={color}
                            />
                          }
                          activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                          connectNulls
                        />
                        {/* Traffic Line (SUPPORT - dashed, thinner, semi-transparent) */}
                        <Line
                          yAxisId="traffic"
                          type="monotone"
                          dataKey={trafficDataKey}
                          name={`${keyword} (Traffic)`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          strokeOpacity={0.6}
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                          connectNulls
                        />
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Keyword color legend */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mt: 2,
                pt: 2,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              {selectedKeywords.map((keyword) => {
                const color =
                  keywordColorMap.get(keyword) || CHART_COLORS.primary;
                return (
                  <Box
                    key={keyword}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: color }}
                    >
                      {keyword}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Right: Donut Chart - Traffic Share */}
          <Box className={CHART_LAYOUT.cardBase}>
            <Typography className={CHART_LAYOUT.header}>
              สัดส่วน Traffic
            </Typography>

            <Box sx={{ minHeight: 280, position: "relative" }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="traffic"
                    nameKey="keyword"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                        strokeWidth={0}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Traffic",
                    ]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      color: "#1e293b",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "8px 12px",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                    labelStyle={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "#64748b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label - Total Traffic */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", display: "block" }}
                >
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}
                >
                  {totalTraffic >= 1000
                    ? `${(totalTraffic / 1000).toFixed(1)}K`
                    : totalTraffic.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Donut Legend */}
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
              {donutData.map((item) => (
                <Box
                  key={item.keyword}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.75,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 500,
                        color: "#1e293b",
                        maxWidth: 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.keyword}
                    >
                      {item.keyword}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {item.traffic.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: item.color,
                        minWidth: 45,
                        textAlign: "right",
                      }}
                    >
                      {item.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
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

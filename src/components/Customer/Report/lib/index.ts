// src/components/Customer/Report/lib/index.ts
export { getKdColor } from "./utils";

// Chart configuration
export {
  CHART_COLORS,
  COMMON_CHART_PROPS,
  CHART_LAYOUT,
  PERIOD_OPTIONS,
  DEFAULT_PERIOD,
  METRICS_CHART_SERIES,
  TOOLTIP_STYLES,
} from "./chartConfig";
export type { PeriodOption } from "./chartConfig";

// History calculations and chart data transformations
export {
  calculatePercentageChange,
  determineTrend,
  calculateTrafficChange,
  calculateMetricChange,
  formatPercentage,
  filterHistoryByPeriod,
  formatChartDate,
  transformMetricsForRecharts,
  groupKeywordHistory,
  transformKeywordForRecharts,
  getUniqueKeywords,
  hasEnoughDataForChart,
} from "./historyCalculations";
export type {
  MetricTrend,
  TrafficChangeData,
  MetricsChartDataPoint,
  KeywordChartDataPoint,
} from "./historyCalculations";

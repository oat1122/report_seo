// src/components/Customer/Report/lib/historyCalculations.ts
import { KeywordReportHistory, OverallMetricsHistory } from "@/types/history";

// --- Types ---
export type MetricTrend = "up" | "down" | "neutral" | "new";

export interface TrafficChangeData {
  percentage: number;
  trend: MetricTrend;
  hasHistory: boolean;
  previousValue?: number;
  currentValue: number;
}

// --- Helper Functions ---

/**
 * Calculate the percentage change between current and previous values
 * @param current - Current metric value
 * @param previous - Previous metric value
 * @returns Percentage change (positive or negative)
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) {
    // If previous was 0 and current is positive, it's infinite growth
    // Return a large number to indicate "new" or massive growth
    return current > 0 ? Infinity : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Determine the trend based on percentage change
 * @param percentage - Percentage change value
 * @param hasHistory - Whether historical data exists
 * @returns Trend indicator
 */
export const determineTrend = (
  percentage: number,
  hasHistory: boolean
): MetricTrend => {
  if (!hasHistory) return "neutral";
  if (percentage === Infinity) return "new";
  if (percentage > 0) return "up";
  if (percentage < 0) return "down";
  return "neutral";
};

/**
 * Calculate traffic change for a specific keyword based on history
 * @param currentTraffic - Current traffic value
 * @param keywordHistory - Array of keyword history records
 * @param reportId - ID of the current keyword report
 * @returns Traffic change data
 */
export const calculateTrafficChange = (
  currentTraffic: number,
  keywordHistory: KeywordReportHistory[],
  reportId: string
): TrafficChangeData => {
  // Filter history for this specific keyword
  const keywordHistoryRecords = keywordHistory
    .filter((h) => h.reportId === reportId)
    .sort(
      (a, b) =>
        new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
    );

  // If no history exists, it's a new keyword
  if (keywordHistoryRecords.length === 0) {
    return {
      percentage: 0,
      trend: "new",
      hasHistory: false,
      currentValue: currentTraffic,
    };
  }

  // Get the most recent historical record
  const previousRecord = keywordHistoryRecords[0];
  const previousTraffic = previousRecord.traffic;

  // Calculate percentage change
  const percentage = calculatePercentageChange(currentTraffic, previousTraffic);
  const trend = determineTrend(percentage, true);

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend,
    hasHistory: true,
    previousValue: previousTraffic,
    currentValue: currentTraffic,
  };
};

/**
 * Calculate metric change for overall metrics
 * @param currentValue - Current metric value
 * @param metricsHistory - Array of overall metrics history
 * @param metricKey - Key of the metric to track (e.g., 'organicTraffic')
 * @returns Traffic change data
 */
export const calculateMetricChange = (
  currentValue: number,
  metricsHistory: OverallMetricsHistory[],
  metricKey: keyof Omit<
    OverallMetricsHistory,
    "id" | "dateRecorded" | "customerId"
  >
): TrafficChangeData => {
  // Sort history by date (most recent first)
  const sortedHistory = [...metricsHistory].sort(
    (a, b) =>
      new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()
  );

  // If no history exists
  if (sortedHistory.length === 0) {
    return {
      percentage: 0,
      trend: "new",
      hasHistory: false,
      currentValue,
    };
  }

  // Get the most recent historical value
  const previousValue = sortedHistory[0][metricKey] as number;

  // Calculate percentage change
  const percentage = calculatePercentageChange(currentValue, previousValue);
  const trend = determineTrend(percentage, true);

  return {
    percentage: percentage === Infinity ? 100 : percentage,
    trend,
    hasHistory: true,
    previousValue,
    currentValue,
  };
};

/**
 * Format percentage for display
 * @param percentage - Raw percentage value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  percentage: number,
  decimals: number = 0
): string => {
  const absPercentage = Math.abs(percentage);
  if (absPercentage >= 1000) {
    return `${(percentage / 1000).toFixed(1)}k`;
  }
  return absPercentage.toFixed(decimals);
};

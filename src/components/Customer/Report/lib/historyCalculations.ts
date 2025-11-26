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

// ============================================================
// Chart Data Transformation Functions
// ============================================================

/**
 * Data point format for Recharts
 */
export interface MetricsChartDataPoint {
  date: string; // ISO date string for X-axis
  dateLabel: string; // Formatted label for display
  domainRating: number;
  healthScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  spamScore: number;
}

export interface KeywordChartDataPoint {
  date: string;
  dateLabel: string;
  position: number | null;
  traffic: number;
  keyword: string;
}

/**
 * Filter history records by period (number of days)
 * @param history - Array of history records
 * @param days - Number of days to include (7, 30, or 90)
 * @returns Filtered array sorted by date ascending
 */
export const filterHistoryByPeriod = <
  T extends { dateRecorded: Date | string }
>(
  history: T[],
  days: number
): T[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return history
    .filter((record) => new Date(record.dateRecorded) >= cutoffDate)
    .sort(
      (a, b) =>
        new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime()
    );
};

/**
 * Format date for chart display (Thai locale)
 * @param date - Date to format
 * @returns Formatted string like "26 พ.ย."
 */
export const formatChartDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" });
};

/**
 * Transform OverallMetricsHistory array to Recharts-compatible format
 * @param history - Array of metrics history records
 * @param days - Period filter (default: 30)
 * @returns Array of chart data points sorted by date ascending
 */
export const transformMetricsForRecharts = (
  history: OverallMetricsHistory[],
  days: number = 30
): MetricsChartDataPoint[] => {
  // Filter and sort by period
  const filteredHistory = filterHistoryByPeriod(history, days);

  // Transform to chart format
  return filteredHistory.map((record) => ({
    date: new Date(record.dateRecorded).toISOString(),
    dateLabel: formatChartDate(record.dateRecorded),
    domainRating: record.domainRating,
    healthScore: record.healthScore,
    organicTraffic: record.organicTraffic,
    organicKeywords: record.organicKeywords,
    backlinks: record.backlinks,
    refDomains: record.refDomains,
    spamScore: record.spamScore,
  }));
};

/**
 * Group keyword history by keyword name
 * @param history - Array of keyword history records
 * @returns Map of keyword name to array of history records
 */
export const groupKeywordHistory = (
  history: KeywordReportHistory[]
): Map<string, KeywordReportHistory[]> => {
  const grouped = new Map<string, KeywordReportHistory[]>();

  history.forEach((record) => {
    const existing = grouped.get(record.keyword) || [];
    existing.push(record);
    grouped.set(record.keyword, existing);
  });

  // Sort each group by date ascending
  grouped.forEach((records, keyword) => {
    grouped.set(
      keyword,
      records.sort(
        (a, b) =>
          new Date(a.dateRecorded).getTime() -
          new Date(b.dateRecorded).getTime()
      )
    );
  });

  return grouped;
};

/**
 * Transform KeywordReportHistory for a specific keyword to chart format
 * @param history - Array of keyword history records
 * @param keyword - Keyword name to filter
 * @param days - Period filter (default: 30)
 * @returns Array of chart data points
 */
export const transformKeywordForRecharts = (
  history: KeywordReportHistory[],
  keyword: string,
  days: number = 30
): KeywordChartDataPoint[] => {
  // Filter by keyword and period
  const keywordHistory = history.filter((h) => h.keyword === keyword);
  const filteredHistory = filterHistoryByPeriod(keywordHistory, days);

  // Transform to chart format
  return filteredHistory.map((record) => ({
    date: new Date(record.dateRecorded).toISOString(),
    dateLabel: formatChartDate(record.dateRecorded),
    position: record.position,
    traffic: record.traffic,
    keyword: record.keyword,
  }));
};

/**
 * Get unique keyword names from history
 * @param history - Array of keyword history records
 * @returns Array of unique keyword names
 */
export const getUniqueKeywords = (
  history: KeywordReportHistory[]
): string[] => {
  return [...new Set(history.map((h) => h.keyword))];
};

/**
 * Check if there's enough data to display a chart
 * @param dataPoints - Number of data points
 * @returns true if >= 2 points (minimum for a line)
 */
export const hasEnoughDataForChart = (dataPoints: number): boolean => {
  return dataPoints >= 2;
};

// ============================================================
// Multi-Keyword Chart Functions
// ============================================================

/**
 * Data point format for multi-keyword Recharts
 * Contains dynamic keys: `{keyword}_position` and `{keyword}_traffic`
 */
export interface MultiKeywordChartDataPoint {
  date: string;
  dateLabel: string;
  [key: string]: string | number | null; // Dynamic keys for each keyword
}

/**
 * Sort keywords by their average traffic (highest first)
 * @param history - Array of keyword history records
 * @param keywords - Array of keyword names to sort
 * @returns Sorted array of keyword names
 */
export const sortKeywordsByTraffic = (
  history: KeywordReportHistory[],
  keywords: string[]
): string[] => {
  // Calculate average traffic for each keyword
  const trafficMap = new Map<string, number>();

  keywords.forEach((keyword) => {
    const keywordRecords = history.filter((h) => h.keyword === keyword);
    if (keywordRecords.length > 0) {
      const avgTraffic =
        keywordRecords.reduce((sum, r) => sum + r.traffic, 0) /
        keywordRecords.length;
      trafficMap.set(keyword, avgTraffic);
    } else {
      trafficMap.set(keyword, 0);
    }
  });

  // Sort by traffic descending
  return [...keywords].sort((a, b) => {
    const trafficA = trafficMap.get(a) || 0;
    const trafficB = trafficMap.get(b) || 0;
    return trafficB - trafficA;
  });
};

/**
 * Transform KeywordReportHistory for multiple keywords to chart format
 * Merges data by date, creating columns for each keyword's position and traffic
 * Also includes current keyword data as the latest data point
 * @param history - Array of keyword history records
 * @param keywords - Array of keyword names to include
 * @param days - Period filter (default: 30)
 * @param currentKeywords - Optional array of current keyword data
 * @returns Array of chart data points with dynamic keys
 */
export const transformMultiKeywordForRecharts = (
  history: KeywordReportHistory[],
  keywords: string[],
  days: number = 30,
  currentKeywords?: Array<{
    keyword: string;
    position: number | null;
    traffic: number;
    dateRecorded: string | Date;
  }>
): MultiKeywordChartDataPoint[] => {
  // Filter by period first
  const filteredHistory = filterHistoryByPeriod(history, days);

  // Group by date
  const dateMap = new Map<string, MultiKeywordChartDataPoint>();

  // Add history records
  filteredHistory.forEach((record) => {
    if (!keywords.includes(record.keyword)) return;

    const dateKey = new Date(record.dateRecorded).toISOString().split("T")[0]; // YYYY-MM-DD

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: new Date(record.dateRecorded).toISOString(),
        dateLabel: formatChartDate(record.dateRecorded),
      });
    }

    const dataPoint = dateMap.get(dateKey)!;
    // Create sanitized key (replace spaces with underscores)
    const safeKeyword = record.keyword.replace(/\s+/g, "_");
    dataPoint[`${safeKeyword}_position`] = record.position;
    dataPoint[`${safeKeyword}_traffic`] = record.traffic;
  });

  // Add current keyword data as the latest data point (if provided)
  if (currentKeywords && currentKeywords.length > 0) {
    currentKeywords.forEach((kw) => {
      if (!keywords.includes(kw.keyword)) return;

      const dateKey = new Date(kw.dateRecorded).toISOString().split("T")[0];

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: new Date(kw.dateRecorded).toISOString(),
          dateLabel: formatChartDate(kw.dateRecorded),
        });
      }

      const dataPoint = dateMap.get(dateKey)!;
      const safeKeyword = kw.keyword.replace(/\s+/g, "_");
      // Only set if not already set (history takes priority for same date)
      if (dataPoint[`${safeKeyword}_position`] === undefined) {
        dataPoint[`${safeKeyword}_position`] = kw.position;
        dataPoint[`${safeKeyword}_traffic`] = kw.traffic;
      }
    });
  }

  // Convert to array and sort by date ascending
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

/**
 * Create a safe dataKey from keyword name
 * @param keyword - Original keyword name
 * @param suffix - Suffix to append (e.g., "position", "traffic")
 * @returns Safe dataKey string
 */
export const createKeywordDataKey = (
  keyword: string,
  suffix: "position" | "traffic"
): string => {
  return `${keyword.replace(/\s+/g, "_")}_${suffix}`;
};

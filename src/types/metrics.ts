import { KDLevel } from "@prisma/client";

export interface OverallMetrics {
  id: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
  ageInMonths: number;
  spamScore: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  refDomains: number;
  dateRecorded: string;
  customerId: string;
}

/**
 * Calculate total months from years and months
 * @param years - Number of years
 * @param months - Number of months (0-11)
 * @returns Total months
 */
export const calculateTotalMonths = (years: number, months: number): number => {
  return years * 12 + months;
};

/**
 * Format duration for display (hides zero values)
 * @param years - Number of years
 * @param months - Number of months (0-11)
 * @returns Formatted string (e.g., "2 ปี 6 เดือน", "5 เดือน", "2 ปี", or "-")
 */
export const formatDuration = (years: number, months: number): string => {
  if (!years && !months) return "-";
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (months > 0) parts.push(`${months} เดือน`);
  return parts.join(" ");
};

export type OverallMetricsForm = Omit<
  OverallMetrics,
  "id" | "dateRecorded" | "customerId"
>;

export interface KeywordReport {
  id: string;
  keyword: string;
  position: number | null;
  traffic: number;
  kd: KDLevel;
  isTopReport: boolean;
  dateRecorded: string;
  customerId: string;
}

export type KeywordReportForm = Omit<
  KeywordReport,
  "id" | "dateRecorded" | "customerId"
>;

export interface KeywordRecommend {
  id: string;
  keyword: string;
  kd: KDLevel | null;
  isTopReport: boolean;
  note: string | null;
  createdAt: string;
  customerId: string;
}

export type KeywordRecommendForm = Omit<
  KeywordRecommend,
  "id" | "createdAt" | "customerId"
>;

// --- Traffic Change Tracking Types ---
export type MetricTrend = "up" | "down" | "neutral" | "new";

export interface TrafficChangeData {
  percentage: number;
  trend: MetricTrend;
  hasHistory: boolean;
  previousValue?: number;
  currentValue: number;
}

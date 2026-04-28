import type { KdLevel } from "@/types/kd";

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

export type OverallMetricsForm = Omit<
  OverallMetrics,
  "id" | "dateRecorded" | "customerId"
>;

export interface KeywordReport {
  id: string;
  keyword: string;
  position: number | null;
  traffic: number;
  kd: KdLevel;
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
  kd: KdLevel | null;
  isTopReport: boolean;
  note: string | null;
  createdAt: string;
  customerId: string;
}

export type KeywordRecommendForm = Omit<
  KeywordRecommend,
  "id" | "createdAt" | "customerId"
>;

// --- AI Overview Types ---
export interface AiOverviewImage {
  id: string;
  imageUrl: string;
  createdAt: string;
  aiOverviewId: string;
}

export interface AiOverview {
  id: string;
  title: string;
  displayDate: string;
  createdAt: string;
  customerId: string;
  images: AiOverviewImage[];
}

// --- Traffic Change Tracking Types ---
export type MetricTrend = "up" | "down" | "neutral" | "new";

export interface TrafficChangeData {
  percentage: number;
  trend: MetricTrend;
  hasHistory: boolean;
  previousValue?: number;
  currentValue: number;
}

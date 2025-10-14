import { KDLevel } from "@prisma/client";

export interface OverallMetrics {
  id: string;
  domainRating: number;
  healthScore: number;
  ageInYears: number;
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

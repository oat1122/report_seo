"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type {
  OverallMetricsForm,
  KeywordReport,
  KeywordRecommend,
  AiOverview,
} from "@/types/metrics";
import type {
  OverallMetricsHistory,
  KeywordReportHistory,
} from "@/types/history";

export interface CustomerReportData {
  metrics: OverallMetricsForm | null;
  topKeywords: KeywordReport[];
  otherKeywords: KeywordReport[];
  recommendations: KeywordRecommend[];
  aiOverviews: AiOverview[];
  customerName: string | null;
  domain: string | null;
}

export interface CurrentKeyword {
  id: string;
  keyword: string;
  position: number | null;
  traffic: number;
  kd: string;
  isTopReport: boolean;
  dateRecorded: string;
  customerId: string;
}

export interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
  currentKeywords: CurrentKeyword[];
}

export const useGetCustomerReport = (
  customerId: string,
  initialData?: CustomerReportData,
) =>
  useQuery<CustomerReportData, Error>({
    queryKey: ["customerReport", customerId],
    queryFn: async () => {
      const { data } = await axios.get(`/customers/${customerId}/report`);
      return data;
    },
    enabled: !!customerId,
    initialData,
  });

export const useGetCombinedHistory = (customerId: string | null) =>
  useQuery<CombinedHistoryData, Error>({
    queryKey: ["history", customerId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/customers/${customerId}/metrics/history`,
      );
      return data;
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });

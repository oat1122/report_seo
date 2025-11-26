// src/hooks/api/useCustomersApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordRecommend,
} from "@/types/metrics";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

// --- Types ---
interface CustomerReportData {
  metrics: OverallMetricsForm | null;
  topKeywords: KeywordReport[];
  otherKeywords: KeywordReport[];
  recommendations: KeywordRecommend[];
  customerName: string | null;
  domain: string | null;
}

interface KeywordFormData {
  keyword: string;
  position?: number | string | null;
  traffic: number | string;
  kd: string;
  isTopReport: boolean;
}

interface RecommendKeywordFormData {
  keyword: string;
  kd?: string | null;
  isTopReport?: boolean;
  note?: string | null;
}

// เพิ่ม Type สำหรับ Combined History
interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
  currentKeywords: CurrentKeyword[]; // Keywords ปัจจุบัน
}

// Type สำหรับ Keyword ปัจจุบัน
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

// --- API Functions ---
const fetchCustomerReport = async (
  customerId: string
): Promise<CustomerReportData> => {
  const { data } = await axios.get(`/customers/${customerId}/report`);
  return data;
};

const fetchMetrics = async (
  customerId: string
): Promise<OverallMetricsForm | null> => {
  const { data } = await axios.get(`/customers/${customerId}/metrics`);
  return data;
};

const saveMetrics = async ({
  customerId,
  metrics,
}: {
  customerId: string;
  metrics: OverallMetricsForm;
}): Promise<OverallMetricsForm> => {
  const { data } = await axios.post(
    `/customers/${customerId}/metrics`,
    metrics
  );
  return data;
};

const fetchKeywords = async (customerId: string): Promise<KeywordReport[]> => {
  const { data } = await axios.get(`/customers/${customerId}/keywords`);
  return data;
};

const addKeyword = async ({
  customerId,
  keyword,
}: {
  customerId: string;
  keyword: KeywordFormData;
}): Promise<KeywordReport> => {
  const { data } = await axios.post(
    `/customers/${customerId}/keywords`,
    keyword
  );
  return data;
};

const updateKeyword = async ({
  keywordId,
  keyword,
}: {
  keywordId: string;
  keyword: KeywordFormData;
}): Promise<KeywordReport> => {
  const { data } = await axios.put(`/customers/keywords/${keywordId}`, keyword);
  return data;
};

const deleteKeyword = async (keywordId: string): Promise<void> => {
  await axios.delete(`/customers/keywords/${keywordId}`);
};

const fetchRecommendKeywords = async (
  customerId: string
): Promise<KeywordRecommend[]> => {
  const { data } = await axios.get(
    `/customers/${customerId}/recommend-keywords`
  );
  return data;
};

const addRecommendKeyword = async ({
  customerId,
  keyword,
}: {
  customerId: string;
  keyword: RecommendKeywordFormData;
}): Promise<KeywordRecommend> => {
  const { data } = await axios.post(
    `/customers/${customerId}/recommend-keywords`,
    keyword
  );
  return data;
};

const deleteRecommendKeyword = async (recommendId: string): Promise<void> => {
  await axios.delete(`/customers/recommend-keywords/${recommendId}`);
};

// เพิ่ม API Function สำหรับ Combined History
const fetchCombinedHistory = async (
  customerId: string
): Promise<CombinedHistoryData> => {
  const { data } = await axios.get(`/customers/${customerId}/metrics/history`);
  return data;
};

// เพิ่ม API Function สำหรับ Keyword History (เฉพาะ Keyword)
const fetchKeywordSpecificHistory = async (
  keywordId: string
): Promise<KeywordReportHistory[]> => {
  const { data } = await axios.get(`/customers/keywords/${keywordId}/history`);
  return data;
};

// --- React Query Hooks ---

/**
 * Hook to fetch complete customer report (metrics + keywords + recommendations)
 */
export const useGetCustomerReport = (customerId: string) => {
  return useQuery<CustomerReportData, Error>({
    queryKey: ["customerReport", customerId],
    queryFn: () => fetchCustomerReport(customerId),
    enabled: !!customerId,
  });
};

/**
 * Hook to fetch customer metrics only
 */
export const useGetMetrics = (customerId: string) => {
  return useQuery<OverallMetricsForm | null, Error>({
    queryKey: ["metrics", customerId],
    queryFn: () => fetchMetrics(customerId),
    enabled: !!customerId,
  });
};

/**
 * Hook to save/update metrics
 */
export const useSaveMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OverallMetricsForm,
    Error,
    { customerId: string; metrics: OverallMetricsForm }
  >({
    mutationFn: saveMetrics,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["metrics", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
      toast.success("บันทึก Metrics สำเร็จ");
    },
  });
};

/**
 * Hook to fetch keywords for a customer
 */
export const useGetKeywords = (customerId: string) => {
  return useQuery<KeywordReport[], Error>({
    queryKey: ["keywords", customerId],
    queryFn: () => fetchKeywords(customerId),
    enabled: !!customerId,
  });
};

/**
 * Hook to add a new keyword
 */
export const useAddKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordReport,
    Error,
    { customerId: string; keyword: KeywordFormData }
  >({
    mutationFn: addKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["keywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
      toast.success("เพิ่ม Keyword สำเร็จ");
    },
  });
};

/**
 * Hook to update a keyword
 */
export const useUpdateKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordReport,
    Error,
    { keywordId: string; keyword: KeywordFormData }
  >({
    mutationFn: updateKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
      queryClient.invalidateQueries({ queryKey: ["customerReport"] });
      toast.success("อัปเดต Keyword สำเร็จ");
    },
  });
};

/**
 * Hook to delete a keyword
 */
export const useDeleteKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
      queryClient.invalidateQueries({ queryKey: ["customerReport"] });
      toast.success("ลบ Keyword สำเร็จ");
    },
  });
};

/**
 * Hook to fetch recommend keywords
 */
export const useGetRecommendKeywords = (customerId: string) => {
  return useQuery<KeywordRecommend[], Error>({
    queryKey: ["recommendKeywords", customerId],
    queryFn: () => fetchRecommendKeywords(customerId),
    enabled: !!customerId,
  });
};

/**
 * Hook to add a new recommend keyword
 */
export const useAddRecommendKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordRecommend,
    Error,
    { customerId: string; keyword: RecommendKeywordFormData }
  >({
    mutationFn: addRecommendKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recommendKeywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
      toast.success("เพิ่ม Keyword แนะนำสำเร็จ");
    },
  });
};

/**
 * Hook to delete a recommend keyword
 */
export const useDeleteRecommendKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteRecommendKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendKeywords"] });
      queryClient.invalidateQueries({ queryKey: ["customerReport"] });
      toast.success("ลบ Keyword แนะนำสำเร็จ");
    },
  });
};

/**
 * Hook to fetch combined metrics and keyword history for a customer
 */
export const useGetCombinedHistory = (customerId: string | null) => {
  return useQuery<CombinedHistoryData, Error>({
    queryKey: ["history", customerId],
    queryFn: () => fetchCombinedHistory(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook to fetch history for a specific keyword
 */
export const useGetKeywordSpecificHistory = (keywordId: string | null) => {
  return useQuery<KeywordReportHistory[], Error>({
    queryKey: ["keywordHistory", keywordId],
    queryFn: () => fetchKeywordSpecificHistory(keywordId!),
    enabled: !!keywordId,
  });
};

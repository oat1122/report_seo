import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  OverallMetricsForm,
  KeywordReport,
  KeywordRecommend,
  AiOverview,
} from "@/types/metrics";
import { OverallMetricsHistory, KeywordReportHistory } from "@/types/history";

export interface CustomerReportData {
  metrics: OverallMetricsForm | null;
  topKeywords: KeywordReport[];
  otherKeywords: KeywordReport[];
  recommendations: KeywordRecommend[];
  aiOverviews: AiOverview[];
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

interface CombinedHistoryData {
  metricsHistory: OverallMetricsHistory[];
  keywordHistory: KeywordReportHistory[];
  currentKeywords: CurrentKeyword[];
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

const fetchCustomerReport = async (
  customerId: string,
): Promise<CustomerReportData> => {
  const { data } = await axios.get(`/customers/${customerId}/report`);
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
    metrics,
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
    keyword,
  );
  return data;
};

const updateKeyword = async ({
  keywordId,
  keyword,
}: {
  customerId: string;
  keywordId: string;
  keyword: KeywordFormData;
}): Promise<KeywordReport> => {
  const { data } = await axios.put(`/customers/keywords/${keywordId}`, keyword);
  return data;
};

const deleteKeyword = async ({
  keywordId,
}: {
  customerId: string;
  keywordId: string;
}): Promise<void> => {
  await axios.delete(`/customers/keywords/${keywordId}`);
};

const fetchRecommendKeywords = async (
  customerId: string,
): Promise<KeywordRecommend[]> => {
  const { data } = await axios.get(
    `/customers/${customerId}/recommend-keywords`,
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
    keyword,
  );
  return data;
};

const updateRecommendKeyword = async ({
  recommendId,
  keyword,
}: {
  customerId: string;
  recommendId: string;
  keyword: RecommendKeywordFormData;
}): Promise<KeywordRecommend> => {
  const { data } = await axios.put(
    `/customers/recommend-keywords/${recommendId}`,
    keyword,
  );
  return data;
};

const deleteRecommendKeyword = async ({
  recommendId,
}: {
  customerId: string;
  recommendId: string;
}): Promise<void> => {
  await axios.delete(`/customers/recommend-keywords/${recommendId}`);
};

const fetchCombinedHistory = async (
  customerId: string,
): Promise<CombinedHistoryData> => {
  const { data } = await axios.get(`/customers/${customerId}/metrics/history`);
  return data;
};

const fetchKeywordSpecificHistory = async (
  keywordId: string,
): Promise<KeywordReportHistory[]> => {
  const { data } = await axios.get(`/customers/keywords/${keywordId}/history`);
  return data;
};

export const useGetCustomerReport = (
  customerId: string,
  initialData?: CustomerReportData,
) => {
  return useQuery<CustomerReportData, Error>({
    queryKey: ["customerReport", customerId],
    queryFn: () => fetchCustomerReport(customerId),
    enabled: !!customerId,
    initialData,
  });
};

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
      queryClient.invalidateQueries({
        queryKey: ["history", variables.customerId],
      });
    },
  });
};

export const useGetKeywords = (customerId: string) => {
  return useQuery<KeywordReport[], Error>({
    queryKey: ["keywords", customerId],
    queryFn: () => fetchKeywords(customerId),
    enabled: !!customerId,
  });
};

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
    },
  });
};

export const useUpdateKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordReport,
    Error,
    { customerId: string; keywordId: string; keyword: KeywordFormData }
  >({
    mutationFn: updateKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["keywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["history", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["keywordHistory", variables.keywordId],
      });
    },
  });
};

export const useDeleteKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { customerId: string; keywordId: string }
  >({
    mutationFn: deleteKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["keywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useGetRecommendKeywords = (customerId: string) => {
  return useQuery<KeywordRecommend[], Error>({
    queryKey: ["recommendKeywords", customerId],
    queryFn: () => fetchRecommendKeywords(customerId),
    enabled: !!customerId,
  });
};

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
    },
  });
};

export const useUpdateRecommendKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordRecommend,
    Error,
    {
      customerId: string;
      recommendId: string;
      keyword: RecommendKeywordFormData;
    }
  >({
    mutationFn: updateRecommendKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recommendKeywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useDeleteRecommendKeyword = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { customerId: string; recommendId: string }
  >({
    mutationFn: deleteRecommendKeyword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recommendKeywords", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useGetCombinedHistory = (customerId: string | null) => {
  return useQuery<CombinedHistoryData, Error>({
    queryKey: ["history", customerId],
    queryFn: () => fetchCombinedHistory(customerId!),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetKeywordSpecificHistory = (keywordId: string | null) => {
  return useQuery<KeywordReportHistory[], Error>({
    queryKey: ["keywordHistory", keywordId],
    queryFn: () => fetchKeywordSpecificHistory(keywordId!),
    enabled: !!keywordId,
  });
};

// --- History visibility (toggle log แสดง/ซ่อนต่อลูกค้า) ---

interface VisibilityPayload {
  customerId: string;
  historyId?: string;
  historyIds?: string[];
  isVisible: boolean;
}

const patchMetricsHistoryVisibility = async ({
  customerId,
  historyId,
  historyIds,
  isVisible,
}: VisibilityPayload) => {
  const { data } = await axios.patch(
    `/customers/${customerId}/metrics/history/visibility`,
    { historyId, historyIds, isVisible },
  );
  return data as { updated: number };
};

const patchKeywordHistoryVisibility = async ({
  customerId,
  historyId,
  historyIds,
  isVisible,
}: VisibilityPayload) => {
  const { data } = await axios.patch(
    `/customers/${customerId}/keywords/history/visibility`,
    { historyId, historyIds, isVisible },
  );
  return data as { updated: number };
};

export const useToggleMetricsHistoryVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { updated: number },
    Error,
    VisibilityPayload,
    { previous: CombinedHistoryData | undefined }
  >({
    mutationFn: patchMetricsHistoryVisibility,
    onMutate: async (variables) => {
      const queryKey = ["history", variables.customerId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CombinedHistoryData>(queryKey);

      // Optimistic flip บน metricsHistory
      const targetIds = variables.historyIds ?? [variables.historyId];
      queryClient.setQueryData<CombinedHistoryData>(queryKey, (old) =>
        old
          ? {
              ...old,
              metricsHistory: old.metricsHistory.map((h) =>
                targetIds.includes(h.id)
                  ? { ...h, isVisible: variables.isVisible }
                  : h,
              ),
            }
          : old,
      );

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["history", variables.customerId],
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["history", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useToggleKeywordHistoryVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { updated: number },
    Error,
    VisibilityPayload,
    { previousCombined: CombinedHistoryData | undefined }
  >({
    mutationFn: patchKeywordHistoryVisibility,
    onMutate: async (variables) => {
      const queryKey = ["history", variables.customerId];
      await queryClient.cancelQueries({ queryKey });
      const previousCombined =
        queryClient.getQueryData<CombinedHistoryData>(queryKey);

      const targetIds = variables.historyIds ?? [variables.historyId];
      queryClient.setQueryData<CombinedHistoryData>(queryKey, (old) =>
        old
          ? {
              ...old,
              keywordHistory: old.keywordHistory.map((h) =>
                targetIds.includes(h.id)
                  ? { ...h, isVisible: variables.isVisible }
                  : h,
              ),
            }
          : old,
      );

      return { previousCombined };
    },
    onError: (_err, variables, context) => {
      if (context?.previousCombined) {
        queryClient.setQueryData(
          ["history", variables.customerId],
          context.previousCombined,
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["history", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

const fetchAiOverviews = async (customerId: string): Promise<AiOverview[]> => {
  const { data } = await axios.get(`/customers/${customerId}/ai-overview`);
  return data;
};

const addAiOverview = async ({
  customerId,
  formData,
}: {
  customerId: string;
  formData: FormData;
}): Promise<AiOverview> => {
  const { data } = await axios.post(
    `/customers/${customerId}/ai-overview`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

const updateAiOverview = async ({
  customerId,
  id,
  formData,
}: {
  customerId: string;
  id: string;
  formData: FormData;
}): Promise<AiOverview> => {
  const { data } = await axios.put(
    `/customers/${customerId}/ai-overview/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

const deleteAiOverview = async ({
  customerId,
  aiOverviewId,
}: {
  customerId: string;
  aiOverviewId: string;
}): Promise<void> => {
  await axios.delete(`/customers/${customerId}/ai-overview/${aiOverviewId}`);
};

export const useGetAiOverviews = (customerId: string | null) => {
  return useQuery<AiOverview[], Error>({
    queryKey: ["aiOverviews", customerId],
    queryFn: () => fetchAiOverviews(customerId!),
    enabled: !!customerId,
  });
};

export const useAddAiOverview = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AiOverview,
    Error,
    { customerId: string; formData: FormData }
  >({
    mutationFn: addAiOverview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["aiOverviews", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useUpdateAiOverview = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AiOverview,
    Error,
    { customerId: string; id: string; formData: FormData }
  >({
    mutationFn: updateAiOverview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["aiOverviews", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerReport", variables.customerId],
      });
    },
  });
};

export const useDeleteAiOverview = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { customerId: string; aiOverviewId: string }>(
    {
      mutationFn: deleteAiOverview,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["aiOverviews", variables.customerId],
        });
        queryClient.invalidateQueries({
          queryKey: ["customerReport", variables.customerId],
        });
      },
    },
  );
};

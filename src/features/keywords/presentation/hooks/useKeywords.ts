"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { KeywordReport } from "@/types/metrics";
import type { KeywordReportHistory } from "@/types/history";
import type { CombinedHistoryData } from "@/features/customer-report/presentation/hooks/useCustomerReport";

export interface KeywordFormData {
  keyword: string;
  position?: number | string | null;
  traffic: number | string;
  kd: string;
  isTopReport: boolean;
}

interface VisibilityPayload {
  customerId: string;
  historyId?: string;
  historyIds?: string[];
  isVisible: boolean;
}

export const useGetKeywords = (customerId: string) =>
  useQuery<KeywordReport[], Error>({
    queryKey: ["keywords", customerId],
    queryFn: async () => {
      const { data } = await axios.get(`/customers/${customerId}/keywords`);
      return data;
    },
    enabled: !!customerId,
  });

export const useAddKeyword = () => {
  const queryClient = useQueryClient();
  return useMutation<
    KeywordReport,
    Error,
    { customerId: string; keyword: KeywordFormData }
  >({
    mutationFn: async ({ customerId, keyword }) => {
      const { data } = await axios.post(
        `/customers/${customerId}/keywords`,
        keyword,
      );
      return data;
    },
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
    mutationFn: async ({ keywordId, keyword }) => {
      const { data } = await axios.put(
        `/customers/keywords/${keywordId}`,
        keyword,
      );
      return data;
    },
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
    mutationFn: async ({ keywordId }) => {
      await axios.delete(`/customers/keywords/${keywordId}`);
    },
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

export const useGetKeywordSpecificHistory = (keywordId: string | null) =>
  useQuery<KeywordReportHistory[], Error>({
    queryKey: ["keywordHistory", keywordId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/customers/keywords/${keywordId}/history`,
      );
      return data;
    },
    enabled: !!keywordId,
  });

export const useToggleKeywordHistoryVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { updated: number },
    Error,
    VisibilityPayload,
    { previousCombined: CombinedHistoryData | undefined }
  >({
    mutationFn: async ({ customerId, historyId, historyIds, isVisible }) => {
      const { data } = await axios.patch(
        `/customers/${customerId}/keywords/history/visibility`,
        { historyId, historyIds, isVisible },
      );
      return data as { updated: number };
    },
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

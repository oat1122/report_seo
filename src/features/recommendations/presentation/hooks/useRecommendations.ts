"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { KeywordRecommend } from "@/types/metrics";

export interface RecommendKeywordFormData {
  keyword: string;
  kd?: string | null;
  isTopReport?: boolean;
  note?: string | null;
}

export const useGetRecommendKeywords = (customerId: string) =>
  useQuery<KeywordRecommend[], Error>({
    queryKey: ["recommendKeywords", customerId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/customers/${customerId}/recommend-keywords`,
      );
      return data;
    },
    enabled: !!customerId,
  });

export const useAddRecommendKeyword = () => {
  const queryClient = useQueryClient();
  return useMutation<
    KeywordRecommend,
    Error,
    { customerId: string; keyword: RecommendKeywordFormData }
  >({
    mutationFn: async ({ customerId, keyword }) => {
      const { data } = await axios.post(
        `/customers/${customerId}/recommend-keywords`,
        keyword,
      );
      return data;
    },
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
    mutationFn: async ({ recommendId, keyword }) => {
      const { data } = await axios.put(
        `/customers/recommend-keywords/${recommendId}`,
        keyword,
      );
      return data;
    },
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
    mutationFn: async ({ recommendId }) => {
      await axios.delete(`/customers/recommend-keywords/${recommendId}`);
    },
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

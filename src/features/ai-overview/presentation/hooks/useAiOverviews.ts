"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { AiOverview } from "@/types/metrics";

export const useGetAiOverviews = (customerId: string | null) =>
  useQuery<AiOverview[], Error>({
    queryKey: ["aiOverviews", customerId],
    queryFn: async () => {
      const { data } = await axios.get(`/customers/${customerId}/ai-overview`);
      return data;
    },
    enabled: !!customerId,
  });

export const useAddAiOverview = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AiOverview,
    Error,
    { customerId: string; formData: FormData }
  >({
    mutationFn: async ({ customerId, formData }) => {
      const { data } = await axios.post(
        `/customers/${customerId}/ai-overview`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
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
    mutationFn: async ({ customerId, id, formData }) => {
      const { data } = await axios.put(
        `/customers/${customerId}/ai-overview/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
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
      mutationFn: async ({ customerId, aiOverviewId }) => {
        await axios.delete(`/customers/${customerId}/ai-overview/${aiOverviewId}`);
      },
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

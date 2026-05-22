"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type {
  WorkProgressPlan,
  CreatePlanInput,
  UpdatePlanInput,
  SavePlanAsTemplateInput,
} from "@/features/work-progress";

type ApiData<T> = { data: T };

const plansKey = (userId: string, includeArchived: boolean) =>
  ["workProgress", "plans", userId, { includeArchived }] as const;

interface UsePlansOptions {
  includeArchived?: boolean;
  enabled?: boolean;
}

export const useWorkProgressPlans = (userId: string, opts: UsePlansOptions = {}) => {
  const includeArchived = opts.includeArchived ?? false;
  return useQuery<WorkProgressPlan[], Error>({
    queryKey: plansKey(userId, includeArchived),
    queryFn: async () => {
      const { data } = await axios.get<ApiData<WorkProgressPlan[]>>(
        `/customers/${userId}/work-progress`,
        { params: { includeArchived } },
      );
      return data.data;
    },
    enabled: !!userId && (opts.enabled ?? true),
  });
};

function invalidatePlansFor(qc: ReturnType<typeof useQueryClient>, userId: string) {
  qc.invalidateQueries({ queryKey: ["workProgress", "plans", userId] });
}

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation<
    WorkProgressPlan,
    Error,
    { userId: string; body: CreatePlanInput }
  >({
    mutationFn: async ({ userId, body }) => {
      const { data } = await axios.post<ApiData<WorkProgressPlan>>(
        `/customers/${userId}/work-progress`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, { userId }) => invalidatePlansFor(qc, userId),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation<
    WorkProgressPlan,
    Error,
    { userId: string; planId: string; body: UpdatePlanInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressPlan>>(
        `/customers/${userId}/work-progress/${planId}`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, { userId, planId }) => {
      invalidatePlansFor(qc, userId);
      qc.invalidateQueries({
        queryKey: ["workProgress", "plan", userId, planId],
      });
    },
  });
};

export const useArchivePlan = () => {
  const qc = useQueryClient();
  return useMutation<
    WorkProgressPlan,
    Error,
    { userId: string; planId: string; isArchived: boolean }
  >({
    mutationFn: async ({ userId, planId, isArchived }) => {
      const { data } = await axios.post<ApiData<WorkProgressPlan>>(
        `/customers/${userId}/work-progress/${planId}/archive`,
        { isArchived },
      );
      return data.data;
    },
    onSuccess: (_d, { userId, planId }) => {
      invalidatePlansFor(qc, userId);
      qc.invalidateQueries({
        queryKey: ["workProgress", "plan", userId, planId],
      });
    },
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: string; planId: string }>({
    mutationFn: async ({ userId, planId }) => {
      await axios.delete(`/customers/${userId}/work-progress/${planId}`);
    },
    onSuccess: (_d, { userId }) => invalidatePlansFor(qc, userId),
  });
};

export const useSavePlanAsTemplate = () => {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { userId: string; planId: string; body: SavePlanAsTemplateInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/save-as-template`,
        body,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workProgress", "templates"] });
    },
  });
};

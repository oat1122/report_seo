"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import { planDetailKey } from "./useWorkProgressPlan";
import type {
  AddItemInput,
  UpdateItemInput,
  AssignItemInput,
  ReorderItemsInput,
  BulkUpdateItemStatusInput,
  BulkDeleteItemsInput,
  BulkSetPeriodAcrossItemsInput,
  ImportPlanItemsInput,
  WorkProgressItemWithMarks,
} from "@/features/work-progress";

type ApiData<T> = { data: T };

interface PlanCtx {
  userId: string;
  planId: string;
}

function useInvalidatePlan() {
  const qc = useQueryClient();
  return ({ userId, planId }: PlanCtx) =>
    qc.invalidateQueries({ queryKey: planDetailKey(userId, planId) as unknown as string[] });
}

export const useAddItem = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    WorkProgressItemWithMarks,
    Error,
    PlanCtx & { body: AddItemInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post<ApiData<WorkProgressItemWithMarks>>(
        `/customers/${userId}/work-progress/${planId}/items`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useUpdateItem = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    WorkProgressItemWithMarks,
    Error,
    PlanCtx & { itemId: string; body: UpdateItemInput }
  >({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressItemWithMarks>>(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useDeleteItem = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<void, Error, PlanCtx & { itemId: string }>({
    mutationFn: async ({ userId, planId, itemId }) => {
      await axios.delete(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}`,
      );
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useReorderItems = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<void, Error, PlanCtx & { body: ReorderItemsInput }>({
    mutationFn: async ({ userId, planId, body }) => {
      await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/reorder`,
        body,
      );
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useAssignItem = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    unknown,
    Error,
    PlanCtx & { itemId: string; body: AssignItemInput }
  >({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/assign`,
        body,
      );
      return data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

// Phase 6 — bulk operations

export const useBulkUpdateItemStatus = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    { count: number },
    Error,
    PlanCtx & { body: BulkUpdateItemStatusInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post<ApiData<{ count: number }>>(
        `/customers/${userId}/work-progress/${planId}/items/bulk-status`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useBulkDeleteItems = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    { count: number },
    Error,
    PlanCtx & { body: BulkDeleteItemsInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post<ApiData<{ count: number }>>(
        `/customers/${userId}/work-progress/${planId}/items/bulk-delete`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useBulkSetPeriodAcrossItems = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    { count: number },
    Error,
    PlanCtx & { body: BulkSetPeriodAcrossItemsInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post<ApiData<{ count: number }>>(
        `/customers/${userId}/work-progress/${planId}/marks/bulk-period`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useImportItems = () => {
  const invalidate = useInvalidatePlan();
  return useMutation<
    { count: number },
    Error,
    PlanCtx & { body: ImportPlanItemsInput }
  >({
    mutationFn: async ({ userId, planId, body }) => {
      const { data } = await axios.post<ApiData<{ count: number }>>(
        `/customers/${userId}/work-progress/${planId}/items/import`,
        body,
      );
      return data.data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

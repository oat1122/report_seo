"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import { planDetailKey } from "./useWorkProgressPlan";
import type { UpsertMetaInput } from "@/features/work-progress";

interface MetaCtx {
  userId: string;
  planId: string;
  itemId: string;
}

function useInvalidate() {
  const qc = useQueryClient();
  return ({ userId, planId }: { userId: string; planId: string }) =>
    qc.invalidateQueries({
      queryKey: planDetailKey(userId, planId) as unknown as string[],
    });
}

export const useUpsertMeta = () => {
  const invalidate = useInvalidate();
  return useMutation<unknown, Error, MetaCtx & { body: UpsertMetaInput }>({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.put(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/meta`,
        body,
      );
      return data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useDeleteMeta = () => {
  const invalidate = useInvalidate();
  return useMutation<void, Error, MetaCtx & { key: string }>({
    mutationFn: async ({ userId, planId, itemId, key }) => {
      await axios.delete(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/meta/${encodeURIComponent(key)}`,
      );
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

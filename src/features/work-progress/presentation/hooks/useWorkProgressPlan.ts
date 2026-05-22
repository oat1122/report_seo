"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { WorkProgressPlanDetail } from "@/features/work-progress";

type ApiData<T> = { data: T };

export const planDetailKey = (userId: string, planId: string) =>
  ["workProgress", "plan", userId, planId] as const;

export const useWorkProgressPlan = (userId: string, planId: string) =>
  useQuery<WorkProgressPlanDetail, Error>({
    queryKey: planDetailKey(userId, planId),
    queryFn: async () => {
      const { data } = await axios.get<ApiData<WorkProgressPlanDetail>>(
        `/customers/${userId}/work-progress/${planId}`,
      );
      return data.data;
    },
    enabled: !!userId && !!planId,
  });

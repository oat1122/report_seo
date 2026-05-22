"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type {
  WorkProgressActivity,
  DashboardSummary,
} from "@/features/work-progress";

type ApiData<T> = { data: T };

interface ActivityPage {
  items: WorkProgressActivity[];
  nextCursor: string | null;
}

export const useActivityLog = (
  userId: string,
  planId: string,
  limit = 20,
) =>
  useInfiniteQuery<
    ActivityPage,
    Error,
    { pages: ActivityPage[]; pageParams: (string | undefined)[] },
    readonly unknown[],
    string | undefined
  >({
    queryKey: ["workProgress", "activity", userId, planId],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get<ApiData<ActivityPage>>(
        `/customers/${userId}/work-progress/${planId}/activity`,
        { params: { limit, cursor: pageParam } },
      );
      return data.data;
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!userId && !!planId,
  });

export const useDashboardSummary = (userId: string) =>
  useQuery<DashboardSummary, Error>({
    queryKey: ["workProgress", "dashboard", userId],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<DashboardSummary>>(
        `/customers/${userId}/work-progress/dashboard-summary`,
      );
      return data.data;
    },
    enabled: !!userId,
  });

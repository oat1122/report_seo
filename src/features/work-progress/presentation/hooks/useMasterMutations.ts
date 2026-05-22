"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type {
  UpsertCategoryInput,
  UpdateCategoryInput,
  UpsertStatusInput,
  UpdateStatusInput,
  UpsertMarkTypeInput,
  UpdateMarkTypeInput,
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
  MasterKindCode,
} from "@/features/work-progress";

type ApiData<T> = { data: T };

const kindPath: Record<MasterKindCode, string> = {
  category: "categories",
  status: "statuses",
  markType: "mark-types",
};

const kindQueryKey: Record<MasterKindCode, readonly string[]> = {
  category: ["workProgress", "master", "categories"],
  status: ["workProgress", "master", "statuses"],
  markType: ["workProgress", "master", "markTypes"],
};

function useInvalidate(kind: MasterKindCode) {
  const qc = useQueryClient();
  return () =>
    qc.invalidateQueries({ queryKey: [...kindQueryKey[kind]] as string[] });
}

// ───── Category ─────
export const useCreateCategory = () => {
  const invalidate = useInvalidate("category");
  return useMutation<WorkProgressCategory, Error, UpsertCategoryInput>({
    mutationFn: async (body) => {
      const { data } = await axios.post<ApiData<WorkProgressCategory>>(
        `/work-progress/${kindPath.category}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidate("category");
  return useMutation<
    WorkProgressCategory,
    Error,
    { id: string; body: UpdateCategoryInput }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressCategory>>(
        `/work-progress/${kindPath.category}/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

// ───── Status ─────
export const useCreateStatus = () => {
  const invalidate = useInvalidate("status");
  return useMutation<WorkProgressStatus, Error, UpsertStatusInput>({
    mutationFn: async (body) => {
      const { data } = await axios.post<ApiData<WorkProgressStatus>>(
        `/work-progress/${kindPath.status}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateStatus = () => {
  const invalidate = useInvalidate("status");
  return useMutation<
    WorkProgressStatus,
    Error,
    { id: string; body: UpdateStatusInput }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressStatus>>(
        `/work-progress/${kindPath.status}/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

// ───── MarkType ─────
export const useCreateMarkType = () => {
  const invalidate = useInvalidate("markType");
  return useMutation<WorkProgressMarkType, Error, UpsertMarkTypeInput>({
    mutationFn: async (body) => {
      const { data } = await axios.post<ApiData<WorkProgressMarkType>>(
        `/work-progress/${kindPath.markType}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateMarkType = () => {
  const invalidate = useInvalidate("markType");
  return useMutation<
    WorkProgressMarkType,
    Error,
    { id: string; body: UpdateMarkTypeInput }
  >({
    mutationFn: async ({ id, body }) => {
      const { data } = await axios.patch<ApiData<WorkProgressMarkType>>(
        `/work-progress/${kindPath.markType}/${id}`,
        body,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
};

// ───── Deactivate (POST .../[id]/deactivate) ─────
export const useDeactivateMaster = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { kind: MasterKindCode; id: string }>({
    mutationFn: async ({ kind, id }) => {
      await axios.post(`/work-progress/${kindPath[kind]}/${id}/deactivate`);
    },
    onSuccess: (_d, { kind }) => {
      qc.invalidateQueries({ queryKey: [...kindQueryKey[kind]] as string[] });
    },
  });
};

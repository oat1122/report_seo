"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import { planDetailKey } from "./useWorkProgressPlan";
import type { AddLinkAttachmentInput } from "@/features/work-progress";

interface AttachCtx {
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

export const useUploadAttachment = () => {
  const invalidate = useInvalidate();
  return useMutation<
    unknown,
    Error,
    AttachCtx & { file: File; caption?: string | null }
  >({
    mutationFn: async ({ userId, planId, itemId, file, caption }) => {
      const form = new FormData();
      form.append("file", file);
      if (caption) form.append("caption", caption);
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/attachments`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useAddLinkAttachment = () => {
  const invalidate = useInvalidate();
  return useMutation<
    unknown,
    Error,
    AttachCtx & { body: AddLinkAttachmentInput }
  >({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/attachments/link`,
        body,
      );
      return data;
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

export const useDeleteAttachment = () => {
  const invalidate = useInvalidate();
  return useMutation<
    void,
    Error,
    AttachCtx & { attachmentId: string }
  >({
    mutationFn: async ({ userId, planId, itemId, attachmentId }) => {
      await axios.delete(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/attachments/${attachmentId}`,
      );
    },
    onSuccess: (_d, vars) => invalidate(vars),
  });
};

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";
import type { AdminBillingDocument } from "../../domain/BillingDocument";
import type { ListAllDocumentsQuery } from "../../schemas";

function queryKey(filters?: ListAllDocumentsQuery) {
  return ["admin", "all-billing-documents", filters] as const;
}

export function useAllDocuments(filters?: ListAllDocumentsQuery) {
  return useQuery<AdminBillingDocument[]>({
    queryKey: queryKey(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.customerId) params.set("customerId", filters.customerId);

      const qs = params.toString();
      const { data } = await axios.get<ApiSuccess<AdminBillingDocument[]>>(
        `/admin/billing-documents${qs ? `?${qs}` : ""}`,
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useDeleteDocumentAdmin() {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: string; documentId: string }>({
    mutationFn: async ({ userId, documentId }) => {
      await axios.delete(
        `/customers/${userId}/billing-documents/${documentId}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "all-billing-documents"] });
    },
  });
}

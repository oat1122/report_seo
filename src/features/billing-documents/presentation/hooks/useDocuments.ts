"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";
import type { BillingDocument } from "../../domain/BillingDocument";
import type { GenerateDocumentInput } from "../../schemas";

function queryKey(customerId: string) {
  return ["customer", customerId, "billing-documents"] as const;
}

export function useListDocuments(customerId: string) {
  return useQuery<BillingDocument[]>({
    queryKey: queryKey(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<BillingDocument[]>>(
        `/customers/${customerId}/billing-documents`,
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useGenerateDocument(customerId: string) {
  const qc = useQueryClient();
  return useMutation<BillingDocument, Error, GenerateDocumentInput>({
    mutationFn: async (input) => {
      const { data } = await axios.post<ApiSuccess<BillingDocument>>(
        `/customers/${customerId}/billing-documents/generate`,
        input,
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  });
}

export function useDeleteDocument(customerId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (documentId) => {
      await axios.delete(
        `/customers/${customerId}/billing-documents/${documentId}`,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  });
}

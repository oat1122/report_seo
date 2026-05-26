"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";
import type {
  BillingDocument,
  BillingDocumentWithCycle,
} from "../../domain/BillingDocument";
import type { GenerateDocumentInput, UpdateDocumentInput, GenerateAllForCycleInput } from "../../schemas";

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

export function useUpdateDocument(customerId: string) {
  const qc = useQueryClient();
  return useMutation<
    BillingDocument,
    Error,
    { documentId: string; input: UpdateDocumentInput }
  >({
    mutationFn: async ({ documentId, input }) => {
      const { data } = await axios.patch<ApiSuccess<BillingDocument>>(
        `/customers/${customerId}/billing-documents/${documentId}`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(customerId) });
      qc.invalidateQueries({
        queryKey: ["customer", customerId, "billing-documents-by-cycles"],
      });
      qc.invalidateQueries({
        queryKey: ["admin", "all-billing-documents"],
      });
    },
  });
}

export function useGenerateAllForCycle(customerId: string) {
  const qc = useQueryClient();
  return useMutation<BillingDocument[], Error, GenerateAllForCycleInput>({
    mutationFn: async (input) => {
      const { data } = await axios.post<ApiSuccess<BillingDocument[]>>(
        `/customers/${customerId}/billing-documents/generate-all`,
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(customerId) });
      qc.invalidateQueries({
        queryKey: ["customer", customerId, "billing-documents-by-cycles"],
      });
    },
  });
}

export function useListDocumentsByCycles(customerId: string) {
  return useQuery<BillingDocumentWithCycle[]>({
    queryKey: ["customer", customerId, "billing-documents-by-cycles"],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<BillingDocumentWithCycle[]>>(
        `/customers/${customerId}/billing-documents/by-cycles`,
      );
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

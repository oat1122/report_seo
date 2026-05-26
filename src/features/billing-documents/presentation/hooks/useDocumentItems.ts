"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";
import type { DocumentItem } from "../../domain/DocumentItem";
import type { DocumentItemInput } from "../../schemas";

function queryKey(customerId: string) {
  return ["customer", customerId, "document-items"] as const;
}

export function useListDocumentItems(customerId: string) {
  return useQuery<DocumentItem[]>({
    queryKey: queryKey(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<DocumentItem[]>>(
        `/customers/${customerId}/document-items`,
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpsertDocumentItems(customerId: string) {
  const qc = useQueryClient();
  return useMutation<DocumentItem[], Error, DocumentItemInput[]>({
    mutationFn: async (items) => {
      const { data } = await axios.put<ApiSuccess<DocumentItem[]>>(
        `/customers/${customerId}/document-items`,
        { items },
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  });
}

export function useDeleteDocumentItem(customerId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await axios.delete(`/customers/${customerId}/document-items/${itemId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKey(customerId) }),
  });
}

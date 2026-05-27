"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";
import type { CustomerForDocument } from "../../application/ports/BillingDocumentRepository";

export function useCustomerSearch(query: string) {
  return useQuery<CustomerForDocument[]>({
    queryKey: ["admin", "customers-search", query],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<CustomerForDocument[]>>(
        "/admin/customers/search",
        { params: { q: query } },
      );
      return data.data;
    },
    enabled: query.length >= 1,
    staleTime: 30_000,
  });
}

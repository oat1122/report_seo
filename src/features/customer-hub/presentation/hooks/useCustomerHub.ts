"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { CustomerHubSummary } from "../../domain/CustomerHubSummary";

type ApiData<T> = { data: T };

export function useCustomerHub() {
  return useQuery<CustomerHubSummary>({
    queryKey: ["customer", "hub-summary"],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<CustomerHubSummary>>(
        "/customer/hub-summary",
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

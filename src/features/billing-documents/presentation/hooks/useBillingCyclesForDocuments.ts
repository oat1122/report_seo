"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ApiSuccess } from "@/infrastructure/http/responses";

export interface CycleForDocument {
  id: string;
  cycleNumber: number;
  dueDate: string;
  paidDate: string | null;
  amount: number;
  status: string;
  plan: {
    id: string;
    description: string;
    documentTemplateId: string | null;
  };
}

export function useBillingCyclesForDocuments(customerId: string) {
  return useQuery<CycleForDocument[]>({
    queryKey: ["customer", customerId, "cycles-for-documents"],
    queryFn: async () => {
      const { data } = await axios.get<ApiSuccess<CycleForDocument[]>>(
        `/customers/${customerId}/payments/cycles`,
      );
      return data.data;
    },
    staleTime: 60 * 1000,
    enabled: !!customerId,
  });
}

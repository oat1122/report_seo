"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { BillingCycle, BillingCycleWithPlan, UpdateBillingCycleInput } from "../../index";

type ApiData<T> = { data: T };

export const useListBillingCycles = (
  customerId: string,
  planId?: string,
) =>
  useQuery<BillingCycleWithPlan[], Error>({
    queryKey: ["payments", "cycles", customerId, planId],
    queryFn: async () => {
      const url = planId
        ? `/customers/${customerId}/payments/plans/${planId}/cycles`
        : `/customers/${customerId}/payments/cycles`;
      const { data } = await axios.get<ApiData<BillingCycleWithPlan[]>>(url);
      return data.data;
    },
    enabled: !!customerId,
  });

export const useUpdateBillingCycle = () => {
  const queryClient = useQueryClient();
  return useMutation<
    BillingCycle,
    Error,
    { customerId: string; cycleId: string; data: UpdateBillingCycleInput }
  >({
    mutationFn: async ({ customerId, cycleId, data: body }) => {
      const { data } = await axios.patch<ApiData<BillingCycle>>(
        `/customers/${customerId}/payments/cycles/${cycleId}`,
        body,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "cycles", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "plans", variables.customerId],
      });
    },
  });
};

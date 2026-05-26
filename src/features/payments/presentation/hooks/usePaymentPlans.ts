"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { PaymentPlan, PaymentPlanWithCycles, CreatePaymentPlanInput, UpdatePaymentPlanInput } from "../../index";

type ApiData<T> = { data: T };

export const useListPaymentPlans = (
  customerId: string,
  status?: string,
) =>
  useQuery<PaymentPlan[], Error>({
    queryKey: ["payments", "plans", customerId, status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      const { data } = await axios.get<ApiData<PaymentPlan[]>>(
        `/customers/${customerId}/payments/plans${params}`,
      );
      return data.data;
    },
    enabled: !!customerId,
  });

export const useGetPaymentPlan = (customerId: string, planId: string) =>
  useQuery<PaymentPlanWithCycles, Error>({
    queryKey: ["payments", "plans", customerId, planId],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<PaymentPlanWithCycles>>(
        `/customers/${customerId}/payments/plans/${planId}`,
      );
      return data.data;
    },
    enabled: !!customerId && !!planId,
  });

export const useCreatePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PaymentPlan,
    Error,
    { customerId: string; plan: CreatePaymentPlanInput }
  >({
    mutationFn: async ({ customerId, plan }) => {
      const { data } = await axios.post<ApiData<PaymentPlan>>(
        `/customers/${customerId}/payments/plans`,
        plan,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "plans", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "cycles", variables.customerId],
      });
    },
  });
};

export const useUpdatePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PaymentPlan,
    Error,
    { customerId: string; planId: string; data: UpdatePaymentPlanInput }
  >({
    mutationFn: async ({ customerId, planId, data: body }) => {
      const { data } = await axios.patch<ApiData<PaymentPlan>>(
        `/customers/${customerId}/payments/plans/${planId}`,
        body,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "plans", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "cycles", variables.customerId],
      });
    },
  });
};

export const useCancelPaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PaymentPlan,
    Error,
    { customerId: string; planId: string }
  >({
    mutationFn: async ({ customerId, planId }) => {
      const { data } = await axios.post<ApiData<PaymentPlan>>(
        `/customers/${customerId}/payments/plans/${planId}/cancel`,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "plans", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "cycles", variables.customerId],
      });
    },
  });
};

export const useReactivatePaymentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PaymentPlan,
    Error,
    { customerId: string; planId: string }
  >({
    mutationFn: async ({ customerId, planId }) => {
      const { data } = await axios.post<ApiData<PaymentPlan>>(
        `/customers/${customerId}/payments/plans/${planId}/reactivate`,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "plans", variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "cycles", variables.customerId],
      });
    },
  });
};

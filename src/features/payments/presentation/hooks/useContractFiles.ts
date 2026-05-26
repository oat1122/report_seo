"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/infrastructure/http/axios";
import type { ContractFile } from "../../index";

type ApiData<T> = { data: T };

export const useListContractFiles = (customerId: string) =>
  useQuery<ContractFile[], Error>({
    queryKey: ["payments", "contracts", customerId],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<ContractFile[]>>(
        `/customers/${customerId}/payments/contracts`,
      );
      return data.data;
    },
    enabled: !!customerId,
  });

export const useUploadContractFile = () => {
  const queryClient = useQueryClient();
  return useMutation<ContractFile, Error, { customerId: string; file: File }>({
    mutationFn: async ({ customerId, file }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post<ApiData<ContractFile>>(
        `/customers/${customerId}/payments/contracts`,
        formData,
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "contracts", variables.customerId],
      });
    },
  });
};

export const useDeleteContractFile = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { customerId: string; contractId: string }>({
    mutationFn: async ({ customerId, contractId }) => {
      await axios.delete(
        `/customers/${customerId}/payments/contracts/${contractId}`,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "contracts", variables.customerId],
      });
    },
  });
};

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { NextStep, NextStepPriority } from '../../domain/NextStep'

type ApiData<T> = { data: T }

export interface NextStepFormData {
  title: string
  description?: string | null
  priority: NextStepPriority
}

const queryKey = (customerId: string) => ['nextSteps', customerId] as const

export const useGetNextSteps = (customerId: string) =>
  useQuery<NextStep[], Error>({
    queryKey: queryKey(customerId),
    queryFn: async () => {
      const { data } = await axios.get<ApiData<NextStep[]>>(`/customers/${customerId}/next-steps`)
      return data.data
    },
    enabled: !!customerId,
    staleTime: 60_000,
  })

export const useAddNextStep = () => {
  const queryClient = useQueryClient()
  return useMutation<NextStep, Error, { customerId: string; step: NextStepFormData }>({
    mutationFn: async ({ customerId, step }) => {
      const { data } = await axios.post<ApiData<NextStep>>(
        `/customers/${customerId}/next-steps`,
        step,
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.customerId) })
    },
  })
}

export const useUpdateNextStep = () => {
  const queryClient = useQueryClient()
  return useMutation<
    NextStep,
    Error,
    { customerId: string; stepId: string; step: NextStepFormData }
  >({
    mutationFn: async ({ customerId, stepId, step }) => {
      const { data } = await axios.put<ApiData<NextStep>>(
        `/customers/${customerId}/next-steps/${stepId}`,
        step,
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.customerId) })
    },
  })
}

export const useDeleteNextStep = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { customerId: string; stepId: string }>({
    mutationFn: async ({ customerId, stepId }) => {
      await axios.delete(`/customers/${customerId}/next-steps/${stepId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(variables.customerId) })
    },
  })
}

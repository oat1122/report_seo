'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { OverallMetricsForm } from '@/types/metrics'
import type { CombinedHistoryData } from '@/features/customer-report/presentation/hooks/useCustomerReport'

type ApiData<T> = { data: T }

interface VisibilityPayload {
  customerId: string
  historyId?: string
  historyIds?: string[]
  isVisible: boolean
}

export const useSaveMetrics = () => {
  const queryClient = useQueryClient()

  return useMutation<
    OverallMetricsForm,
    Error,
    { customerId: string; metrics: Partial<OverallMetricsForm> }
  >({
    mutationFn: async ({ customerId, metrics }) => {
      const { data } = await axios.post<ApiData<OverallMetricsForm>>(
        `/customers/${customerId}/metrics`,
        metrics,
      )
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['metrics', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['customerReport', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['history', variables.customerId],
      })
    },
  })
}

export const useToggleMetricsHistoryVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { updated: number },
    Error,
    VisibilityPayload,
    { previous: CombinedHistoryData | undefined }
  >({
    mutationFn: async ({ customerId, historyId, historyIds, isVisible }) => {
      const { data } = await axios.patch<ApiData<{ updated: number }>>(
        `/customers/${customerId}/metrics/history/visibility`,
        { historyId, historyIds, isVisible },
      )
      return data.data
    },
    onMutate: async (variables) => {
      const queryKey = ['history', variables.customerId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<CombinedHistoryData>(queryKey)

      const targetIds = variables.historyIds ?? [variables.historyId]
      queryClient.setQueryData<CombinedHistoryData>(queryKey, (old) =>
        old
          ? {
              ...old,
              metricsHistory: old.metricsHistory.map((h) =>
                targetIds.includes(h.id) ? { ...h, isVisible: variables.isVisible } : h,
              ),
            }
          : old,
      )

      return { previous }
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['history', variables.customerId], context.previous)
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['history', variables.customerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['customerReport', variables.customerId],
      })
    },
  })
}

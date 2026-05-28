'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import { planDetailKey } from './useWorkProgressPlan'
import type {
  AddSubtaskInput,
  UpdateSubtaskInput,
  ReorderSubtasksInput,
} from '@/features/work-progress'

interface SubtaskCtx {
  userId: string
  planId: string
  itemId: string
}

function useInvalidate() {
  const qc = useQueryClient()
  return ({ userId, planId }: { userId: string; planId: string }) =>
    qc.invalidateQueries({
      queryKey: planDetailKey(userId, planId) as unknown as string[],
    })
}

export const useAddSubtask = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, Error, SubtaskCtx & { body: AddSubtaskInput }>({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/subtasks`,
        body,
      )
      return data
    },
    onSuccess: (_d, vars) => invalidate(vars),
  })
}

export const useUpdateSubtask = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, Error, SubtaskCtx & { subtaskId: string; body: UpdateSubtaskInput }>({
    mutationFn: async ({ userId, planId, itemId, subtaskId, body }) => {
      const { data } = await axios.patch(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/subtasks/${subtaskId}`,
        body,
      )
      return data
    },
    onSuccess: (_d, vars) => invalidate(vars),
  })
}

export const useToggleSubtask = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, Error, SubtaskCtx & { subtaskId: string }>({
    mutationFn: async ({ userId, planId, itemId, subtaskId }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/subtasks/${subtaskId}/toggle`,
      )
      return data
    },
    onSuccess: (_d, vars) => invalidate(vars),
  })
}

export const useDeleteSubtask = () => {
  const invalidate = useInvalidate()
  return useMutation<void, Error, SubtaskCtx & { subtaskId: string }>({
    mutationFn: async ({ userId, planId, itemId, subtaskId }) => {
      await axios.delete(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/subtasks/${subtaskId}`,
      )
    },
    onSuccess: (_d, vars) => invalidate(vars),
  })
}

export const useReorderSubtasks = () => {
  const invalidate = useInvalidate()
  return useMutation<unknown, Error, SubtaskCtx & { body: ReorderSubtasksInput }>({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.post(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/subtasks/reorder`,
        body,
      )
      return data
    },
    onSuccess: (_d, vars) => invalidate(vars),
  })
}

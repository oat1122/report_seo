'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import { planDetailKey } from './useWorkProgressPlan'
import type {
  SetPeriodMarkInput,
  WorkProgressPlanDetail,
  WorkProgressPeriodMarkWithType,
  WorkProgressMarkType,
} from '@/features/work-progress'

interface MarkCtx {
  userId: string
  planId: string
  itemId: string
}

const TEMP_MARK_ID = '__optimistic__'

function applyMarkPatch(
  prev: WorkProgressPlanDetail | undefined,
  ctx: MarkCtx,
  body: SetPeriodMarkInput,
  markType: WorkProgressMarkType | null,
): WorkProgressPlanDetail | undefined {
  if (!prev || !markType) return prev
  return {
    ...prev,
    items: prev.items.map((item) => {
      if (item.id !== ctx.itemId) return item
      const existingIdx = item.periodMarks.findIndex((m) => m.periodId === body.periodId)
      const patch: WorkProgressPeriodMarkWithType = {
        id: existingIdx >= 0 ? item.periodMarks[existingIdx].id : TEMP_MARK_ID,
        itemId: item.id,
        periodId: body.periodId,
        markTypeId: body.markTypeId,
        progressPercent: body.progressPercent ?? null,
        note: body.note ?? null,
        scheduledDate: body.scheduledDate ?? null,
        updatedAt: new Date(),
        markType,
      }
      const next = [...item.periodMarks]
      if (existingIdx >= 0) next[existingIdx] = patch
      else next.push(patch)
      return { ...item, periodMarks: next }
    }),
  }
}

function applyClearPatch(
  prev: WorkProgressPlanDetail | undefined,
  ctx: MarkCtx,
  periodId: string,
): WorkProgressPlanDetail | undefined {
  if (!prev) return prev
  return {
    ...prev,
    items: prev.items.map((item) =>
      item.id === ctx.itemId
        ? {
            ...item,
            periodMarks: item.periodMarks.filter((m) => m.periodId !== periodId),
          }
        : item,
    ),
  }
}

export const useSetPeriodMark = () => {
  const qc = useQueryClient()
  return useMutation<
    unknown,
    Error,
    MarkCtx & { body: SetPeriodMarkInput; markType: WorkProgressMarkType | null },
    { key: readonly unknown[]; prev: WorkProgressPlanDetail | undefined }
  >({
    mutationFn: async ({ userId, planId, itemId, body }) => {
      const { data } = await axios.put(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/marks`,
        body,
      )
      return data
    },
    onMutate: async (vars) => {
      const key = planDetailKey(vars.userId, vars.planId)
      await qc.cancelQueries({ queryKey: key as unknown as string[] })
      const prev = qc.getQueryData<WorkProgressPlanDetail>(key as unknown as string[])
      qc.setQueryData<WorkProgressPlanDetail>(key as unknown as string[], (old) =>
        applyMarkPatch(old, vars, vars.body, vars.markType),
      )
      return { key, prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx) qc.setQueryData(ctx.key as unknown as string[], ctx.prev)
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({
        queryKey: planDetailKey(vars.userId, vars.planId) as unknown as string[],
      })
    },
  })
}

export const useClearPeriodMark = () => {
  const qc = useQueryClient()
  return useMutation<
    void,
    Error,
    MarkCtx & { periodId: string },
    { key: readonly unknown[]; prev: WorkProgressPlanDetail | undefined }
  >({
    mutationFn: async ({ userId, planId, itemId, periodId }) => {
      await axios.delete(
        `/customers/${userId}/work-progress/${planId}/items/${itemId}/marks/${periodId}`,
      )
    },
    onMutate: async (vars) => {
      const key = planDetailKey(vars.userId, vars.planId)
      await qc.cancelQueries({ queryKey: key as unknown as string[] })
      const prev = qc.getQueryData<WorkProgressPlanDetail>(key as unknown as string[])
      qc.setQueryData<WorkProgressPlanDetail>(key as unknown as string[], (old) =>
        applyClearPatch(old, vars, vars.periodId),
      )
      return { key, prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx) qc.setQueryData(ctx.key as unknown as string[], ctx.prev)
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({
        queryKey: planDetailKey(vars.userId, vars.planId) as unknown as string[],
      })
    },
  })
}

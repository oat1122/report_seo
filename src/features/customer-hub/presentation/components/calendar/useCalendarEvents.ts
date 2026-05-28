'use client'

import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { WorkProgressPlan, WorkProgressPlanDetail } from '@/features/work-progress'
import type { BillingCycleWithPlan } from '@/features/payments'
import type { CalendarEvent } from '@schedule-x/calendar'
import {
  workProgressPlanToEvents,
  billingCyclesToEvents,
  type CalendarItemLookup,
} from './calendar-event-transforms'

type ApiData<T> = { data: T }

export function useCalendarEvents(userId: string) {
  const { data: plans, isLoading: plansLoading } = useQuery<WorkProgressPlan[], Error>({
    queryKey: ['workProgress', 'plans', userId, { includeArchived: false }],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<WorkProgressPlan[]>>(
        `/customers/${userId}/work-progress`,
        { params: { includeArchived: false } },
      )
      return data.data
    },
    enabled: !!userId,
  })

  const activePlanIds = useMemo(
    () => (plans ?? []).filter((p) => !p.isArchived).map((p) => p.id),
    [plans],
  )

  const planDetailResults = useQueries({
    queries: activePlanIds.map((planId) => ({
      queryKey: ['workProgress', 'plan', userId, planId] as const,
      queryFn: async () => {
        const { data } = await axios.get<ApiData<WorkProgressPlanDetail>>(
          `/customers/${userId}/work-progress/${planId}`,
        )
        return data.data
      },
      enabled: !!userId && activePlanIds.length > 0,
    })),
  })

  const { data: cycles, isLoading: cyclesLoading } = useQuery<BillingCycleWithPlan[], Error>({
    queryKey: ['payments', 'cycles', userId, undefined],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<BillingCycleWithPlan[]>>(
        `/customers/${userId}/payments/cycles`,
      )
      return data.data
    },
    enabled: !!userId,
  })

  const detailsLoading = planDetailResults.some((r) => r.isLoading)

  const detailsKey = planDetailResults.map((r) => r.dataUpdatedAt).join(',')

  const { events, itemLookup } = useMemo(() => {
    const lookup: CalendarItemLookup = new Map()
    const wpEvents = planDetailResults.flatMap((r) =>
      r.data ? workProgressPlanToEvents(r.data, lookup) : [],
    )
    const payEvents = cycles ? billingCyclesToEvents(cycles) : []
    return {
      events: [...wpEvents, ...payEvents] as CalendarEvent[],
      itemLookup: lookup,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsKey, cycles])

  return {
    events,
    itemLookup,
    isLoading: plansLoading || detailsLoading || cyclesLoading,
  }
}

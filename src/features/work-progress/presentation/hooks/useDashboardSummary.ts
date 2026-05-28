'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { DashboardSummary } from '@/features/work-progress'

type ApiData<T> = { data: T }

interface UseDashboardSummaryOptions {
  upcomingDays?: number
  recentLimit?: number
  enabled?: boolean
}

export function useDashboardSummary(userId: string, opts: UseDashboardSummaryOptions = {}) {
  const upcomingDays = opts.upcomingDays ?? 14
  const recentLimit = opts.recentLimit ?? 0
  return useQuery<DashboardSummary, Error>({
    queryKey: ['workProgress', 'dashboard-summary', userId, { upcomingDays, recentLimit }],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<DashboardSummary>>(
        `/customers/${userId}/work-progress/dashboard-summary`,
        { params: { upcomingDays, recentLimit } },
      )
      return data.data
    },
    enabled: !!userId && (opts.enabled ?? true),
    staleTime: 60_000,
  })
}

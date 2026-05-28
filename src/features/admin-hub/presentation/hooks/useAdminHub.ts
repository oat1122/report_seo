'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { AdminHubSummary } from '../../domain/AdminHubSummary'

type ApiData<T> = { data: T }

export function useAdminHub() {
  return useQuery<AdminHubSummary>({
    queryKey: ['admin', 'hub-summary'],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<AdminHubSummary>>('/admin/hub-summary')
      return data.data
    },
    staleTime: 60_000,
  })
}

'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
} from '@/features/work-progress'

type ApiData<T> = { data: T }

const FIVE_MINUTES = 5 * 60 * 1000

async function fetchList<T>(path: string): Promise<T[]> {
  const { data } = await axios.get<ApiData<T[]>>(path)
  return data.data
}

export const useCategories = () =>
  useQuery<WorkProgressCategory[], Error>({
    queryKey: ['workProgress', 'master', 'categories'],
    queryFn: () => fetchList<WorkProgressCategory>('/work-progress/categories'),
    staleTime: FIVE_MINUTES,
  })

export const useStatuses = () =>
  useQuery<WorkProgressStatus[], Error>({
    queryKey: ['workProgress', 'master', 'statuses'],
    queryFn: () => fetchList<WorkProgressStatus>('/work-progress/statuses'),
    staleTime: FIVE_MINUTES,
  })

export const useMarkTypes = () =>
  useQuery<WorkProgressMarkType[], Error>({
    queryKey: ['workProgress', 'master', 'markTypes'],
    queryFn: () => fetchList<WorkProgressMarkType>('/work-progress/mark-types'),
    staleTime: FIVE_MINUTES,
  })

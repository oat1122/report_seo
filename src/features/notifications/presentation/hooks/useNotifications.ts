'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import axios from '@/infrastructure/http/axios'
import type { Notification, PreferenceWithLabel } from '@/features/notifications'
import type { PageInfo } from '@/lib/pagination'

type ApiData<T> = { data: T }
type ApiPaginated<T> = { data: T[]; pagination: PageInfo }

const KEYS = {
  list: ['notifications', 'list'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  preferences: ['notifications', 'preferences'] as const,
}

export function useNotifications() {
  return useInfiniteQuery<ApiPaginated<Notification>>({
    queryKey: [...KEYS.list],
    queryFn: async ({ pageParam }) => {
      const { data } = await axios.get<ApiPaginated<Notification>>('/notifications', {
        params: { page: pageParam, limit: 20 },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 60_000,
  })
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: [...KEYS.unreadCount],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<{ count: number }>>('/notifications/unread-count')
      return data.data.count
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axios.patch(`/notifications/${id}/read`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
      qc.invalidateQueries({ queryKey: KEYS.list })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await axios.patch('/notifications/read-all')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
      qc.invalidateQueries({ queryKey: KEYS.list })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axios.delete(`/notifications/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
      qc.invalidateQueries({ queryKey: KEYS.list })
    },
  })
}

export function useNotificationPreferences() {
  return useQuery<PreferenceWithLabel[]>({
    queryKey: [...KEYS.preferences],
    queryFn: async () => {
      const { data } = await axios.get<ApiData<PreferenceWithLabel[]>>('/notifications/preferences')
      return data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (items: Array<{ type: string; enabled: boolean }>) => {
      await axios.put('/notifications/preferences', { items })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.preferences })
    },
  })
}

export { KEYS as NOTIFICATION_QUERY_KEYS }

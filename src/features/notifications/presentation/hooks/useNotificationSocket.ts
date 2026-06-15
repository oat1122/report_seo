'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import type { Notification } from '../../domain/Notification'
import { NOTIFICATION_QUERY_KEYS } from './useNotifications'

export function useNotificationSocket() {
  const { status } = useSession()
  const queryClient = useQueryClient()

  const handleNewNotification = useCallback(
    (notification: Notification) => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      })
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.list,
      })

      toast(notification.title, {
        description: notification.body ?? undefined,
      })
    },
    [queryClient],
  )

  useEffect(() => {
    if (status !== 'authenticated') return

    // polling-only: reverse proxy หน้า PM2 ไม่ forward WebSocket Upgrade ให้ /api/socket
    // long-polling ลอด proxy ได้เสมอ และ noti ความถี่ต่ำจึง overhead น้อยมาก
    // upgrade: false ปิด probe ไป websocket → ไม่มี WS error ค้างใน console
    const socket = io({
      path: '/api/socket',
      withCredentials: true,
      transports: ['polling'],
      upgrade: false,
    })

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.disconnect()
    }
  }, [status, handleNewNotification])
}

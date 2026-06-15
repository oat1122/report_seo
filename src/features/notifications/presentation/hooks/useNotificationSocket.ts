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

    // polling-first: handshake ผ่าน HTTP long-polling ก่อน (ลอด reverse proxy ได้เสมอ)
    // แล้วค่อย auto-upgrade เป็น websocket เมื่อ proxy ส่ง Upgrade header ให้ /api/socket
    // กัน noti พังถาวรเมื่อ WS ถูกบล็อก (เดิม websocket-first + tryAllTransports=false จะไม่ fallback)
    const socket = io({
      path: '/api/socket',
      withCredentials: true,
      transports: ['polling', 'websocket'],
    })

    socket.on('notification:new', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.disconnect()
    }
  }, [status, handleNewNotification])
}

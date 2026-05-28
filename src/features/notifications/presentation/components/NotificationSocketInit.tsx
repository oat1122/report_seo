'use client'

import { useNotificationSocket } from '../hooks/useNotificationSocket'

export function NotificationSocketInit() {
  useNotificationSocket()
  return null
}

'use client'

import { useState } from 'react'
import { CheckCheck, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/features/notifications/presentation/components/NotificationCenter'
import { NotificationPreferencesDialog } from '@/features/notifications/presentation/components/NotificationPreferencesDialog'
import {
  useUnreadCount,
  useMarkAllAsRead,
} from '@/features/notifications/presentation/hooks/useNotifications'

export function HubNotificationsPanel() {
  const { data: unreadCount } = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const [prefOpen, setPrefOpen] = useState(false)

  const hasUnread = unreadCount != null && unreadCount > 0

  return (
    <>
      <section
        aria-labelledby="hub-notifications"
        className="border-glass-border bg-glass-card shadow-card flex min-w-0 flex-col gap-3 rounded-[20px] border p-4 backdrop-blur-[14px] sm:gap-4 sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="hub-notifications" className="text-base font-semibold sm:text-[17px]">
            การแจ้งเตือน
          </h2>
          <div className="flex items-center gap-1.5">
            {hasUnread && (
              <Badge variant="info" className="tabular-nums">
                <span data-dot className="bg-neon-pink" />
                {unreadCount > 99 ? '99+' : unreadCount} ใหม่
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <CheckCheck aria-hidden />
              )}
              อ่านทั้งหมด
            </Button>
          </div>
        </div>

        <NotificationCenter
          onOpenPreferences={() => setPrefOpen(true)}
          className="w-full"
          listClassName="max-h-[560px]"
          hideHeader
        />
      </section>

      <NotificationPreferencesDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </>
  )
}

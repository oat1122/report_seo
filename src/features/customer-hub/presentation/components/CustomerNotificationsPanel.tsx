'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Settings } from 'lucide-react'
import { Card, CardHeader, CardAction, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/features/notifications/presentation/components/NotificationCenter'
import { NotificationPreferencesDialog } from '@/features/notifications/presentation/components/NotificationPreferencesDialog'
import {
  useUnreadCount,
  useMarkAllAsRead,
} from '@/features/notifications/presentation/hooks/useNotifications'

export function CustomerNotificationsPanel() {
  const { data: unreadCount } = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const [prefOpen, setPrefOpen] = useState(false)

  return (
    <>
      <Card className="flex flex-col pb-0">
        <CardHeader className="border-b">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-10 shrink-0 items-center justify-center rounded-xl"
            >
              <Bell className="size-5" />
            </span>
            <h2 className="flex items-center gap-2 text-[17px] leading-snug font-semibold">
              การแจ้งเตือน
              {unreadCount != null && unreadCount > 0 && (
                <Badge variant="danger" className="tabular-nums">
                  {unreadCount > 99 ? '99+' : unreadCount}
                  <span className="sr-only">รายการที่ยังไม่อ่าน</span>
                </Badge>
              )}
            </h2>
          </div>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="min-h-11 md:min-h-9"
            >
              <CheckCheck aria-hidden />
              อ่านทั้งหมด
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto p-0">
          <NotificationCenter
            onOpenPreferences={() => setPrefOpen(true)}
            className="w-full"
            hideHeader
            hideFooter
          />
        </CardContent>
        <CardFooter className="justify-center px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary min-h-11 w-full md:min-h-9"
            onClick={() => setPrefOpen(true)}
          >
            <Settings aria-hidden />
            ตั้งค่าการแจ้งเตือน
          </Button>
        </CardFooter>
      </Card>

      <NotificationPreferencesDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </>
  )
}

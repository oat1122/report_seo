'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Settings } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
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
      <Card className="flex flex-col overflow-hidden rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" />
            การแจ้งเตือน
            {unreadCount != null && unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 size-3.5" />
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
        <CardFooter className="justify-center border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full text-xs"
            onClick={() => setPrefOpen(true)}
          >
            <Settings className="mr-1 size-3.5" />
            ตั้งค่าการแจ้งเตือน
          </Button>
        </CardFooter>
      </Card>

      <NotificationPreferencesDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </>
  )
}

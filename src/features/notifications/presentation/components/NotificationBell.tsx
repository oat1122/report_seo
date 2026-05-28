'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUnreadCount } from '../hooks/useNotifications'
import { NotificationCenter } from './NotificationCenter'
import { NotificationPreferencesDialog } from './NotificationPreferencesDialog'

export function NotificationBell() {
  const { data: unreadCount } = useUnreadCount()
  const [prefOpen, setPrefOpen] = useState(false)

  const displayCount =
    unreadCount != null && unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : null

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label="การแจ้งเตือน">
            <Bell className="size-5" />
            {displayCount && (
              <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {displayCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
          <NotificationCenter onOpenPreferences={() => setPrefOpen(true)} />
        </PopoverContent>
      </Popover>

      <NotificationPreferencesDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </>
  )
}

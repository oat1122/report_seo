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
          <Button
            variant="ghost"
            size="icon"
            className="border-glass-border relative rounded-[14px] border bg-white/60 backdrop-blur-md hover:bg-white/85 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label={displayCount ? `การแจ้งเตือน (ยังไม่อ่าน ${displayCount})` : 'การแจ้งเตือน'}
          >
            <Bell className="size-[18px]" />
            {displayCount && (
              <span className="bg-neon-pink absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-semibold text-white tabular-nums dark:border-zinc-900">
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

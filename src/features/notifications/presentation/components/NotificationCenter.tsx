'use client'

import { AlertCircle, BellOff, CheckCheck, Loader2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AnimatePresence } from '@/components/motion'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'

interface NotificationCenterProps {
  onOpenPreferences: () => void
  className?: string
  /** คลาสของกล่องรายการ (เช่น ปรับ max-height เมื่อวางเป็น panel) */
  listClassName?: string
  hideHeader?: boolean
  hideFooter?: boolean
}

export function NotificationCenter({
  onOpenPreferences,
  className,
  listClassName,
  hideHeader,
  hideFooter,
}: NotificationCenterProps) {
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.pages.flatMap((p) => p.data) ?? []
  const isEmpty = !isLoading && !isError && notifications.length === 0

  const loadMoreButton = hasNextPage ? (
    <Button
      variant="soft"
      size="sm"
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}
      className={cn(hideFooter && 'w-full')}
    >
      {isFetchingNextPage && <Loader2 aria-hidden className="animate-spin" />}
      โหลดเพิ่มเติม
    </Button>
  ) : null

  return (
    <div className={cn('flex flex-col', !hideHeader && 'w-80 sm:w-96', className)}>
      {!hideHeader && (
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <h3 className="text-[15px] font-semibold">การแจ้งเตือน</h3>
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
      )}

      {/* List */}
      <div className={cn('max-h-96 overflow-y-auto', !hideHeader && 'p-2', listClassName)}>
        {isLoading && (
          <div className="flex items-center justify-center py-8" role="status">
            <Loader2 aria-hidden className="text-text-secondary size-5 animate-spin" />
            <span className="sr-only">กำลังโหลดการแจ้งเตือน</span>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-2 px-4 py-6 text-center text-[13px]"
          >
            <AlertCircle aria-hidden className="text-danger-strong size-5" />
            <p className="text-text-secondary">โหลดการแจ้งเตือนไม่สำเร็จ ลองใหม่อีกครั้ง</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              ลองอีกครั้ง
            </Button>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <BellOff aria-hidden className="text-muted-foreground size-7" />
            <p className="text-text-secondary text-sm">ยังไม่มีการแจ้งเตือน</p>
          </div>
        )}

        {notifications.length > 0 && (
          <ul className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markAsRead.mutate(id)}
                  onDelete={(id) => deleteNotification.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {hideFooter && loadMoreButton && <div className="px-2 pt-2">{loadMoreButton}</div>}
      </div>

      {!hideFooter && (
        <div
          className={cn(
            'border-border/70 flex items-center justify-between gap-2 border-t',
            hideHeader ? 'pt-2.5' : 'px-3 py-2',
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary -ml-1"
            onClick={onOpenPreferences}
          >
            <Settings aria-hidden />
            ตั้งค่าการแจ้งเตือน
          </Button>
          {loadMoreButton}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ahrefsProposalMetadataSchema } from '@/schemas/ahrefsSync'
import type { Notification } from '../../domain/Notification'
import { NOTIFICATION_TYPES } from '../../domain/NotificationTypes'

// lazy + concrete path — เลี่ยง cycle และไม่ดึง server barrel ของ feature metrics เข้า client bundle
const AhrefsSyncReviewDialog = dynamic(
  () =>
    import('@/features/metrics/presentation/components/AhrefsSyncReviewDialog').then(
      (m) => m.AhrefsSyncReviewDialog,
    ),
  { ssr: false },
)

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const router = useRouter()
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // ข้อเสนออัปเดตค่า Ahrefs → คลิกเปิด dialog เปรียบเทียบ (ไม่ navigate)
  const proposal =
    notification.type === NOTIFICATION_TYPES.AHREFS_METRICS_PROPOSED
      ? ahrefsProposalMetadataSchema.safeParse(notification.metadata)
      : null

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id)
    }

    if (proposal?.success) {
      setIsReviewOpen(true)
      return
    }

    const url = (notification.metadata as Record<string, unknown> | null)?.url
    if (typeof url === 'string') {
      if (url.startsWith('/')) {
        router.push(url)
      } else {
        window.location.href = url
      }
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleClick()
        }}
        className={cn(
          'group hover:bg-muted/50 flex items-start gap-3 px-4 py-3 transition-colors',
          !notification.isRead && 'bg-muted/30',
        )}
      >
        {/* Unread indicator */}
        <div className="mt-2 flex-shrink-0">
          {!notification.isRead ? (
            <div className="bg-info size-2 rounded-full" />
          ) : (
            <div className="size-2" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-medium">{notification.title}</p>
          {notification.body && (
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.body}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            {notification.actorName && (
              <span className="text-muted-foreground text-xs">{notification.actorName}</span>
            )}
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: th,
              })}
            </span>
          </div>
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {proposal?.success && (
        <AhrefsSyncReviewDialog
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          userId={proposal.data.customerUserId}
          customerName={proposal.data.customerName}
          proposed={proposal.data.proposed}
        />
      )}
    </>
  )
}

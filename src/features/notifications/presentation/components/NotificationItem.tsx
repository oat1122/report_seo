'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  Bell,
  BarChart3,
  ClipboardList,
  MessageSquare,
  PenLine,
  Receipt,
  RefreshCw,
  Trash2,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from '@/components/motion'
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

// ไอคอนตามประเภทการแจ้งเตือน — ประเภทที่ไม่รู้จักใช้กระดิ่ง
const TYPE_ICON: Partial<Record<string, LucideIcon>> = {
  [NOTIFICATION_TYPES.WORK_ITEM_UPDATED]: ClipboardList,
  [NOTIFICATION_TYPES.WORK_ITEM_STATUS_CHANGED]: ClipboardList,
  [NOTIFICATION_TYPES.METRICS_UPDATED]: BarChart3,
  [NOTIFICATION_TYPES.KEYWORD_UPDATED]: BarChart3,
  [NOTIFICATION_TYPES.AHREFS_METRICS_PROPOSED]: RefreshCw,
  [NOTIFICATION_TYPES.PAYMENT_APPROVED]: Receipt,
  [NOTIFICATION_TYPES.PAYMENT_REJECTED]: Receipt,
  [NOTIFICATION_TYPES.PAYMENT_UPLOADED]: Receipt,
  [NOTIFICATION_TYPES.SEO_DEV_ASSIGNED]: UserPlus,
  [NOTIFICATION_TYPES.BLOG_STAGE_SUBMITTED]: PenLine,
  [NOTIFICATION_TYPES.BLOG_CLIENT_RESPONDED]: MessageSquare,
  [NOTIFICATION_TYPES.BLOG_CLIENT_MESSAGE]: MessageSquare,
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const router = useRouter()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const Icon = TYPE_ICON[notification.type] ?? Bell
  const unread = !notification.isRead

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
      <motion.li
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(
          'group relative flex items-start rounded-[14px] transition-colors',
          unread ? 'bg-white/80 dark:bg-white/10' : 'hover:bg-white/60 dark:hover:bg-white/5',
        )}
      >
        <button
          type="button"
          onClick={handleClick}
          className="focus-visible:ring-ring/70 flex min-w-0 flex-1 items-start gap-3 rounded-[14px] p-3 text-left outline-none focus-visible:ring-[3px]"
        >
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[11px]"
          >
            <Icon className="size-[18px]" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13px] leading-snug font-medium">
              {notification.title}
              {unread && <span className="sr-only"> (ยังไม่อ่าน)</span>}
            </span>
            {notification.body && (
              <span className="text-text-secondary line-clamp-2 text-xs leading-relaxed">
                {notification.body}
              </span>
            )}
            <span className="text-text-secondary text-xs">
              {notification.actorName && `${notification.actorName} · `}
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: th,
              })}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 flex-col items-center gap-1 py-2 pr-1.5">
          <span
            aria-hidden
            className={cn('mt-2 size-2 rounded-full', unread ? 'bg-neon-pink' : 'bg-transparent')}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`ลบการแจ้งเตือน “${notification.title}”`}
            className="text-text-secondary hover:text-danger-strong max-sm:size-11 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>
      </motion.li>

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

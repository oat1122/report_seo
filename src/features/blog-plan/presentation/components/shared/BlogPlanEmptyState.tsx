'use client'

import { ChevronLeft, FileText, MessageSquare, Plus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatMonthLabel } from './blog-plan-view'

interface BlogPlanEmptyStateProps {
  year: number
  month: number
  canManage: boolean
  /** null = ยังโหลดจำนวนบทความเดือนก่อนไม่เสร็จ */
  previousMonthCount: number | null
  writerName: string | null
  quota: number
  onGoPreviousMonth: () => void
  onMessageWriter: () => void
  onCreateArticle: () => void
}

export function BlogPlanEmptyState({
  year,
  month,
  canManage,
  previousMonthCount,
  writerName,
  quota,
  onGoPreviousMonth,
  onMessageWriter,
  onCreateArticle,
}: BlogPlanEmptyStateProps) {
  const previous = new Date(year, month - 2, 1)
  const previousLabel = formatMonthLabel(previous.getFullYear(), previous.getMonth() + 1)

  return (
    <div className="flex flex-col gap-4">
      <Card className="items-center gap-5 px-6 py-12 text-center sm:px-8 sm:py-14">
        <span
          aria-hidden
          className="bg-info-subtle text-info-strong flex size-16 items-center justify-center rounded-[20px]"
        >
          <FileText className="size-7" strokeWidth={1.8} />
        </span>

        <div className="flex max-w-md flex-col gap-2">
          <h2 className="text-xl leading-snug font-semibold">
            {formatMonthLabel(year, month)}ยังไม่มีบทความ
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {canManage
              ? 'ยังไม่ได้วางแผนหัวข้อของเดือนนี้ กด “เพิ่มบทความ” เพื่อเริ่มเสนอหัวข้อให้ลูกค้า'
              : 'ตอนนี้คุณยังไม่ต้องทำอะไร ทีมเขียนจะวางแผนหัวข้อแล้วส่งมาให้ดูที่หน้านี้ พอมีของส่งมา คุณจะได้รับแจ้งเตือนทันที'}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          {canManage && (
            <Button className="h-11 rounded-[12px] px-4" onClick={onCreateArticle}>
              <Plus className="size-4" />
              เพิ่มบทความ
            </Button>
          )}
          <Button
            variant={canManage ? 'outline' : 'default'}
            className="h-11 rounded-[12px] px-4"
            onClick={onGoPreviousMonth}
          >
            <ChevronLeft className="size-4" />
            ดู{previousLabel}
            {previousMonthCount !== null && previousMonthCount > 0
              ? ` (มี ${previousMonthCount} บทความ)`
              : ''}
          </Button>
          {!canManage && (
            <Button
              variant="outline"
              className="h-11 rounded-[12px] px-4"
              onClick={onMessageWriter}
            >
              <MessageSquare className="size-4" />
              ทักทีมเขียน
            </Button>
          )}
        </div>
      </Card>

      {writerName && (
        <div className="border-glass-border bg-glass-tile flex flex-wrap items-center gap-3 rounded-2xl border px-4.5 py-3.5">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-9 items-center justify-center rounded-[10px]"
          >
            <UserRound className="size-4" />
          </span>
          <div className="flex flex-col gap-px">
            <span className="text-sm font-medium">{writerName}</span>
            <span className="text-text-secondary text-xs">
              นักเขียนที่ดูแลบทความของคุณ
              {quota > 0 ? ` · แพ็กเกจเดือนละ ${quota} บทความ` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { ChevronLeft, FileText, MessageSquare, Plus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-col gap-5">
      <div className="border-border bg-muted/50 flex flex-col items-center gap-5 rounded-2xl border border-dashed px-8 py-14 text-center">
        <span className="bg-card ring-border flex size-18 items-center justify-center rounded-full ring-1">
          <FileText className="text-info size-7.5" strokeWidth={1.8} />
        </span>

        <div className="flex max-w-115 flex-col gap-2">
          <h2 className="text-xl leading-7 font-semibold">
            {formatMonthLabel(year, month)}ยังไม่มีบทความ
          </h2>
          <p className="text-muted-foreground text-sm leading-6">
            {canManage
              ? 'ยังไม่ได้วางแผนหัวข้อของเดือนนี้ กด “เพิ่มบทความ” เพื่อเริ่มเสนอหัวข้อให้ลูกค้า'
              : 'ตอนนี้คุณยังไม่ต้องทำอะไร ทีมเขียนจะวางแผนหัวข้อแล้วส่งมาให้ดูที่หน้านี้ พอมีของส่งมา คุณจะได้รับแจ้งเตือนทันที'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {canManage && (
            <Button className="min-h-11" onClick={onCreateArticle}>
              <Plus className="mr-1.5 size-4" />
              เพิ่มบทความ
            </Button>
          )}
          <Button
            variant={canManage ? 'outline' : 'default'}
            className="min-h-11"
            onClick={onGoPreviousMonth}
          >
            <ChevronLeft className="mr-1.5 size-4" />
            ดู{previousLabel}
            {previousMonthCount !== null && previousMonthCount > 0
              ? ` (มี ${previousMonthCount} บทความ)`
              : ''}
          </Button>
          {!canManage && (
            <Button variant="outline" className="min-h-11" onClick={onMessageWriter}>
              <MessageSquare className="mr-1.5 size-4" />
              ทักทีมเขียน
            </Button>
          )}
        </div>
      </div>

      {writerName && (
        <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-xl border px-4.5 py-3.5">
          <span className="bg-info/12 text-info flex size-8.5 items-center justify-center rounded-lg">
            <UserRound className="size-4" />
          </span>
          <div className="flex flex-col gap-px">
            <span className="text-sm font-medium">{writerName}</span>
            <span className="text-muted-foreground text-xs">
              นักเขียนที่ดูแลบทความของคุณ
              {quota > 0 ? ` · แพ็กเกจเดือนละ ${quota} บทความ` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

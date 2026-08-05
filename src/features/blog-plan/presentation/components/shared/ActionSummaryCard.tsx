'use client'

import { ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/date'
import { daysUntil, getCurrentStage } from './blog-plan-view'
import type { BlogArticle } from '../../../domain/BlogArticle'

interface ActionSummaryCardProps {
  /** บทความที่ "ถึงคิวเรา" เท่านั้น */
  articles: BlogArticle[]
  /** id ของ section แรกสำหรับปุ่มเลื่อนลงไป */
  targetId: string
  canManage: boolean
  quota: number
  used: number
  writerName: string | null
}

export function ActionSummaryCard({
  articles,
  targetId,
  canManage,
  quota,
  used,
  writerName,
}: ActionSummaryCardProps) {
  const nearestDue = articles
    .map((article) => getCurrentStage(article)?.dueDate ?? null)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0]
  const remainingDays = nearestDue ? daysUntil(nearestDue) : null

  return (
    <div className="bg-primary text-primary-foreground flex min-w-65 flex-col justify-between gap-3.5 rounded-xl p-4.5">
      <div className="flex flex-col gap-1.5">
        <Badge className="bg-secondary text-secondary-foreground w-fit">
          {articles.length > 0 ? 'ถึงคิวคุณแล้ว' : 'ยังไม่มีงานค้าง'}
        </Badge>
        <strong className="text-3xl leading-10 font-semibold tabular-nums">
          {articles.length} เรื่อง
        </strong>
        <p className="text-primary-foreground/70 text-sm leading-5">
          {articles.length === 0
            ? 'ตอนนี้ไม่มีอะไรรอคุณอยู่ ไว้มีงานเข้ามาจะแจ้งเตือนให้ทันที'
            : canManage
              ? 'ส่งงานขั้นตอนที่ค้างให้ลูกค้า แผนเดือนนี้จะได้เดินต่อ'
              : 'อ่านงานที่ทีมส่งมา แล้วกดอนุมัติหรือขอแก้ไข ทีมถึงจะทำต่อได้'}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {remainingDays !== null && nearestDue && (
          <div className="bg-warning/20 flex items-center gap-2 rounded-lg px-3 py-2.5">
            <Clock className="text-warning size-4 shrink-0" />
            <span className="text-warning text-xs font-medium">
              {remainingDays < 0
                ? `เลยกำหนด ${formatShortDate(nearestDue)} มา ${-remainingDays} วัน`
                : `ตอบภายใน ${formatShortDate(nearestDue)} — เหลืออีก ${remainingDays} วัน`}
            </span>
          </div>
        )}

        {articles.length > 0 && (
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 min-h-11"
          >
            <a href={`#${targetId}`}>
              ไปดูเรื่องที่ต้องทำ
              <ArrowRight className="ml-1.5 size-4" />
            </a>
          </Button>
        )}

        <div className="text-primary-foreground/55 flex items-center justify-between text-xs">
          <span className="tabular-nums">
            ใช้ไป {used} / {quota > 0 ? quota : '—'} บทความ
          </span>
          {writerName && <span>ผู้เขียน: {writerName}</span>}
        </div>
      </div>
    </div>
  )
}

'use client'

import { ArrowDown, BellRing, CircleCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

/** แถบสรุปสีเข้มบนหัวลิสต์ — บอกทันทีว่าตอนนี้มีกี่เรื่องที่รอเราอยู่ */
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
  const hasWork = articles.length > 0
  const Icon = hasWork ? BellRing : CircleCheck

  return (
    <div className="bg-primary text-primary-foreground flex flex-col gap-3 rounded-[14px] p-3.5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <strong className="text-sm font-semibold">
            {hasWork ? (
              <>
                ถึงคิวคุณแล้ว <span className="tabular-nums">{articles.length}</span> เรื่อง
              </>
            ) : (
              'ยังไม่มีงานค้าง'
            )}
          </strong>
          <span className="text-primary-foreground/75 text-xs leading-snug">
            {!hasWork
              ? 'ตอนนี้ไม่มีอะไรรอคุณอยู่ ไว้มีงานเข้ามาจะแจ้งเตือนให้ทันที'
              : canManage
                ? 'ส่งงานขั้นตอนที่ค้างให้ลูกค้า แผนเดือนนี้จะได้เดินต่อ'
                : 'อ่านงานที่ทีมส่งมา แล้วกดอนุมัติหรือขอแก้ไข ทีมถึงจะทำต่อได้'}
          </span>
        </div>
      </div>

      {remainingDays !== null && nearestDue && (
        <span
          className={cn(
            'flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            remainingDays < 0
              ? 'bg-danger-subtle text-danger-strong'
              : 'bg-warning-subtle text-warning-text',
          )}
        >
          <Clock aria-hidden className="size-3.5 shrink-0" />
          {remainingDays < 0
            ? `เลยกำหนด ${formatShortDate(nearestDue)} มา ${-remainingDays} วัน`
            : `ตอบภายใน ${formatShortDate(nearestDue)} — เหลืออีก ${remainingDays} วัน`}
        </span>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-primary-foreground/75 text-xs tabular-nums">
          ใช้ไป {used} / {quota > 0 ? quota : '—'} บทความ
          {writerName ? ` · ${writerName}` : ''}
        </span>
        {hasWork && (
          <Button
            asChild
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11 rounded-[10px] px-3 text-[13px] lg:hidden"
          >
            <a href={`#${targetId}`}>
              ไปดูเรื่องที่ต้องทำ
              <ArrowDown aria-hidden className="size-3.5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

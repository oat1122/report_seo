'use client'

import type { CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { getCurrentStage, groupArticle } from './blog-plan-view'
import { buildStageWindows } from '../../../domain/policies/stage-schedule'
import type { BlogArticle } from '../../../domain/BlogArticle'

/** tick บนแกนวัน — ทุก 5 วัน แล้วปิดท้ายด้วยวันสุดท้ายของเดือน */
function buildTicks(daysInMonth: number): number[] {
  const ticks: number[] = []
  for (let day = 1; day <= daysInMonth; day += 5) ticks.push(day)
  if (ticks[ticks.length - 1] !== daysInMonth) ticks.push(daysInMonth)
  return ticks
}

interface MonthTimelineCardProps {
  articles: BlogArticle[]
  year: number
  month: number
  canManage: boolean
  canRespond: boolean
}

export function MonthTimelineCard({
  articles,
  year,
  month,
  canManage,
  canRespond,
}: MonthTimelineCardProps) {
  const monthStart = new Date(year, month - 1, 1).getTime()
  const monthEnd = new Date(year, month, 1).getTime()
  const span = monthEnd - monthStart
  const daysInMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayPercent = isCurrentMonth ? toPercent(today.getTime(), monthStart, span) : null

  const clientTurns = articles.filter(
    (article) => article.status === 'WAITING_CLIENT' && getCurrentStage(article) !== null,
  ).length

  return (
    <Card
      role="region"
      aria-labelledby="blog-timeline-title"
      className="flex min-w-0 flex-col gap-4 px-5 py-5 sm:px-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="blog-timeline-title" className="text-[17px] font-semibold">
            ไทม์ไลน์ทั้งเดือน
          </h2>
          <p className="text-text-secondary text-[13px]">
            ใครถือบอลอยู่ในแต่ละช่วง — {articles.length} บทความ
            {clientTurns > 0 ? ` · รอฝั่งลูกค้า ${clientTurns} เรื่อง` : ''}
          </p>
        </div>

        <ul
          aria-label="คำอธิบายสี"
          className="text-text-secondary flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs"
        >
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="bg-info h-2.5 w-3.5 rounded-[3px]" />
            ทีมเขียน
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="bg-secondary h-2.5 w-3.5 rounded-[3px]" />
            ลูกค้า
          </li>
          {isCurrentMonth && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="bg-neon-pink h-3 w-0.5 rounded-full" />
              วันนี้
            </li>
          )}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-x-3.5 gap-y-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-center">
        <span aria-hidden className="hidden sm:block" />
        <div aria-hidden className="text-muted-foreground relative h-4 text-[11px]">
          {buildTicks(daysInMonth).map((day) => (
            <span
              key={day}
              className="absolute top-0"
              style={
                day === daysInMonth ? { right: 0 } : { left: `${((day - 1) / daysInMonth) * 100}%` }
              }
            >
              {day}
            </span>
          ))}
          {todayPercent !== null && (
            <span
              className="bg-neon-pink absolute top-1 size-2 -translate-x-1/2 rounded-full"
              style={{ left: `${todayPercent}%` }}
            />
          )}
        </div>

        {articles.map((article) => (
          <TimelineRow
            key={article.id}
            article={article}
            monthStart={monthStart}
            span={span}
            daysInMonth={daysInMonth}
            todayPercent={todayPercent}
            canManage={canManage}
            canRespond={canRespond}
          />
        ))}
      </div>
    </Card>
  )
}

function TimelineRow({
  article,
  monthStart,
  span,
  daysInMonth,
  todayPercent,
  canManage,
  canRespond,
}: {
  article: BlogArticle
  monthStart: number
  span: number
  daysInMonth: number
  todayPercent: number | null
  canManage: boolean
  canRespond: boolean
}) {
  const group = groupArticle(article.status, canManage, canRespond)
  const current = getCurrentStage(article)
  const windows = buildStageWindows(article.startDate, article.stages).flatMap((window) => {
    const left = toPercent(window.start.getTime(), monthStart, span)
    const right = toPercent(window.end.getTime(), monthStart, span)
    if (right <= 0 || left >= 100) return []
    return [{ ...window, left, width: Math.max(right - left, 1.5) }]
  })

  const finishedAt = article.stages.find((stage) => stage.stageCode === 'SUBMIT_FINAL')?.submittedAt

  return (
    <>
      <div className="mt-1 flex min-w-0 items-center gap-2 sm:mt-0">
        <span
          aria-hidden
          className={cn(
            'size-2 shrink-0 rounded-full',
            group === 'mine' && 'bg-secondary motion-safe:animate-pulse',
            group === 'done' && 'bg-success',
            group === 'waiting' && 'bg-border',
          )}
        />
        <span
          className={cn(
            'truncate text-[13px] font-medium',
            group === 'done' && 'text-text-secondary',
          )}
          title={article.title}
        >
          {article.title}
        </span>
      </div>

      {/* เส้นแบ่งวันจาง ๆ ใต้แถบ — คำนวณจากจำนวนวันจริงของเดือน */}
      <div
        className="bg-muted/70 relative h-7 rounded-lg bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(var(--day)_-_1px),var(--border)_calc(var(--day)_-_1px),var(--border)_var(--day))] dark:bg-white/5"
        style={{ '--day': `${100 / daysInMonth}%` } as CSSProperties}
      >
        {article.status === 'PUBLISHED' ? (
          <span className="text-success absolute inset-y-0 left-2 flex items-center gap-1.5 text-xs font-medium">
            <Check aria-hidden className="size-3.5" />
            ส่งครบแล้ว {formatShortDate(finishedAt)}
          </span>
        ) : windows.length === 0 ? (
          <span className="text-text-secondary absolute inset-y-0 left-2 flex items-center text-xs">
            ยังไม่กำหนดวัน
          </span>
        ) : (
          windows.map((window) => {
            const isCurrent = current?.definition.code === window.stageCode
            const isClient = window.actor === 'CLIENT'
            const who = isClient ? 'ลูกค้า' : 'ทีมเขียน'

            return (
              <span
                key={window.stageCode}
                title={`${who} · ${formatShortDate(window.start)} – ${formatShortDate(window.end)}`}
                className={cn(
                  'absolute flex items-center justify-center overflow-hidden rounded-md text-[11px] font-medium whitespace-nowrap',
                  isCurrent
                    ? 'text-secondary-foreground ring-foreground/70 inset-y-0.5 ring-2'
                    : 'inset-y-1.5',
                  isClient
                    ? isCurrent
                      ? 'bg-secondary'
                      : 'bg-secondary/40'
                    : isCurrent
                      ? 'bg-info'
                      : 'bg-info/40',
                )}
                style={{
                  left: `calc(${window.left}% + 1px)`,
                  width: `calc(${window.width}% - 2px)`,
                }}
              >
                {isCurrent && window.width > 10 && (isClient ? 'ถึงคิวลูกค้า' : 'ทีมกำลังทำ')}
              </span>
            )
          })
        )}

        {todayPercent !== null && (
          <span
            aria-hidden
            className="bg-neon-pink absolute -inset-y-1.5 w-0.5 rounded-full"
            style={{ left: `${todayPercent}%` }}
          />
        )}
      </div>
    </>
  )
}

function toPercent(time: number, monthStart: number, span: number): number {
  return Math.min(100, Math.max(0, ((time - monthStart) / span) * 100))
}
